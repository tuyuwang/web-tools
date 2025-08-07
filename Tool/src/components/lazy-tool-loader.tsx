'use client';

import React, { lazy, Suspense, useState, useEffect, useMemo, memo, useCallback } from 'react';
import { LucideProps } from 'lucide-react';
import { preloadPageIcons } from './dynamic-icon';

// 工具加载器配置
interface ToolLoaderConfig {
  prefetchOnHover?: boolean;
  prefetchDelay?: number;
  cacheTimeout?: number;
  maxCacheSize?: number;
  enablePreloading?: boolean;
}

const defaultConfig: ToolLoaderConfig = {
  prefetchOnHover: true,
  prefetchDelay: 300,
  cacheTimeout: 10 * 60 * 1000, // 10分钟
  maxCacheSize: 20,
  enablePreloading: true
};

// 工具缓存管理
class ToolCache {
  private cache = new Map<string, React.LazyExoticComponent<React.ComponentType<any>>>();
  private timestamps = new Map<string, number>();
  private config: ToolLoaderConfig;

  constructor(config: ToolLoaderConfig = defaultConfig) {
    this.config = { ...defaultConfig, ...config };
  }

  get(key: string) {
    const component = this.cache.get(key);
    if (component) {
      // 更新访问时间
      this.timestamps.set(key, Date.now());
    }
    return component;
  }

  set(key: string, component: React.LazyExoticComponent<React.ComponentType<any>>) {
    // 检查缓存大小限制
    if (this.cache.size >= this.config.maxCacheSize!) {
      this.evictOldest();
    }
    
    this.cache.set(key, component);
    this.timestamps.set(key, Date.now());
  }

  has(key: string) {
    return this.cache.has(key);
  }

  private evictOldest() {
    let oldestKey = '';
    let oldestTime = Date.now();
    
    this.timestamps.forEach((time, key) => {
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
    });
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.timestamps.delete(oldestKey);
    }
  }

  cleanup() {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    this.timestamps.forEach((time, key) => {
      if (now - time > this.config.cacheTimeout!) {
        expiredKeys.push(key);
      }
    });
    
    expiredKeys.forEach(key => {
      this.cache.delete(key);
      this.timestamps.delete(key);
    });
  }

  clear() {
    this.cache.clear();
    this.timestamps.clear();
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.config.maxCacheSize,
      oldestEntry: Math.min(...Array.from(this.timestamps.values())),
      newestEntry: Math.max(...Array.from(this.timestamps.values()))
    };
  }
}

// 全局工具缓存实例
const toolCache = new ToolCache();

// 定期清理缓存
setInterval(() => {
  toolCache.cleanup();
}, 5 * 60 * 1000); // 每5分钟清理一次

// 工具加载器
const createToolLoader = (toolPath: string, fallbackIcons: string[] = []) => {
  return lazy(async () => {
    try {
      // 预加载页面相关图标
      if (fallbackIcons.length > 0) {
        preloadPageIcons(fallbackIcons);
      }
      
      const toolModule = await import(`../app/tools/${toolPath}/page.tsx`);
      return { default: toolModule.default };
    } catch (error) {
      console.error(`Failed to load tool: ${toolPath}`, error);
      // 返回错误组件
      return {
        default: () => (
          <div className="flex items-center justify-center min-h-[200px] text-red-500">
            <div className="text-center">
              <p className="text-lg font-medium">工具加载失败</p>
              <p className="text-sm text-gray-500 mt-1">请刷新页面重试</p>
            </div>
          </div>
        )
      };
    }
  });
};

// 性能监控
class PerformanceMonitor {
  private loadTimes = new Map<string, number>();
  private errors = new Map<string, number>();

  recordLoadTime(toolPath: string, time: number) {
    this.loadTimes.set(toolPath, time);
  }

  recordError(toolPath: string) {
    const count = this.errors.get(toolPath) || 0;
    this.errors.set(toolPath, count + 1);
  }

  getStats() {
    return {
      avgLoadTime: this.getAverageLoadTime(),
      slowestTool: this.getSlowestTool(),
      errorCount: Array.from(this.errors.values()).reduce((sum, count) => sum + count, 0),
      mostProblematicTool: this.getMostProblematicTool()
    };
  }

  private getAverageLoadTime() {
    const times = Array.from(this.loadTimes.values());
    return times.length > 0 ? times.reduce((sum, time) => sum + time, 0) / times.length : 0;
  }

  private getSlowestTool() {
    let slowest = { path: '', time: 0 };
    this.loadTimes.forEach((time, path) => {
      if (time > slowest.time) {
        slowest = { path, time };
      }
    });
    return slowest;
  }

  private getMostProblematicTool() {
    let mostProblematic = { path: '', errors: 0 };
    this.errors.forEach((errors, path) => {
      if (errors > mostProblematic.errors) {
        mostProblematic = { path, errors };
      }
    });
    return mostProblematic;
  }
}

const performanceMonitor = new PerformanceMonitor();

// 优化的加载状态组件
const LoadingSpinner = memo(() => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="relative">
      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      <div className="mt-3 text-sm text-gray-500 text-center">加载中...</div>
    </div>
  </div>
));
LoadingSpinner.displayName = 'LoadingSpinner';

interface LazyToolLoaderProps {
  toolPath: string;
  preloadOnHover?: boolean;
  fallbackIcons?: string[];
  className?: string;
  config?: Partial<ToolLoaderConfig>;
  onLoadStart?: () => void;
  onLoadEnd?: (success: boolean) => void;
  children?: React.ReactNode;
}

export const LazyToolLoader = memo(({
  toolPath,
  preloadOnHover = true,
  fallbackIcons = [],
  className = '',
  config = {},
  onLoadStart,
  onLoadEnd,
  children
}: LazyToolLoaderProps) => {
  const [isPreloading, setIsPreloading] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const finalConfig = useMemo(() => ({ ...defaultConfig, ...config }), [config]);

  // 获取或创建工具组件
  const ToolComponent = useMemo(() => {
    if (!toolCache.has(toolPath)) {
      toolCache.set(toolPath, createToolLoader(toolPath, fallbackIcons));
    }
    return toolCache.get(toolPath)!;
  }, [toolPath, fallbackIcons]);

  // 预加载处理
  const handlePreload = useCallback(() => {
    if (!preloadOnHover || isPreloading || !finalConfig.enablePreloading) return;

    const timeoutId = setTimeout(() => {
      setIsPreloading(true);
      const startTime = performance.now();
      
      onLoadStart?.();
      
      // 触发组件预加载
      import(`../app/tools/${toolPath}/page.tsx`)
        .then(() => {
          const loadTime = performance.now() - startTime;
          performanceMonitor.recordLoadTime(toolPath, loadTime);
          onLoadEnd?.(true);
        })
        .catch((error) => {
          performanceMonitor.recordError(toolPath);
          setLoadError(error);
          onLoadEnd?.(false);
        })
        .finally(() => {
          setIsPreloading(false);
        });
    }, finalConfig.prefetchDelay);

    return () => clearTimeout(timeoutId);
  }, [toolPath, preloadOnHover, isPreloading, finalConfig, onLoadStart, onLoadEnd]);

  // 错误重试
  const retryLoad = useCallback(() => {
    setLoadError(null);
    toolCache.clear();
    window.location.reload();
  }, []);

  // 如果有加载错误，显示错误组件
  if (loadError) {
    return (
      <div className={`min-h-[200px] flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="text-red-500 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">工具加载失败</p>
          <p className="text-sm text-gray-500 mb-3">请检查网络连接或稍后重试</p>
          <button
            onClick={retryLoad}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={className}
      onMouseEnter={handlePreload}
    >
      <Suspense fallback={<LoadingSpinner />}>
        <ToolComponent />
      </Suspense>
      {children}
    </div>
  );
});
LazyToolLoader.displayName = 'LazyToolLoader';

// 导出工具缓存管理功能
export const getToolCacheStats = () => toolCache.getStats();
export const clearToolCache = () => toolCache.clear();
export const getPerformanceStats = () => performanceMonitor.getStats();

// 预加载相关工具（基于使用模式）
export const preloadRelatedTools = (currentTool: string, relatedTools: string[]) => {
  if (!defaultConfig.enablePreloading) return;
  
  requestIdleCallback(() => {
    relatedTools.forEach(toolPath => {
      if (!toolCache.has(toolPath)) {
        toolCache.set(toolPath, createToolLoader(toolPath));
      }
    });
  });
};

// 批量预加载工具（用于特定场景）
export const batchPreloadTools = (toolPaths: string[], priority: 'high' | 'normal' | 'low' = 'normal') => {
  const delay = priority === 'high' ? 0 : priority === 'normal' ? 1000 : 3000;
  
  setTimeout(() => {
    toolPaths.forEach(toolPath => {
      if (!toolCache.has(toolPath)) {
        toolCache.set(toolPath, createToolLoader(toolPath));
      }
    });
  }, delay);
};

