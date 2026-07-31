type EnvLike = Record<string, string | undefined>;

export function isVercelDeployment(env: EnvLike = process.env): boolean {
  return env.VERCEL === '1' || Boolean(env.VERCEL_ENV);
}

export function isCloudflareDeployment(env: EnvLike = process.env): boolean {
  return (
    env.CF_PAGES === '1' ||
    Boolean(env.CF_PAGES_URL) ||
    Boolean(env.CLOUDFLARE_ACCOUNT_ID) ||
    Boolean(env.CF_ACCOUNT_ID) ||
    Boolean(env.WORKERS_CI)
  );
}

export function shouldEnableVercelAnalytics(env: EnvLike = process.env): boolean {
  return isVercelDeployment(env) && !isCloudflareDeployment(env);
}
