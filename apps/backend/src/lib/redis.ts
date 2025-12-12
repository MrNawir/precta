/**
 * T037: Redis Client
 * Caching and session storage using Bun's native Redis support
 */

interface RedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, options?: { ex?: number }): Promise<void>;
  del(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  expire(key: string, seconds: number): Promise<void>;
  keys(pattern: string): Promise<string[]>;
  incr(key: string): Promise<number>;
  ttl(key: string): Promise<number>;
}

let redisInstance: RedisClient | null = null;

/**
 * Create Redis client using native Bun Redis or fallback to in-memory
 */
async function createRedisClient(): Promise<RedisClient> {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  
  try {
    // Try to use Bun's native Redis (available in Bun 1.1+)
    // @ts-ignore - Bun.Redis may not be typed yet
    if (typeof Bun !== 'undefined' && Bun.Redis) {
      // @ts-ignore
      const client = new Bun.Redis(redisUrl);
      console.log('[Redis] Connected using Bun native Redis');
      return {
        get: (key) => client.get(key),
        set: async (key, value, options) => {
          if (options?.ex) {
            await client.set(key, value, 'EX', options.ex);
          } else {
            await client.set(key, value);
          }
        },
        del: (key) => client.del(key),
        exists: async (key) => (await client.exists(key)) > 0,
        expire: (key, seconds) => client.expire(key, seconds),
        keys: (pattern) => client.keys(pattern),
        incr: (key) => client.incr(key),
        ttl: (key) => client.ttl(key),
      };
    }
  } catch (e) {
    console.warn('[Redis] Bun native Redis not available, using in-memory fallback');
  }
  
  // Fallback to in-memory cache for development
  return createInMemoryCache();
}

/**
 * In-memory cache fallback for development/testing
 */
function createInMemoryCache(): RedisClient {
  const cache = new Map<string, { value: string; expiry?: number }>();
  
  console.log('[Redis] Using in-memory cache (development mode)');
  
  const isExpired = (key: string): boolean => {
    const item = cache.get(key);
    if (!item) return true;
    if (item.expiry && Date.now() > item.expiry) {
      cache.delete(key);
      return true;
    }
    return false;
  };
  
  return {
    get: async (key) => {
      if (isExpired(key)) return null;
      return cache.get(key)?.value ?? null;
    },
    set: async (key, value, options) => {
      const expiry = options?.ex ? Date.now() + (options.ex * 1000) : undefined;
      cache.set(key, { value, expiry });
    },
    del: async (key) => {
      cache.delete(key);
    },
    exists: async (key) => !isExpired(key),
    expire: async (key, seconds) => {
      const item = cache.get(key);
      if (item) {
        item.expiry = Date.now() + (seconds * 1000);
      }
    },
    keys: async (pattern) => {
      const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
      return Array.from(cache.keys()).filter(k => regex.test(k) && !isExpired(k));
    },
    incr: async (key) => {
      const current = parseInt(cache.get(key)?.value || '0', 10);
      const newValue = current + 1;
      const item = cache.get(key);
      cache.set(key, { value: String(newValue), expiry: item?.expiry });
      return newValue;
    },
    ttl: async (key) => {
      const item = cache.get(key);
      if (!item || !item.expiry) return -1;
      const remaining = Math.floor((item.expiry - Date.now()) / 1000);
      return remaining > 0 ? remaining : -2;
    },
  };
}

/**
 * Get or create the Redis client singleton
 */
export async function getRedis(): Promise<RedisClient> {
  if (!redisInstance) {
    redisInstance = await createRedisClient();
  }
  return redisInstance;
}

/**
 * Cache helper with automatic JSON serialization
 */
export const cache = {
  /**
   * Get cached value with automatic JSON parsing
   */
  async get<T>(key: string): Promise<T | null> {
    const redis = await getRedis();
    const value = await redis.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  },
  
  /**
   * Set cached value with automatic JSON serialization
   */
  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const redis = await getRedis();
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    await redis.set(key, serialized, ttlSeconds ? { ex: ttlSeconds } : undefined);
  },
  
  /**
   * Delete cached value
   */
  async del(key: string): Promise<void> {
    const redis = await getRedis();
    await redis.del(key);
  },
  
  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    const redis = await getRedis();
    return redis.exists(key);
  },
  
  /**
   * Get or set (cache-aside pattern)
   */
  async getOrSet<T>(key: string, factory: () => Promise<T>, ttlSeconds?: number): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;
    
    const value = await factory();
    await this.set(key, value, ttlSeconds);
    return value;
  },
};

// Cache key prefixes for organization
export const CACHE_KEYS = {
  doctor: (id: string) => `doctor:${id}`,
  doctorList: (query: string) => `doctors:list:${query}`,
  availability: (doctorId: string, date: string) => `availability:${doctorId}:${date}`,
  session: (id: string) => `session:${id}`,
  rateLimit: (ip: string, endpoint: string) => `ratelimit:${ip}:${endpoint}`,
} as const;

// Default TTL values (in seconds)
export const CACHE_TTL = {
  SHORT: 60,          // 1 minute
  MEDIUM: 300,        // 5 minutes
  LONG: 3600,         // 1 hour
  DAY: 86400,         // 24 hours
} as const;

export type { RedisClient };
