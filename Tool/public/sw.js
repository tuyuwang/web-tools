const CACHE_NAME = 'toolkit-v1.0.0';
const STATIC_CACHE_NAME = 'toolkit-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'toolkit-dynamic-v1.0.0';

// 需要缓存的静态资源
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg',
  '/tools',
  '/tools/text',
  '/tools/image',
  '/tools/dev',
  '/tools/utility',
  '/tools/learn'
];

// 需要缓存的动态资源
const DYNAMIC_ASSETS = [
  '/tools/text/analyze',
  '/tools/text/case',
  '/tools/text/compare',
  '/tools/text/encode',
  '/tools/text/regex',
  '/tools/image/compress',
  '/tools/image/convert',
  '/tools/image/resize',
  '/tools/image/watermark',
  '/tools/dev/api',
  '/tools/dev/color',
  '/tools/dev/format',
  '/tools/dev/json',
  '/tools/dev/timestamp',
  '/tools/utility/calculator',
  '/tools/utility/converter',
  '/tools/utility/password',
  '/tools/utility/qr',
  '/tools/utility/random',
  '/tools/learn/calculator',
  '/tools/learn/cheatsheet',
  '/tools/learn/progress'
];

// 安装事件
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      // 缓存静态资源
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      // 缓存动态资源
      caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
        console.log('Service Worker: Caching dynamic assets');
        return cache.addAll(DYNAMIC_ASSETS);
      })
    ]).then(() => {
      console.log('Service Worker: Installed successfully');
      return self.skipWaiting();
    })
  );
});

// 激活事件
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activated successfully');
      return self.clients.claim();
    })
  );
});

// 获取事件
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // 只处理同源请求
  if (url.origin !== location.origin) {
    return;
  }
  
  // 处理导航请求
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          return response;
        }
        
        return fetch(request).then((fetchResponse) => {
          // 缓存新的页面
          if (fetchResponse.status === 200) {
            const responseClone = fetchResponse.clone();
            caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return fetchResponse;
        }).catch(() => {
          // 离线时返回首页
          return caches.match('/');
        });
      })
    );
    return;
  }
  
  // 处理静态资源请求
  if (request.destination === 'style' || 
      request.destination === 'script' || 
      request.destination === 'image' ||
      request.destination === 'font') {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          return response;
        }
        
        return fetch(request).then((fetchResponse) => {
          if (fetchResponse.status === 200) {
            const responseClone = fetchResponse.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return fetchResponse;
        });
      })
    );
    return;
  }
  
  // 处理API请求
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(JSON.stringify({ error: 'Offline' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }
});

// 消息事件
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// 推送事件（未来扩展）
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : '新消息',
    icon: '/icons/icon-192x192.svg',
    badge: '/icons/icon-72x72.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
          actions: [
        {
          action: 'explore',
          title: '查看',
          icon: '/icons/icon-72x72.svg'
        },
        {
          action: 'close',
          title: '关闭',
          icon: '/icons/icon-72x72.svg'
        }
      ]
  };
  
  event.waitUntil(
    self.registration.showNotification('工具集', options)
  );
});

// 通知点击事件
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
}); 