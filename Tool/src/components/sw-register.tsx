'use client';

import { useEffect, useState } from 'react';

interface CacheStats {
  [cacheName: string]: {
    count: number;
    urls: string[];
  };
}

interface ServiceWorkerManager {
  isSupported: boolean;
  isRegistered: boolean;
  isOnline: boolean;
  cacheStats: CacheStats | null;
  registration: ServiceWorkerRegistration | null;
  updateAvailable: boolean;
  error: string | null;
}

export default function ServiceWorkerRegister() {
  const [swManager, setSWManager] = useState<ServiceWorkerManager>({
    isSupported: false,
    isRegistered: false,
    isOnline: true,
    cacheStats: null,
    registration: null,
    updateAvailable: false,
    error: null
  });

  useEffect(() => {
    // 检查Service Worker支持
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      setSWManager(prev => ({ ...prev, isSupported: true }));
      registerServiceWorker();
    }

    // 监听在线状态
    const handleOnline = () => setSWManager(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setSWManager(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });

      setSWManager(prev => ({ 
        ...prev, 
        isRegistered: true, 
        registration 
      }));

      console.log('[SW Manager] Service Worker registered successfully');

      // 监听SW状态变化
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setSWManager(prev => ({ ...prev, updateAvailable: true }));
              console.log('[SW Manager] New version available');
            }
          });
        }
      });

      // 检查现有的SW
      if (registration.waiting) {
        setSWManager(prev => ({ ...prev, updateAvailable: true }));
      }

      // 定期检查更新
      setInterval(() => {
        registration.update();
      }, 30000); // 每30秒检查一次

      // 获取缓存统计
      getCacheStats();

    } catch (error) {
      setSWManager(prev => ({ 
        ...prev, 
        error: `Service Worker registration failed: ${error}` 
      }));
      console.error('[SW Manager] Registration failed:', error);
    }
  };

  const getCacheStats = async () => {
    if (!navigator.serviceWorker.controller) return;

    try {
      const channel = new MessageChannel();
      
      channel.port1.onmessage = (event) => {
        const { type, payload } = event.data;
        if (type === 'CACHE_STATS') {
          setSWManager(prev => ({ ...prev, cacheStats: payload }));
        }
      };

      navigator.serviceWorker.controller.postMessage(
        { type: 'GET_CACHE_STATS' },
        [channel.port2]
      );
    } catch (error) {
      console.error('[SW Manager] Failed to get cache stats:', error);
    }
  };

  const updateServiceWorker = () => {
    if (swManager.registration?.waiting) {
      swManager.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      swManager.registration.waiting.addEventListener('statechange', (e) => {
        if ((e.target as ServiceWorker).state === 'activated') {
          window.location.reload();
        }
      });
    }
  };

  const clearCache = async () => {
    if (!navigator.serviceWorker.controller) return;

    try {
      const channel = new MessageChannel();
      
      channel.port1.onmessage = (event) => {
        const { type } = event.data;
        if (type === 'CACHE_CLEARED') {
          setSWManager(prev => ({ ...prev, cacheStats: null }));
          console.log('[SW Manager] Cache cleared successfully');
        }
      };

      navigator.serviceWorker.controller.postMessage(
        { type: 'CLEAR_CACHE' },
        [channel.port2]
      );
    } catch (error) {
      console.error('[SW Manager] Failed to clear cache:', error);
    }
  };

  const preloadRoutes = (routes: string[]) => {
    if (!navigator.serviceWorker.controller) return;

    navigator.serviceWorker.controller.postMessage({
      type: 'PRELOAD_ROUTES',
      payload: { routes }
    });
  };

  // 开发模式下显示调试信息
  if (process.env.NODE_ENV === 'development') {
    return (
      <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-lg text-xs max-w-xs z-50">
        <div className="font-semibold mb-2">Service Worker Status</div>
        
        <div className="space-y-1">
          <div>
            Support: {swManager.isSupported ? '✅' : '❌'}
          </div>
          <div>
            Registered: {swManager.isRegistered ? '✅' : '❌'}
          </div>
          <div>
            Online: {swManager.isOnline ? '🟢' : '🔴'}
          </div>
          {swManager.error && (
            <div className="text-red-500 text-xs">
              Error: {swManager.error}
            </div>
          )}
        </div>

        {swManager.updateAvailable && (
          <button
            onClick={updateServiceWorker}
            className="mt-2 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
          >
            Update Available
          </button>
        )}

        {swManager.cacheStats && (
          <div className="mt-2">
            <div className="font-semibold">Cache Stats:</div>
            {Object.entries(swManager.cacheStats).map(([name, stats]) => (
              <div key={name} className="text-xs">
                {name}: {stats.count} items
              </div>
            ))}
            <button
              onClick={clearCache}
              className="mt-1 px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
            >
              Clear Cache
            </button>
          </div>
        )}
      </div>
    );
  }

  return null;
} 