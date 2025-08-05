/**
 * 工具缓存系统
 * 提供高效的数据缓存和管理功能
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
  hits: number;
}

interface CacheOptions {
  maxSize?: number;
  defaultTTL?: number; // Time to live in milliseconds
  enableCompression?: boolean;
}

class ToolCache {
  private cache = new Map<string, CacheItem<any>>();
  private readonly maxSize: number;
  private readonly defaultTTL: number;
  private readonly enableCompression: boolean;

  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize || 100;
    this.defaultTTL = options.defaultTTL || 5 * 60 * 1000; // 5 minutes
    this.enableCompression = options.enableCompression || false;
  }

  /**
   * 设置缓存项
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const expiry = now + (ttl || this.defaultTTL);

    // 如果缓存已满，删除最少使用的项
    if (this.cache.size >= this.maxSize) {
      this.evictLeastUsed();
    }

    const cacheItem: CacheItem<T> = {
      data: this.enableCompression ? this.compress(data) : data,
      timestamp: now,
      expiry,
      hits: 0,
    };

    this.cache.set(key, cacheItem);
  }

  /**
   * 获取缓存项
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // 检查是否过期
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    // 更新访问次数
    item.hits++;
    
    return this.enableCompression ? this.decompress(item.data) : item.data;
  }

  /**
   * 检查缓存是否存在且有效
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * 删除缓存项
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 获取缓存统计信息
   */
  getStats() {
    const now = Date.now();
    let validItems = 0;
    let expiredItems = 0;
    let totalHits = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        expiredItems++;
      } else {
        validItems++;
        totalHits += item.hits;
      }
    }

    return {
      totalItems: this.cache.size,
      validItems,
      expiredItems,
      totalHits,
      hitRate: validItems > 0 ? totalHits / validItems : 0,
      memoryUsage: this.estimateMemoryUsage(),
    };
  }

  /**
   * 清理过期项
   */
  cleanup(): number {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  /**
   * 删除最少使用的缓存项
   */
  private evictLeastUsed(): void {
    let leastUsedKey: string | null = null;
    let leastHits = Infinity;

    for (const [key, item] of this.cache.entries()) {
      if (item.hits < leastHits) {
        leastHits = item.hits;
        leastUsedKey = key;
      }
    }

    if (leastUsedKey) {
      this.cache.delete(leastUsedKey);
    }
  }

  /**
   * 压缩数据（简单的JSON压缩）
   */
  private compress<T>(data: T): string {
    try {
      return JSON.stringify(data);
    } catch {
      return data as any;
    }
  }

  /**
   * 解压数据
   */
  private decompress<T>(compressedData: any): T {
    try {
      return typeof compressedData === 'string' 
        ? JSON.parse(compressedData) 
        : compressedData;
    } catch {
      return compressedData;
    }
  }

  /**
   * 估算内存使用量
   */
  private estimateMemoryUsage(): number {
    let size = 0;
    
    for (const [key, item] of this.cache.entries()) {
      size += key.length * 2; // UTF-16 字符
      size += JSON.stringify(item).length * 2;
    }
    
    return size; // bytes
  }
}

// 创建全局缓存实例
export const toolCache = new ToolCache({
  maxSize: 200,
  defaultTTL: 10 * 60 * 1000, // 10 minutes
  enableCompression: true,
});

// 专门用于工具结果的缓存
export const resultCache = new ToolCache({
  maxSize: 50,
  defaultTTL: 30 * 60 * 1000, // 30 minutes
  enableCompression: true,
});

// 用于API响应的缓存
export const apiCache = new ToolCache({
  maxSize: 100,
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  enableCompression: false,
});

/**
 * 缓存装饰器工厂
 */
export function withCache<T extends (...args: any[]) => any>(
  cache: ToolCache,
  keyGenerator: (...args: Parameters<T>) => string,
  ttl?: number
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: Parameters<T>) {
      const cacheKey = keyGenerator(...args);
      
      // 尝试从缓存获取
      const cachedResult = cache.get(cacheKey);
      if (cachedResult !== null) {
        return cachedResult;
      }

      // 执行原方法
      const result = await method.apply(this, args);
      
      // 存储到缓存
      cache.set(cacheKey, result, ttl);
      
      return result;
    };
  };
}

/**
 * 异步缓存工具函数
 */
export async function cacheAsync<T>(
  key: string,
  fetcher: () => Promise<T>,
  cache: ToolCache = toolCache,
  ttl?: number
): Promise<T> {
  // 尝试从缓存获取
  const cached = cache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // 执行异步操作
  const result = await fetcher();
  
  // 存储到缓存
  cache.set(key, result, ttl);
  
  return result;
}

/**
 * 批量缓存操作
 */
export class BatchCache {
  private operations: Array<{ key: string; operation: () => Promise<any> }> = [];

  add<T>(key: string, operation: () => Promise<T>): this {
    this.operations.push({ key, operation });
    return this;
  }

  async execute(cache: ToolCache = toolCache, ttl?: number): Promise<Map<string, any>> {
    const results = new Map<string, any>();
    
    // 并行执行所有操作
    const promises = this.operations.map(async ({ key, operation }) => {
      // 检查缓存
      const cached = cache.get(key);
      if (cached !== null) {
        results.set(key, cached);
        return;
      }

      try {
        const result = await operation();
        cache.set(key, result, ttl);
        results.set(key, result);
      } catch (error) {
        console.error(`Batch cache operation failed for key ${key}:`, error);
        results.set(key, null);
      }
    });

    await Promise.all(promises);
    
    // 清空操作队列
    this.operations = [];
    
    return results;
  }
}

/**
 * 自动清理任务
 */
export function startCacheCleanup(interval: number = 5 * 60 * 1000) {
  const cleanup = () => {
    const cleaned1 = toolCache.cleanup();
    const cleaned2 = resultCache.cleanup();
    const cleaned3 = apiCache.cleanup();
    
    if (cleaned1 + cleaned2 + cleaned3 > 0) {
      console.log(`Cache cleanup: removed ${cleaned1 + cleaned2 + cleaned3} expired items`);
    }
  };

  // 立即执行一次
  cleanup();
  
  // 设置定时清理
  return setInterval(cleanup, interval);
}

// 在浏览器环境中自动启动清理任务
if (typeof window !== 'undefined') {
  startCacheCleanup();
}