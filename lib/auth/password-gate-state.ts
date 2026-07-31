import type { AuthSession } from '@/lib/store/auth-store';

export type PasswordGateStateResolution =
  | {
      action: 'unlock-session';
      session: AuthSession;
      persistSession: boolean;
    }
  | {
      action: 'unlock-public';
    }
  | {
      action: 'lock';
      clearMirroredSession: boolean;
    };

export function resolvePasswordGateState({
  hasAuth,
  serverSession,
  mirroredSession,
  persistSession,
}: {
  hasAuth: boolean;
  serverSession: AuthSession | null;
  mirroredSession: AuthSession | null;
  persistSession: boolean;
}): PasswordGateStateResolution {
  if (serverSession) {
    return {
      action: 'unlock-session',
      session: serverSession,
      persistSession,
    };
  }

  if (mirroredSession) {
    return {
      action: 'lock',
      clearMirroredSession: true,
    };
  }

  if (!hasAuth) {
    return { action: 'unlock-public' };
  }

  return {
    action: 'lock',
    clearMirroredSession: false,
  };
}
