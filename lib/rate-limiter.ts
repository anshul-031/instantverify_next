import { LRUCache } from 'lru-cache';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface Options {
  uniqueTokenPerInterval?: number;
  interval?: number;
  limit?: number;
}

export class RateLimiter {
  private tokenCache: LRUCache<string, number[]>;
  private interval: number;
  private limit: number;

  constructor(options: Options = {}) {
    this.tokenCache = new LRUCache({
      max: options.uniqueTokenPerInterval || 500,
      ttl: options.interval || 60000,
    });
    this.interval = options.interval || 60000;
    this.limit = options.limit || 10;
  }

  public async check(request: NextRequest): Promise<NextResponse | null> {
    const ip = request.ip || 'anonymous';
    const tokenCount = (this.tokenCache.get(ip) as number[]) || [0];
    const currentUsage = tokenCount[0];
    const isRateLimited = currentUsage >= this.limit;

    if (isRateLimited) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Try again in ${Math.ceil(this.interval / 1000)} seconds`,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': `${Math.ceil(this.interval / 1000)}`,
          },
        }
      );
    }

    this.tokenCache.set(ip, [currentUsage + 1]);
    return null;
  }
}