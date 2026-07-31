import test from 'node:test';
import assert from 'node:assert/strict';

import { resolvePasswordGateState } from '@/lib/auth/password-gate-state';
import type { AuthSession } from '@/lib/store/auth-store';

const session: AuthSession = {
  accountId: 'account-1',
  profileId: 'profile-1',
  username: 'alice',
  name: 'Alice',
  role: 'viewer',
  customPermissions: [],
  mode: 'managed',
};

test('PasswordGate unlocks when a server session exists even without a local mirror', () => {
  assert.deepEqual(resolvePasswordGateState({
    hasAuth: true,
    serverSession: session,
    mirroredSession: null,
    persistSession: true,
  }), {
    action: 'unlock-session',
    session,
    persistSession: true,
  });
});

test('PasswordGate clears stale local mirrors without requiring a page reload', () => {
  assert.deepEqual(resolvePasswordGateState({
    hasAuth: true,
    serverSession: null,
    mirroredSession: session,
    persistSession: true,
  }), {
    action: 'lock',
    clearMirroredSession: true,
  });
});

test('PasswordGate unlocks public deployments without auth state', () => {
  assert.deepEqual(resolvePasswordGateState({
    hasAuth: false,
    serverSession: null,
    mirroredSession: null,
    persistSession: true,
  }), {
    action: 'unlock-public',
  });
});

test('PasswordGate remains locked when auth is configured and no valid session exists', () => {
  assert.deepEqual(resolvePasswordGateState({
    hasAuth: true,
    serverSession: null,
    mirroredSession: null,
    persistSession: true,
  }), {
    action: 'lock',
    clearMirroredSession: false,
  });
});
