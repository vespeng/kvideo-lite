import { NextRequest } from 'next/server';
import {
  createSessionStatusResponse,
  logoutResponse,
  ManagedAuthStorageError,
} from '@/lib/server/auth';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    return await createSessionStatusResponse(request);
  } catch (error) {
    if (error instanceof ManagedAuthStorageError) {
      return Response.json(
        { authenticated: false, error: 'Managed authentication storage is unavailable' },
        { status: 503 },
      );
    }
    throw error;
  }
}

export async function DELETE(request: NextRequest) {
  return logoutResponse(request);
}
