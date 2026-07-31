import 'server-only';

import type { RuntimeFeatures } from '@/lib/config/runtime-features';
import { isCloudflareDeployment, isVercelDeployment } from '@/lib/config/deployment';

function getRestrictedFeatures(
  deploymentProvider: RuntimeFeatures['deploymentProvider'],
  deploymentProviderLabel: string
): RuntimeFeatures {
  return {
    deploymentProvider,
    deploymentProviderLabel,
    restrictedManagedDeployment: true,
    mediaProxyEnabled: false,
    iptvEnabled: false,
    restrictionSummary: `${deploymentProviderLabel} 托管部署会启用合规模式：关闭外部媒体代理、热链转发和 IPTV 流中继。需要这些能力时请改用 Docker 或传统 Node.js 自托管。`,
  };
}

export function getRuntimeFeatures(): RuntimeFeatures {
  if (isCloudflareDeployment()) {
    return getRestrictedFeatures('cloudflare', 'Cloudflare');
  }

  if (isVercelDeployment()) {
    return getRestrictedFeatures('vercel', 'Vercel');
  }

  return {
    deploymentProvider: 'self-hosted',
    deploymentProviderLabel: '自托管',
    restrictedManagedDeployment: false,
    mediaProxyEnabled: true,
    iptvEnabled: true,
    restrictionSummary: null,
  };
}
