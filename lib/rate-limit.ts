import { LRUCache } from 'lru-cache';

type Options = {
  uniqueTokenPerInterval?: number;
  interval?: number;
};

export function rateLimit(options?: Options) {
  const tokenCache = new LRUCache({
    max: options?.uniqueTokenPerInterval || 500,
    ttl: options?.interval || 60000,
  });

  return {
    check: (request: Request, limit: number) => {
      const token = request.headers.get('x-forwarded-for') || 'anonymous';
      const tokenCount = (tokenCache.get(token) as number[]) || [0];
      const currentUsage = tokenCount[0];
      const isRateLimited = currentUsage >= limit;

      if (!isRateLimited) {
        tokenCache.set(token, [currentUsage + 1]);
      }

      return new Promise((resolve, reject) => {
        if (isRateLimited) {
          reject();
        } else {
          resolve({
            remaining: limit - (currentUsage + 1),
          });
        }
      });
    },
  };
}