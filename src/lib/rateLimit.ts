import { LRUCache } from "lru-cache";

const rateLimitOptions = {
  max: 500, // max 500 olika IP
  ttl: 60 * 1000, // 1 minut
};

const tokenCache = new LRUCache<string, number>(rateLimitOptions);

export function rateLimit(ip: string, limit: number) {
  const tokenCount = tokenCache.get(ip) || 0;
  if (tokenCount >= limit) {
    return false;
  }
  tokenCache.set(ip, tokenCount + 1);
  return true;
}
