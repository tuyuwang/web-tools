/**
 * CDN和缓存策略配置
 * 支持多个平台的缓存优化配置
 */

module.exports = {
  // 通用缓存策略
  caching: {
    // 静态资源缓存 (1年)
    staticAssets: {
      maxAge: 31536000, // 1年
      immutable: true,
      patterns: [
        '/_next/static/**/*',
        '/static/**/*',
        '*.js',
        '*.css',
        '*.woff2',
        '*.woff',
        '*.ttf',
        '*.eot',
      ],
    },
    
    // 图片资源缓存 (30天)
    images: {
      maxAge: 2592000, // 30天
      patterns: [
        '*.jpg',
        '*.jpeg',
        '*.png',
        '*.gif',
        '*.svg',
        '*.webp',
        '*.avif',
        '*.ico',
      ],
    },
    
    // HTML页面缓存 (1小时)
    pages: {
      maxAge: 3600, // 1小时
      staleWhileRevalidate: 86400, // 24小时
      patterns: [
        '*.html',
        '/',
        '/tools/**',
      ],
    },
    
    // API响应缓存 (5分钟)
    api: {
      maxAge: 300, // 5分钟
      patterns: [
        '/api/**',
      ],
    },
    
    // 清单文件缓存 (1天)
    manifests: {
      maxAge: 86400, // 1天
      patterns: [
        '/manifest.json',
        '/sitemap.xml',
        '/robots.txt',
      ],
    },
  },

  // Cloudflare 配置
  cloudflare: {
    // 页面规则
    pageRules: [
      {
        url: '*.js',
        settings: {
          cache_level: 'cache_everything',
          edge_cache_ttl: 31536000, // 1年
          browser_cache_ttl: 31536000,
        },
      },
      {
        url: '*.css',
        settings: {
          cache_level: 'cache_everything',
          edge_cache_ttl: 31536000,
          browser_cache_ttl: 31536000,
        },
      },
      {
        url: '*.png',
        settings: {
          cache_level: 'cache_everything',
          edge_cache_ttl: 2592000, // 30天
          browser_cache_ttl: 2592000,
        },
      },
      {
        url: '*.jpg',
        settings: {
          cache_level: 'cache_everything',
          edge_cache_ttl: 2592000,
          browser_cache_ttl: 2592000,
        },
      },
      {
        url: '*.html',
        settings: {
          cache_level: 'cache_everything',
          edge_cache_ttl: 3600, // 1小时
          browser_cache_ttl: 3600,
        },
      },
    ],
    
    // 安全头配置
    securityHeaders: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    },
    
    // 性能优化
    optimization: {
      minify: {
        html: true,
        css: true,
        js: true,
      },
      brotli: true,
      http2: true,
      http3: true,
    },
  },

  // Netlify 配置
  netlify: {
    // _headers 文件内容
    headers: [
      {
        for: '/*',
        values: {
          'X-Frame-Options': 'DENY',
          'X-Content-Type-Options': 'nosniff',
          'X-XSS-Protection': '1; mode=block',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        },
      },
      {
        for: '/_next/static/*',
        values: {
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      },
      {
        for: '/static/*',
        values: {
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      },
      {
        for: '*.js',
        values: {
          'Cache-Control': 'public, max-age=31536000',
          'Content-Encoding': 'gzip',
        },
      },
      {
        for: '*.css',
        values: {
          'Cache-Control': 'public, max-age=31536000',
          'Content-Encoding': 'gzip',
        },
      },
      {
        for: '*.png',
        values: {
          'Cache-Control': 'public, max-age=2592000',
        },
      },
      {
        for: '*.jpg',
        values: {
          'Cache-Control': 'public, max-age=2592000',
        },
      },
      {
        for: '*.html',
        values: {
          'Cache-Control': 'public, max-age=3600',
          'Content-Encoding': 'gzip',
        },
      },
    ],
    
    // 重定向规则
    redirects: [
      {
        from: '/*',
        to: '/index.html',
        status: 200,
      },
      {
        from: '/404',
        to: '/404.html',
        status: 404,
      },
    ],
  },

  // Vercel 配置
  vercel: {
    headers: [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/(.*)\\.(?:js|css)$',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000',
          },
        ],
      },
      {
        source: '/(.*)\\.(?:jpg|jpeg|png|gif|svg|webp|avif|ico)$',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000',
          },
        ],
      },
    ],
    
    rewrites: [
      {
        source: '/(.*)',
        destination: '/out/$1',
      },
    ],
  },

  // GitHub Pages 配置
  github: {
    // Jekyll 配置
    jekyll: false, // 禁用 Jekyll
    
    // 自定义域名
    cname: process.env.GITHUB_PAGES_DOMAIN || null,
    
    // 404 页面
    custom404: '/404.html',
  },

  // AWS CloudFront 配置
  cloudfront: {
    distributions: [
      {
        comment: 'Tools Static Site Distribution',
        defaultCacheBehavior: {
          targetOriginId: 'S3-tools-static',
          viewerProtocolPolicy: 'redirect-to-https',
          cachePolicyId: '4135ea2d-6df8-44a3-9df3-4b5a84be39ad', // Managed-CachingOptimized
          compress: true,
        },
        cacheBehaviors: [
          {
            pathPattern: '/_next/static/*',
            targetOriginId: 'S3-tools-static',
            viewerProtocolPolicy: 'redirect-to-https',
            cachePolicyId: '4135ea2d-6df8-44a3-9df3-4b5a84be39ad',
            compress: true,
            ttl: {
              defaultTtl: 31536000,
              maxTtl: 31536000,
            },
          },
          {
            pathPattern: '/static/*',
            targetOriginId: 'S3-tools-static',
            viewerProtocolPolicy: 'redirect-to-https',
            cachePolicyId: '4135ea2d-6df8-44a3-9df3-4b5a84be39ad',
            compress: true,
            ttl: {
              defaultTtl: 31536000,
              maxTtl: 31536000,
            },
          },
          {
            pathPattern: '*.js',
            targetOriginId: 'S3-tools-static',
            viewerProtocolPolicy: 'redirect-to-https',
            cachePolicyId: '4135ea2d-6df8-44a3-9df3-4b5a84be39ad',
            compress: true,
            ttl: {
              defaultTtl: 31536000,
              maxTtl: 31536000,
            },
          },
          {
            pathPattern: '*.css',
            targetOriginId: 'S3-tools-static',
            viewerProtocolPolicy: 'redirect-to-https',
            cachePolicyId: '4135ea2d-6df8-44a3-9df3-4b5a84be39ad',
            compress: true,
            ttl: {
              defaultTtl: 31536000,
              maxTtl: 31536000,
            },
          },
          {
            pathPattern: '*.png',
            targetOriginId: 'S3-tools-static',
            viewerProtocolPolicy: 'redirect-to-https',
            cachePolicyId: '4135ea2d-6df8-44a3-9df3-4b5a84be39ad',
            compress: true,
            ttl: {
              defaultTtl: 2592000,
              maxTtl: 2592000,
            },
          },
          {
            pathPattern: '*.html',
            targetOriginId: 'S3-tools-static',
            viewerProtocolPolicy: 'redirect-to-https',
            cachePolicyId: '4135ea2d-6df8-44a3-9df3-4b5a84be39ad',
            compress: true,
            ttl: {
              defaultTtl: 3600,
              maxTtl: 86400,
            },
          },
        ],
        customErrorResponses: [
          {
            errorCode: 404,
            responseCode: 404,
            responsePagePath: '/404.html',
          },
        ],
      },
    ],
  },

  // 性能优化建议
  performance: {
    // 关键资源预加载
    preload: [
      '/_next/static/css/app.css',
      '/_next/static/chunks/main.js',
      '/manifest.json',
    ],
    
    // DNS 预解析
    dnsPrefetch: [
      'fonts.googleapis.com',
      'fonts.gstatic.com',
      'cdnjs.cloudflare.com',
    ],
    
    // 资源预连接
    preconnect: [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
    ],
    
    // 图片优化
    images: {
      formats: ['avif', 'webp', 'jpeg'],
      quality: 85,
      responsive: true,
      lazy: true,
    },
    
    // 压缩配置
    compression: {
      gzip: true,
      brotli: true,
      level: 6,
    },
  },

  // 监控和分析
  monitoring: {
    // Web Vitals 阈值
    webVitals: {
      fcp: 1800, // First Contentful Paint (ms)
      lcp: 2500, // Largest Contentful Paint (ms)
      fid: 100,  // First Input Delay (ms)
      cls: 0.1,  // Cumulative Layout Shift
    },
    
    // 性能预算
    budgets: {
      'bundle.js': '250KB',
      'bundle.css': '50KB',
      'total-js': '500KB',
      'total-css': '100KB',
      'images': '1MB',
      'total-size': '2MB',
    },
  },
};