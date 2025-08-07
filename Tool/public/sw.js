// 高级Service Worker - 智能缓存策略
const CACHE_NAME = 'tool-cache-v2.1';
const RUNTIME_CACHE = 'tool-runtime-v2.1';
const STATIC_CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7天
const DYNAMIC_CACHE_TTL = 24 * 60 * 60 * 1000; // 1天
const MAX_ENTRIES = 100;

// 需要缓存的静态资源
const STATIC_ASSETS = [
  '/',
  '/tools/',
  '/about/',
  '/manifest.json',
  // 关键CSS和JS文件（将由构建过程动态填充）
];

// 运行时缓存策略
const CACHE_STRATEGIES = {
  // 静态资源 - 缓存优先
  static: {
    pattern: /\.(js|css|woff2?|ttf|eot)$/,
    strategy: 'CacheFirst',
    ttl: STATIC_CACHE_TTL
  },
  // 图片 - 缓存优先，过期后网络更新
  images: {
    pattern: /\.(png|jpg|jpeg|gif|svg|webp|ico)$/,
    strategy: 'CacheFirst',
    ttl: STATIC_CACHE_TTL
  },
  // HTML页面 - 网络优先，离线时使用缓存
  pages: {
    pattern: /\.html$|\/$/,
    strategy: 'NetworkFirst',
    ttl: DYNAMIC_CACHE_TTL
  },
  // API请求 - 网络优先
  api: {
    pattern: /\/api\//,
    strategy: 'NetworkFirst',
    ttl: 5 * 60 * 1000 // 5分钟
  }
};

// 安装事件 - 预缓存静态资源
self.addEventListener('install', event => {
  console.log('[SW] Installing Service Worker...');
  
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        
        // 智能预缓存：只缓存关键路径
        const criticalAssets = STATIC_ASSETS.filter(asset => {
          // 只预缓存关键页面
          return ['/', '/tools/', '/about/'].includes(asset) || 
                 asset.includes('manifest');
        });
        
        await cache.addAll(criticalAssets);
        console.log('[SW] Static assets cached successfully');
        
        // 强制激活新的Service Worker
        self.skipWaiting();
      } catch (error) {
        console.error('[SW] Failed to cache static assets:', error);
      }
    })()
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', event => {
  console.log('[SW] Activating Service Worker...');
  
  event.waitUntil(
    (async () => {
      try {
        // 获取所有缓存名称
        const cacheNames = await caches.keys();
        
        // 删除旧版本缓存
        const deletePromises = cacheNames
          .filter(name => {
            return name.startsWith('tool-') && 
                   name !== CACHE_NAME && 
                   name !== RUNTIME_CACHE;
          })
          .map(name => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          });
        
        await Promise.all(deletePromises);
        
        // 立即控制所有客户端
        await self.clients.claim();
        
        console.log('[SW] Service Worker activated successfully');
      } catch (error) {
        console.error('[SW] Failed to activate Service Worker:', error);
      }
    })()
  );
});

// 获取事件 - 智能缓存策略
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // 跳过非GET请求和外部域名
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }
  
  // 确定缓存策略
  const strategy = determineStrategy(url.pathname, request);
  
  if (strategy) {
    event.respondWith(handleRequest(request, strategy));
  }
});

// 确定请求的缓存策略
function determineStrategy(pathname, request) {
  // 检查各种模式
  for (const [key, config] of Object.entries(CACHE_STRATEGIES)) {
    if (config.pattern.test(pathname) || config.pattern.test(request.url)) {
      return { ...config, type: key };
    }
  }
  
  // 默认策略：工具页面
  if (pathname.startsWith('/tools/')) {
    return {
      strategy: 'NetworkFirst',
      ttl: DYNAMIC_CACHE_TTL,
      type: 'tools'
    };
  }
  
  return null;
}

// 处理请求的统一入口
async function handleRequest(request, strategy) {
  const cache = await caches.open(strategy.type === 'static' || strategy.type === 'images' ? CACHE_NAME : RUNTIME_CACHE);
  
  switch (strategy.strategy) {
    case 'CacheFirst':
      return cacheFirst(request, cache, strategy);
    case 'NetworkFirst':
      return networkFirst(request, cache, strategy);
    case 'StaleWhileRevalidate':
      return staleWhileRevalidate(request, cache, strategy);
    default:
      return fetch(request);
  }
}

// 缓存优先策略
async function cacheFirst(request, cache, strategy) {
  try {
    // 检查缓存
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // 检查是否过期
      const cachedTime = await getCacheTime(request.url);
      const isExpired = cachedTime && (Date.now() - cachedTime > strategy.ttl);
      
      if (!isExpired) {
        return cachedResponse;
      }
    }
    
    // 从网络获取
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      await updateCache(cache, request, networkResponse.clone(), strategy);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, serving from cache:', error);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // 返回离线页面或错误页面
    return createOfflineResponse(request);
  }
}

// 网络优先策略
async function networkFirst(request, cache, strategy) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      await updateCache(cache, request, networkResponse.clone(), strategy);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, serving from cache:', error);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return createOfflineResponse(request);
  }
}

// 边用边更新策略
async function staleWhileRevalidate(request, cache, strategy) {
  const cachedResponse = await cache.match(request);
  
  // 后台更新缓存
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      updateCache(cache, request, response.clone(), strategy);
    }
    return response;
  }).catch(() => {
    // 忽略网络错误
  });
  
  // 返回缓存的响应，如果没有则等待网络响应
  return cachedResponse || fetchPromise;
}

// 更新缓存
async function updateCache(cache, request, response, strategy) {
  try {
    // 检查缓存大小限制
    await enforceMaxEntries(cache);
    
    // 存储缓存时间戳
    await setCacheTime(request.url);
    
    // 存储响应
    await cache.put(request, response);
  } catch (error) {
    console.error('[SW] Failed to update cache:', error);
  }
}

// 强制执行最大缓存条目限制
async function enforceMaxEntries(cache) {
  const keys = await cache.keys();
  
  if (keys.length >= MAX_ENTRIES) {
    // 删除最旧的条目
    const entriesToDelete = keys.slice(0, keys.length - MAX_ENTRIES + 10);
    
    await Promise.all(
      entriesToDelete.map(key => {
        deleteCacheTime(key.url);
        return cache.delete(key);
      })
    );
  }
}

// 缓存时间戳管理
async function setCacheTime(url) {
  try {
    const db = await openDB();
    const tx = db.transaction(['cache_times'], 'readwrite');
    const store = tx.objectStore('cache_times');
    await store.put({ url, timestamp: Date.now() });
  } catch (error) {
    // 降级到localStorage
    try {
      localStorage.setItem(`cache_time_${btoa(url)}`, Date.now().toString());
    } catch (e) {
      // 忽略存储错误
    }
  }
}

async function getCacheTime(url) {
  try {
    const db = await openDB();
    const tx = db.transaction(['cache_times'], 'readonly');
    const store = tx.objectStore('cache_times');
    const result = await store.get(url);
    return result?.timestamp;
  } catch (error) {
    // 降级到localStorage
    try {
      const timestamp = localStorage.getItem(`cache_time_${btoa(url)}`);
      return timestamp ? parseInt(timestamp) : null;
    } catch (e) {
      return null;
    }
  }
}

async function deleteCacheTime(url) {
  try {
    const db = await openDB();
    const tx = db.transaction(['cache_times'], 'readwrite');
    const store = tx.objectStore('cache_times');
    await store.delete(url);
  } catch (error) {
    try {
      localStorage.removeItem(`cache_time_${btoa(url)}`);
    } catch (e) {
      // 忽略删除错误
    }
  }
}

// 简单的IndexedDB封装
let dbPromise;
function openDB() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open('ToolCacheDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('cache_times')) {
          const store = db.createObjectStore('cache_times', { keyPath: 'url' });
          store.createIndex('timestamp', 'timestamp');
        }
      };
    });
  }
  return dbPromise;
}

// 创建离线响应
function createOfflineResponse(request) {
  const url = new URL(request.url);
  
  if (url.pathname.endsWith('.html') || url.pathname === '/' || url.pathname.startsWith('/tools/')) {
    return new Response(`
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>离线模式 - 工具集</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0; padding: 20px; text-align: center; background: #f5f5f5;
          }
          .container { 
            max-width: 400px; margin: 50px auto; padding: 30px; 
            background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .icon { font-size: 48px; margin-bottom: 20px; }
          h1 { color: #333; margin-bottom: 10px; }
          p { color: #666; line-height: 1.5; }
          button { 
            background: #007bff; color: white; border: none; padding: 10px 20px; 
            border-radius: 4px; cursor: pointer; margin-top: 20px;
          }
          button:hover { background: #0056b3; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">📶</div>
          <h1>离线模式</h1>
          <p>当前无网络连接，正在显示缓存的内容。请检查网络连接后重试。</p>
          <button onclick="location.reload()">重新加载</button>
        </div>
      </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' },
      status: 200
    });
  }
  
  return new Response('Service Unavailable', { status: 503 });
}

// 消息处理 - 与主线程通信
self.addEventListener('message', event => {
  const { type, payload } = event.data || {};
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_CACHE_STATS':
      getCacheStats().then(stats => {
        event.ports[0]?.postMessage({ type: 'CACHE_STATS', payload: stats });
      });
      break;
      
    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0]?.postMessage({ type: 'CACHE_CLEARED' });
      });
      break;
      
    case 'PRELOAD_ROUTES':
      if (payload?.routes) {
        preloadRoutes(payload.routes);
      }
      break;
  }
});

// 获取缓存统计信息
async function getCacheStats() {
  try {
    const cacheNames = await caches.keys();
    const stats = {};
    
    for (const name of cacheNames) {
      const cache = await caches.open(name);
      const keys = await cache.keys();
      stats[name] = {
        count: keys.length,
        urls: keys.map(key => key.url)
      };
    }
    
    return stats;
  } catch (error) {
    console.error('[SW] Failed to get cache stats:', error);
    return {};
  }
}

// 清理所有缓存
async function clearAllCaches() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    
    // 清理IndexedDB
    try {
      const db = await openDB();
      const tx = db.transaction(['cache_times'], 'readwrite');
      const store = tx.objectStore('cache_times');
      await store.clear();
    } catch (e) {
      // 忽略清理错误
    }
    
    console.log('[SW] All caches cleared');
  } catch (error) {
    console.error('[SW] Failed to clear caches:', error);
  }
}

// 预加载路由
async function preloadRoutes(routes) {
  try {
    const cache = await caches.open(RUNTIME_CACHE);
    
    const preloadPromises = routes.map(async route => {
      try {
        const response = await fetch(route);
        if (response.ok) {
          await cache.put(route, response);
        }
      } catch (error) {
        console.log(`[SW] Failed to preload route: ${route}`, error);
      }
    });
    
    await Promise.all(preloadPromises);
    console.log('[SW] Routes preloaded successfully');
  } catch (error) {
    console.error('[SW] Failed to preload routes:', error);
  }
}

// 错误处理
self.addEventListener('error', event => {
  console.error('[SW] Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
  console.error('[SW] Unhandled promise rejection:', event.reason);
});

console.log('[SW] Service Worker loaded successfully'); 