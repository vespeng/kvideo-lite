import { NextRequest, NextResponse } from 'next/server';
import {
  authenticateLogin,
  createLoginResponse,
  getPublicAuthConfig,
  ManagedAuthStorageError,
  validatePremiumAccess,
} from '@/lib/server/auth';

export const runtime = 'edge';

export async function GET() {
  try {
    return NextResponse.json(await getPublicAuthConfig());
  } catch (error) {
    if (error instanceof ManagedAuthStorageError) {
      return NextResponse.json(
        { error: 'Managed authentication storage is unavailable' },
        { status: 503 },
      );
    }
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, type } = body || {};

    if (type === 'premium') {
      const valid = await validatePremiumAccess(request, { username, password });
      return NextResponse.json({ valid });
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ valid: false, message: 'Password required' }, { status: 400 });
    }

    const session = await authenticateLogin({ username, password });
    if (!session) {
      return NextResponse.json({ valid: false });
    }

    return createLoginResponse(session, request);
  } catch (error) {
    if (error instanceof ManagedAuthStorageError) {
      return NextResponse.json(
        { valid: false, message: 'Managed authentication storage is unavailable' },
        { status: 503 },
      );
    }
    return NextResponse.json({ valid: false, message: 'Invalid request' }, { status: 400 });
  }
}
