import { NextResponse } from 'next/server';

export function authenticationRequiredResponse(): NextResponse {
  return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
}
