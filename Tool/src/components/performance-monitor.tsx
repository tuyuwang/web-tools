'use client';

import { useEffect, useState, useCallback } from 'react';

interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  
  // Other performance metrics
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
  
  // Navigation timing
  domContentLoaded?: number;
  loadComplete?: number;
  
  // Resource loading
  totalResources?: number;
  failedResources?: number;
  
  // Memory usage (if available)
  memoryUsed?: number;
  memoryLimit?: number;
  
  // Bundle size tracking
  bundleSize?: number;
  chunkCount?: number;
}

interface PerformanceAlert {
  type: 'warning' | 'error' | 'info';
  metric: string;
  value: number;
  threshold: number;
  message: string;
  timestamp: number;
}

const PERFORMANCE_THRESHOLDS = {
  lcp: { good: 2500, needsImprovement: 4000 }, // ms
  fid: { good: 100, needsImprovement: 300 }, // ms
  cls: { good: 0.1, needsImprovement: 0.25 }, // score
  fcp: { good: 1800, needsImprovement: 3000 }, // ms
  ttfb: { good: 600, needsImprovement: 1500 }, // ms
};

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isCollecting, setIsCollecting] = useState(false);

  // 只在开发模式或特定条件下显示
  useEffect(() => {
    const shouldShow = process.env.NODE_ENV === 'development' || 
                     localStorage.getItem('performance-monitor') === 'true';
    setIsVisible(shouldShow);
  }, []);

  const addAlert = useCallback((alert: Omit<PerformanceAlert, 'timestamp'>) => {
    setAlerts(prev => [...prev, { ...alert, timestamp: Date.now() }].slice(-5));
  }, []);

  const collectWebVitals = useCallback(() => {
    if (!('PerformanceObserver' in window)) return;

    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime?: number; loadTime?: number };
      const lcp = lastEntry.renderTime || lastEntry.loadTime || 0;
      
      setMetrics(prev => ({ ...prev, lcp }));
      
      if (lcp > PERFORMANCE_THRESHOLDS.lcp.needsImprovement) {
        addAlert({
          type: 'error',
          metric: 'LCP',
          value: lcp,
          threshold: PERFORMANCE_THRESHOLDS.lcp.needsImprovement,
          message: 'Largest Contentful Paint is slow'
        });
      } else if (lcp > PERFORMANCE_THRESHOLDS.lcp.good) {
        addAlert({
          type: 'warning',
          metric: 'LCP',
          value: lcp,
          threshold: PERFORMANCE_THRESHOLDS.lcp.good,
          message: 'Largest Contentful Paint needs improvement'
        });
      }
    });
    
    try {
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.log('LCP observer not supported');
    }

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: PerformanceEntry & { processingStart?: number }) => {
        const fid = entry.processingStart ? entry.processingStart - entry.startTime : 0;
        
        setMetrics(prev => ({ ...prev, fid }));
        
        if (fid > PERFORMANCE_THRESHOLDS.fid.needsImprovement) {
          addAlert({
            type: 'error',
            metric: 'FID',
            value: fid,
            threshold: PERFORMANCE_THRESHOLDS.fid.needsImprovement,
            message: 'First Input Delay is high'
          });
        }
      });
    });
    
    try {
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.log('FID observer not supported');
    }

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: PerformanceEntry & { value?: number; hadRecentInput?: boolean }) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value || 0;
        }
      });
      
      setMetrics(prev => ({ ...prev, cls: clsValue }));
      
      if (clsValue > PERFORMANCE_THRESHOLDS.cls.needsImprovement) {
        addAlert({
          type: 'error',
          metric: 'CLS',
          value: clsValue,
          threshold: PERFORMANCE_THRESHOLDS.cls.needsImprovement,
          message: 'Cumulative Layout Shift is high'
        });
      }
    });
    
    try {
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.log('CLS observer not supported');
    }

    // First Contentful Paint (FCP)
    const paintObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          setMetrics(prev => ({ ...prev, fcp: entry.startTime }));
        }
      });
    });
    
    try {
      paintObserver.observe({ entryTypes: ['paint'] });
    } catch (e) {
      console.log('Paint observer not supported');
    }

    return () => {
      lcpObserver.disconnect();
      fidObserver.disconnect();
      clsObserver.disconnect();
      paintObserver.disconnect();
    };
  }, [addAlert]);

  const collectNavigationTiming = useCallback(() => {
    if (!('performance' in window) || !performance.timing) return;

    const timing = performance.timing;
    const navigation = performance.navigation;

    const ttfb = timing.responseStart - timing.navigationStart;
    const domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
    const loadComplete = timing.loadEventEnd - timing.navigationStart;

    setMetrics(prev => ({
      ...prev,
      ttfb,
      domContentLoaded,
      loadComplete
    }));

    if (ttfb > PERFORMANCE_THRESHOLDS.ttfb.needsImprovement) {
      addAlert({
        type: 'warning',
        metric: 'TTFB',
        value: ttfb,
        threshold: PERFORMANCE_THRESHOLDS.ttfb.needsImprovement,
        message: 'Time to First Byte is slow'
      });
    }
  }, [addAlert]);

  const collectResourceMetrics = useCallback(() => {
    if (!('performance' in window)) return;

    const resources = performance.getEntriesByType('resource');
    const totalResources = resources.length;
    const failedResources = resources.filter((resource: PerformanceEntry & { transferSize?: number }) => 
      resource.transferSize === 0
    ).length;

    let bundleSize = 0;
    let chunkCount = 0;
    
    resources.forEach((resource: PerformanceEntry & { transferSize?: number }) => {
      if (resource.name.includes('/_next/static/chunks/')) {
        bundleSize += resource.transferSize || 0;
        chunkCount++;
      }
    });

    setMetrics(prev => ({
      ...prev,
      totalResources,
      failedResources,
      bundleSize,
      chunkCount
    }));

    if (failedResources > 0) {
      addAlert({
        type: 'warning',
        metric: 'Resources',
        value: failedResources,
        threshold: 0,
        message: `${failedResources} resources failed to load`
      });
    }
  }, [addAlert]);

  const collectMemoryMetrics = useCallback(() => {
    if (!('memory' in performance)) return;

    const memory = (performance as any).memory;
    const memoryUsed = memory.usedJSHeapSize;
    const memoryLimit = memory.jsHeapSizeLimit;

    setMetrics(prev => ({
      ...prev,
      memoryUsed: Math.round(memoryUsed / 1024 / 1024), // MB
      memoryLimit: Math.round(memoryLimit / 1024 / 1024) // MB
    }));

    const usagePercentage = (memoryUsed / memoryLimit) * 100;
    if (usagePercentage > 80) {
      addAlert({
        type: 'error',
        metric: 'Memory',
        value: usagePercentage,
        threshold: 80,
        message: 'High memory usage detected'
      });
    }
  }, [addAlert]);

  const startMonitoring = useCallback(() => {
    setIsCollecting(true);
    
    // 立即收集一次
    collectNavigationTiming();
    collectResourceMetrics();
    collectMemoryMetrics();
    
    // 设置定期收集
    const interval = setInterval(() => {
      collectResourceMetrics();
      collectMemoryMetrics();
    }, 5000);

    // 设置Web Vitals收集
    const cleanup = collectWebVitals();

    return () => {
      clearInterval(interval);
      cleanup?.();
      setIsCollecting(false);
    };
  }, [collectNavigationTiming, collectResourceMetrics, collectMemoryMetrics, collectWebVitals]);

  useEffect(() => {
    if (!isVisible) return;

    // 页面加载完成后开始监控
    if (document.readyState === 'complete') {
      const cleanup = startMonitoring();
      return cleanup;
    } else {
      const handleLoad = () => {
        const cleanup = startMonitoring();
        return cleanup;
      };
      
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, [isVisible, startMonitoring]);

  const getScoreColor = (metric: string, value: number) => {
    const thresholds = PERFORMANCE_THRESHOLDS[metric as keyof typeof PERFORMANCE_THRESHOLDS];
    if (!thresholds) return 'text-gray-600';
    
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.needsImprovement) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatMs = (ms: number) => {
    return ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(1)}s`;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg text-xs max-w-sm z-50">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold">Performance Monitor</div>
        <div className={`w-2 h-2 rounded-full ${isCollecting ? 'bg-green-400' : 'bg-gray-400'}`} />
      </div>
      
      {/* Core Web Vitals */}
      <div className="mb-3">
        <div className="font-medium mb-1">Core Web Vitals</div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <div className="text-gray-500">LCP</div>
            <div className={getScoreColor('lcp', metrics.lcp || 0)}>
              {metrics.lcp ? formatMs(metrics.lcp) : '--'}
            </div>
          </div>
          <div>
            <div className="text-gray-500">FID</div>
            <div className={getScoreColor('fid', metrics.fid || 0)}>
              {metrics.fid ? formatMs(metrics.fid) : '--'}
            </div>
          </div>
          <div>
            <div className="text-gray-500">CLS</div>
            <div className={getScoreColor('cls', metrics.cls || 0)}>
              {metrics.cls ? metrics.cls.toFixed(3) : '--'}
            </div>
          </div>
        </div>
      </div>

      {/* Other Metrics */}
      <div className="mb-3">
        <div className="font-medium mb-1">Timing</div>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-500">TTFB:</span>
            <span>{metrics.ttfb ? formatMs(metrics.ttfb) : '--'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">DOM:</span>
            <span>{metrics.domContentLoaded ? formatMs(metrics.domContentLoaded) : '--'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Load:</span>
            <span>{metrics.loadComplete ? formatMs(metrics.loadComplete) : '--'}</span>
          </div>
        </div>
      </div>

      {/* Resources */}
      <div className="mb-3">
        <div className="font-medium mb-1">Resources</div>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-500">Total:</span>
            <span>{metrics.totalResources || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Failed:</span>
            <span className={metrics.failedResources ? 'text-red-600' : ''}>
              {metrics.failedResources || 0}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Bundle:</span>
            <span>{metrics.bundleSize ? formatBytes(metrics.bundleSize) : '--'}</span>
          </div>
        </div>
      </div>

      {/* Memory */}
      {metrics.memoryUsed && (
        <div className="mb-3">
          <div className="font-medium mb-1">Memory</div>
          <div className="flex justify-between">
            <span className="text-gray-500">Used:</span>
            <span>{metrics.memoryUsed}MB / {metrics.memoryLimit}MB</span>
          </div>
        </div>
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <div>
          <div className="font-medium mb-1">Alerts</div>
          <div className="space-y-1 max-h-20 overflow-y-auto">
            {alerts.slice(-3).map((alert, index) => (
              <div key={index} className={`p-1 rounded text-xs ${
                alert.type === 'error' ? 'bg-red-100 text-red-800' :
                alert.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {alert.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}