/**
 * 静态站点优化工具库
 * 提供性能优化、缓存策略和SEO增强功能
 */

// 预加载关键资源
export function preloadCriticalResources() {
  if (typeof window === 'undefined') return;

  const criticalResources = [
    { href: '/manifest.json', as: 'manifest' },
    { href: '/_next/static/css/app.css', as: 'style' },
    { href: '/_next/static/chunks/main.js', as: 'script' },
  ];

  criticalResources.forEach(({ href, as }) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  });
}

// DNS预解析
export function prefetchDNS() {
  if (typeof window === 'undefined') return;

  const domains = [
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'cdnjs.cloudflare.com',
  ];

  domains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = `//${domain}`;
    document.head.appendChild(link);
  });
}

// 图片懒加载优化
export class LazyImageLoader {
  private observer: IntersectionObserver | null = null;
  private images: Set<HTMLImageElement> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        this.handleIntersection.bind(this),
        {
          rootMargin: '50px 0px',
          threshold: 0.01,
        }
      );
    }
  }

  private handleIntersection(entries: IntersectionObserverEntry[]) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        this.loadImage(img);
        this.observer?.unobserve(img);
        this.images.delete(img);
      }
    });
  }

  private loadImage(img: HTMLImageElement) {
    const src = img.dataset.src;
    if (src) {
      img.src = src;
      img.removeAttribute('data-src');
      img.classList.remove('lazy');
      img.classList.add('loaded');
    }
  }

  observe(img: HTMLImageElement) {
    if (this.observer) {
      this.observer.observe(img);
      this.images.add(img);
    } else {
      // 降级处理
      this.loadImage(img);
    }
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
      this.images.clear();
    }
  }
}

// 静态资源缓存策略
export class StaticCacheManager {
  private cacheName = 'tools-static-v1';
  private cacheExpiry = 24 * 60 * 60 * 1000; // 24小时

  async cacheStaticAssets() {
    if ('caches' in window) {
      try {
        const cache = await caches.open(this.cacheName);
        const assetsToCache = [
          '/',
          '/tools/',
          '/manifest.json',
          '/_next/static/css/app.css',
          '/_next/static/chunks/main.js',
        ];

        await cache.addAll(assetsToCache);
        console.log('静态资源缓存完成');
      } catch (error) {
        console.error('静态资源缓存失败:', error);
      }
    }
  }

  async getCachedResponse(request: Request): Promise<Response | null> {
    if ('caches' in window) {
      try {
        const cache = await caches.open(this.cacheName);
        const response = await cache.match(request);
        
        if (response) {
          // 检查缓存是否过期
          const cachedTime = response.headers.get('cached-time');
          if (cachedTime) {
            const age = Date.now() - parseInt(cachedTime);
            if (age > this.cacheExpiry) {
              await cache.delete(request);
              return null;
            }
          }
        }
        
        return response;
      } catch (error) {
        console.error('获取缓存响应失败:', error);
        return null;
      }
    }
    return null;
  }

  async cacheResponse(request: Request, response: Response) {
    if ('caches' in window) {
      try {
        const cache = await caches.open(this.cacheName);
        const responseToCache = response.clone();
        
        // 添加缓存时间戳
        const headers = new Headers(responseToCache.headers);
        headers.set('cached-time', Date.now().toString());
        
        const modifiedResponse = new Response(responseToCache.body, {
          status: responseToCache.status,
          statusText: responseToCache.statusText,
          headers: headers,
        });
        
        await cache.put(request, modifiedResponse);
      } catch (error) {
        console.error('缓存响应失败:', error);
      }
    }
  }

  async clearExpiredCache() {
    if ('caches' in window) {
      try {
        const cache = await caches.open(this.cacheName);
        const requests = await cache.keys();
        
        for (const request of requests) {
          const response = await cache.match(request);
          if (response) {
            const cachedTime = response.headers.get('cached-time');
            if (cachedTime) {
              const age = Date.now() - parseInt(cachedTime);
              if (age > this.cacheExpiry) {
                await cache.delete(request);
              }
            }
          }
        }
      } catch (error) {
        console.error('清理过期缓存失败:', error);
      }
    }
  }
}

// 性能监控
export class PerformanceMonitor {
  private metrics: Map<string, number> = new Map();

  startTiming(name: string) {
    this.metrics.set(`${name}_start`, performance.now());
  }

  endTiming(name: string) {
    const startTime = this.metrics.get(`${name}_start`);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.metrics.set(name, duration);
      return duration;
    }
    return 0;
  }

  getTiming(name: string): number | undefined {
    return this.metrics.get(name);
  }

  getAllTimings(): Record<string, number> {
    const timings: Record<string, number> = {};
    this.metrics.forEach((value, key) => {
      if (!key.endsWith('_start')) {
        timings[key] = value;
      }
    });
    return timings;
  }

  measureWebVitals() {
    if (typeof window === 'undefined') return;

    // 测量 FCP (First Contentful Paint)
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.set('FCP', entry.startTime);
          }
        }
      });
      observer.observe({ entryTypes: ['paint'] });
    }

    // 测量 LCP (Largest Contentful Paint)
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.set('LCP', lastEntry.startTime);
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }

    // 测量 CLS (Cumulative Layout Shift)
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
            this.metrics.set('CLS', clsValue);
          }
        }
      });
      observer.observe({ entryTypes: ['layout-shift'] });
    }
  }

  reportMetrics() {
    const metrics = this.getAllTimings();
    console.log('性能指标:', metrics);
    
    // 可以发送到分析服务
    if (process.env.NODE_ENV === 'production') {
      // 发送到 Google Analytics 或其他分析服务
    }
  }
}

// SEO优化工具
export class SEOOptimizer {
  static generateStructuredData(page: {
    title: string;
    description: string;
    url: string;
    type?: string;
  }) {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': page.type || 'WebPage',
      name: page.title,
      description: page.description,
      url: page.url,
      publisher: {
        '@type': 'Organization',
        name: '工具集',
        url: process.env.NEXT_PUBLIC_SITE_URL,
      },
      mainEntity: {
        '@type': 'WebApplication',
        name: '在线工具集',
        applicationCategory: 'Utility',
        operatingSystem: 'Web Browser',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      },
    };

    return JSON.stringify(structuredData);
  }

  static generateMetaTags(page: {
    title: string;
    description: string;
    url: string;
    image?: string;
    keywords?: string[];
  }) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tools.example.com';
    const defaultImage = `${siteUrl}/og-image.png`;

    return {
      title: page.title,
      description: page.description,
      keywords: page.keywords?.join(', ') || 'tools, utilities, online tools',
      'og:title': page.title,
      'og:description': page.description,
      'og:url': page.url,
      'og:image': page.image || defaultImage,
      'og:type': 'website',
      'og:site_name': '工具集',
      'twitter:card': 'summary_large_image',
      'twitter:title': page.title,
      'twitter:description': page.description,
      'twitter:image': page.image || defaultImage,
      canonical: page.url,
    };
  }

  static generateSitemap(pages: Array<{
    url: string;
    lastmod?: string;
    changefreq?: string;
    priority?: string;
  }>) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tools.example.com';
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${siteUrl}${page.url}</loc>
    <lastmod>${page.lastmod || new Date().toISOString()}</lastmod>
    <changefreq>${page.changefreq || 'weekly'}</changefreq>
    <priority>${page.priority || '0.8'}</priority>
  </url>`).join('\n')}
</urlset>`;

    return sitemap;
  }
}

// 初始化静态站点优化
export function initializeStaticOptimizations() {
  if (typeof window === 'undefined') return;

  // 预加载关键资源
  preloadCriticalResources();
  
  // DNS预解析
  prefetchDNS();
  
  // 初始化缓存管理器
  const cacheManager = new StaticCacheManager();
  cacheManager.cacheStaticAssets();
  
  // 定期清理过期缓存
  setInterval(() => {
    cacheManager.clearExpiredCache();
  }, 60 * 60 * 1000); // 每小时清理一次
  
  // 初始化性能监控
  const perfMonitor = new PerformanceMonitor();
  perfMonitor.measureWebVitals();
  
  // 页面加载完成后报告指标
  window.addEventListener('load', () => {
    setTimeout(() => {
      perfMonitor.reportMetrics();
    }, 1000);
  });
  
  // 初始化懒加载
  const lazyLoader = new LazyImageLoader();
  
  // 自动处理所有懒加载图片
  document.addEventListener('DOMContentLoaded', () => {
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => lazyLoader.observe(img as HTMLImageElement));
  });
  
  return {
    cacheManager,
    perfMonitor,
    lazyLoader,
  };
}

// 导出单例实例
export const staticOptimizations = initializeStaticOptimizations();