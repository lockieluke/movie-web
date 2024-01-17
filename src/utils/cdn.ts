import { conf } from "@/setup/config";
import { getLoadbalancedProxyFetchUrl } from "@/utils/providers";

export function processCdnLink(url: string): string {
  const parsedUrl = new URL(url);
  const replacements = conf().CDN_REPLACEMENTS;
  for (const [before, after] of replacements) {
    if (parsedUrl.hostname.endsWith(before)) {
      parsedUrl.hostname = after;
      parsedUrl.port = "";
      parsedUrl.protocol = "https://";
      return `${getLoadbalancedProxyFetchUrl}${parsedUrl.toString()}`;
    }
  }

  return url;
}
