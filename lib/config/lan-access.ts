type EnvLike = Record<string, string | undefined>;

const TRUE_ENV_VALUES = new Set(['1', 'true', 'yes', 'y', 'on', 'enabled', 'enable']);

export const LAN_ACCESS_ENV_KEYS = ['ALLOW_LAN_ACCESS', 'NEXT_PUBLIC_ALLOW_LAN_ACCESS'] as const;
export const LAN_ALLOWED_DEV_ORIGINS_ENV_KEYS = [
  'LAN_ALLOWED_DEV_ORIGINS',
  'NEXT_PUBLIC_LAN_ALLOWED_DEV_ORIGINS',
] as const;

export const DEFAULT_LAN_ALLOWED_DEV_ORIGINS = [
  '10.*.*.*',
  ...Array.from({ length: 16 }, (_, index) => `172.${16 + index}.*.*`),
  '192.168.*.*',
] as const;

export function parseBooleanEnv(value: string | undefined | null): boolean {
  if (!value) {
    return false;
  }

  return TRUE_ENV_VALUES.has(value.trim().toLowerCase());
}

export function isLanAccessEnabled(env: EnvLike = process.env): boolean {
  return LAN_ACCESS_ENV_KEYS.some((key) => parseBooleanEnv(env[key]));
}

function normalizeAllowedOriginHost(rawOrigin: string): string | null {
  const trimmed = rawOrigin.trim();

  if (!trimmed) {
    return null;
  }

  try {
    const hostname = new URL(trimmed).hostname;
    if (hostname) {
      return hostname.toLowerCase();
    }
  } catch {
    // Fall through to host[:port] parsing.
  }

  const withoutPort = trimmed.match(/^([^:/\s]+):\d+$/)?.[1] ?? trimmed;
  return withoutPort.toLowerCase();
}

export function parseLanAllowedDevOrigins(value: string | undefined | null): string[] {
  if (!value) {
    return [];
  }

  const origins = value
    .split(/[\s,]+/)
    .map(normalizeAllowedOriginHost)
    .filter((origin): origin is string => Boolean(origin));

  return [...new Set(origins)];
}

export function getLanAllowedDevOrigins(env: EnvLike = process.env): string[] {
  if (!isLanAccessEnabled(env)) {
    return [];
  }

  const customOrigins = LAN_ALLOWED_DEV_ORIGINS_ENV_KEYS.flatMap((key) =>
    parseLanAllowedDevOrigins(env[key])
  );

  return [...new Set([...DEFAULT_LAN_ALLOWED_DEV_ORIGINS, ...customOrigins])];
}
