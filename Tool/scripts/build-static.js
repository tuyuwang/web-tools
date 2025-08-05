#!/usr/bin/env node

/**
 * 静态站点构建脚本
 * 优化静态站点生成流程，包括预处理、构建和后处理
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

class StaticSiteBuilder {
  constructor() {
    this.startTime = performance.now();
    this.buildDir = path.join(process.cwd(), 'out');
    this.config = this.loadConfig();
  }

  loadConfig() {
    const defaultConfig = {
      minifyHTML: true,
      optimizeImages: true,
      generateSitemap: true,
      generateRobots: true,
      compressAssets: true,
      generateManifest: true,
      enableServiceWorker: true,
      analytics: {
        enabled: false,
        trackingId: process.env.GOOGLE_ANALYTICS_ID,
      },
    };

    try {
      const userConfig = require('../build.config.js');
      return { ...defaultConfig, ...userConfig };
    } catch {
      return defaultConfig;
    }
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: '\x1b[36m',    // 青色
      success: '\x1b[32m', // 绿色
      warning: '\x1b[33m', // 黄色
      error: '\x1b[31m',   // 红色
      reset: '\x1b[0m',    // 重置
    };
    
    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
  }

  async prebuild() {
    this.log('🚀 开始静态站点构建预处理...', 'info');
    
    // 清理之前的构建
    if (fs.existsSync(this.buildDir)) {
      this.log('🧹 清理之前的构建文件...', 'info');
      execSync(`rm -rf ${this.buildDir}`, { stdio: 'inherit' });
    }

    // 验证环境
    this.validateEnvironment();

    // 生成构建信息
    this.generateBuildInfo();
  }

  validateEnvironment() {
    this.log('🔍 验证构建环境...', 'info');
    
    const requiredEnvVars = [
      'NODE_ENV',
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      this.log(`⚠️  缺少环境变量: ${missingVars.join(', ')}`, 'warning');
    }

    // 设置默认环境变量
    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = 'production';
    }

    if (!process.env.NEXT_PUBLIC_SITE_URL) {
      process.env.NEXT_PUBLIC_SITE_URL = 'https://tools.example.com';
      this.log('⚠️  使用默认站点URL: https://tools.example.com', 'warning');
    }
  }

  generateBuildInfo() {
    const buildInfo = {
      buildTime: new Date().toISOString(),
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      environment: process.env.NODE_ENV,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
      version: require('../package.json').version,
    };

    const buildInfoPath = path.join(process.cwd(), 'src', 'lib', 'build-info.json');
    fs.writeFileSync(buildInfoPath, JSON.stringify(buildInfo, null, 2));
    
    this.log('📋 生成构建信息文件', 'success');
  }

  async build() {
    this.log('🏗️  执行 Next.js 静态构建...', 'info');
    
    try {
      // 设置构建环境变量
      const env = {
        ...process.env,
        NODE_ENV: 'production',
        NEXT_TELEMETRY_DISABLED: '1',
      };

      execSync('npm run build', { 
        stdio: 'inherit',
        env,
      });
      
      this.log('✅ Next.js 构建完成', 'success');
    } catch (error) {
      this.log('❌ Next.js 构建失败', 'error');
      throw error;
    }
  }

  async postbuild() {
    this.log('🔧 开始后处理优化...', 'info');

    await Promise.all([
      this.config.generateSitemap && this.generateSitemap(),
      this.config.generateRobots && this.generateRobots(),
      this.config.generateManifest && this.optimizeManifest(),
      this.config.minifyHTML && this.minifyHTML(),
      this.config.compressAssets && this.compressAssets(),
      this.config.enableServiceWorker && this.generateServiceWorker(),
    ].filter(Boolean));

    await this.generateDeploymentFiles();
    await this.analyzeBundle();
  }

  async generateSitemap() {
    this.log('🗺️  生成站点地图...', 'info');
    
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const pages = this.getAllPages();
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${siteUrl}${page}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page === '/' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>`;

    fs.writeFileSync(path.join(this.buildDir, 'sitemap.xml'), sitemap);
    this.log('✅ 站点地图生成完成', 'success');
  }

  getAllPages() {
    const pages = ['/'];
    
    // 扫描所有工具页面
    const toolsDir = path.join(process.cwd(), 'src', 'app', 'tools');
    if (fs.existsSync(toolsDir)) {
      const scanDir = (dir, basePath = '/tools') => {
        const items = fs.readdirSync(dir);
        
        items.forEach(item => {
          const itemPath = path.join(dir, item);
          const stat = fs.statSync(itemPath);
          
          if (stat.isDirectory()) {
            const pagePath = `${basePath}/${item}`;
            
            // 检查是否有 page.tsx 文件
            if (fs.existsSync(path.join(itemPath, 'page.tsx'))) {
              pages.push(`${pagePath}/`);
            }
            
            // 递归扫描子目录
            scanDir(itemPath, pagePath);
          }
        });
      };
      
      scanDir(toolsDir);
    }
    
    return pages;
  }

  async generateRobots() {
    this.log('🤖 生成 robots.txt...', 'info');
    
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml

# 优化爬虫
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

# 禁止访问构建文件
Disallow: /_next/
Disallow: /api/
`;

    fs.writeFileSync(path.join(this.buildDir, 'robots.txt'), robots);
    this.log('✅ robots.txt 生成完成', 'success');
  }

  async optimizeManifest() {
    this.log('📱 优化 PWA manifest...', 'info');
    
    const manifestPath = path.join(this.buildDir, 'manifest.json');
    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      
      // 添加额外的 PWA 配置
      manifest.start_url = '/';
      manifest.scope = '/';
      manifest.display_override = ['window-controls-overlay'];
      manifest.edge_side_panel = {
        preferred_width: 400
      };
      
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
      this.log('✅ PWA manifest 优化完成', 'success');
    }
  }

  async minifyHTML() {
    this.log('🗜️  压缩 HTML 文件...', 'info');
    
    const htmlFiles = this.findFiles(this.buildDir, '.html');
    let processedCount = 0;
    
    for (const file of htmlFiles) {
      try {
        let content = fs.readFileSync(file, 'utf8');
        
        // 简单的HTML压缩（移除多余空白）
        content = content
          .replace(/>\s+</g, '><')
          .replace(/\s+/g, ' ')
          .trim();
        
        fs.writeFileSync(file, content);
        processedCount++;
      } catch (error) {
        this.log(`⚠️  压缩文件失败: ${file}`, 'warning');
      }
    }
    
    this.log(`✅ HTML 压缩完成 (${processedCount} 个文件)`, 'success');
  }

  async compressAssets() {
    this.log('🗜️  压缩静态资源...', 'info');
    
    try {
      // 使用 gzip 压缩
      execSync(`find ${this.buildDir} -type f \\( -name "*.js" -o -name "*.css" -o -name "*.html" -o -name "*.json" \\) -exec gzip -k {} \\;`, {
        stdio: 'pipe'
      });
      
      this.log('✅ 静态资源压缩完成', 'success');
    } catch (error) {
      this.log('⚠️  静态资源压缩失败，请确保系统支持 gzip', 'warning');
    }
  }

  async generateServiceWorker() {
    this.log('⚙️  生成 Service Worker...', 'info');
    
    const swContent = `
// Service Worker for static site
const CACHE_NAME = 'tools-cache-v${Date.now()}';
const STATIC_CACHE = 'tools-static-v1';

// 需要缓存的静态资源
const STATIC_ASSETS = [
  '/',
  '/tools/',
  '/manifest.json',
];

// 安装事件
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// 激活事件
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 拦截请求
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        
        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        });
      })
  );
});
`;

    fs.writeFileSync(path.join(this.buildDir, 'sw.js'), swContent.trim());
    this.log('✅ Service Worker 生成完成', 'success');
  }

  async generateDeploymentFiles() {
    this.log('📦 生成部署配置文件...', 'info');
    
    // 生成 Netlify _headers 文件
    const headers = `/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()

/_next/static/*
  Cache-Control: public, max-age=31536000, immutable

/*.js
  Cache-Control: public, max-age=31536000
  Content-Encoding: gzip

/*.css
  Cache-Control: public, max-age=31536000
  Content-Encoding: gzip

/*.html
  Cache-Control: public, max-age=3600
  Content-Encoding: gzip
`;

    fs.writeFileSync(path.join(this.buildDir, '_headers'), headers);

    // 生成 Netlify _redirects 文件
    const redirects = `# SPA fallback for client-side routing
/*    /index.html   200

# 404 页面
/404  /404.html  404
`;

    fs.writeFileSync(path.join(this.buildDir, '_redirects'), redirects);
    
    this.log('✅ 部署配置文件生成完成', 'success');
  }

  async analyzeBundle() {
    this.log('📊 分析构建结果...', 'info');
    
    const stats = this.getBuildStats();
    
    this.log(`📈 构建统计:`, 'info');
    this.log(`   - 总文件数: ${stats.totalFiles}`, 'info');
    this.log(`   - 总大小: ${this.formatBytes(stats.totalSize)}`, 'info');
    this.log(`   - HTML 文件: ${stats.htmlFiles} (${this.formatBytes(stats.htmlSize)})`, 'info');
    this.log(`   - JS 文件: ${stats.jsFiles} (${this.formatBytes(stats.jsSize)})`, 'info');
    this.log(`   - CSS 文件: ${stats.cssFiles} (${this.formatBytes(stats.cssSize)})`, 'info');
    
    // 保存构建统计
    fs.writeFileSync(
      path.join(this.buildDir, 'build-stats.json'),
      JSON.stringify(stats, null, 2)
    );
  }

  getBuildStats() {
    const stats = {
      totalFiles: 0,
      totalSize: 0,
      htmlFiles: 0,
      htmlSize: 0,
      jsFiles: 0,
      jsSize: 0,
      cssFiles: 0,
      cssSize: 0,
    };

    const scanDir = (dir) => {
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          scanDir(itemPath);
        } else {
          stats.totalFiles++;
          stats.totalSize += stat.size;
          
          const ext = path.extname(item).toLowerCase();
          switch (ext) {
            case '.html':
              stats.htmlFiles++;
              stats.htmlSize += stat.size;
              break;
            case '.js':
              stats.jsFiles++;
              stats.jsSize += stat.size;
              break;
            case '.css':
              stats.cssFiles++;
              stats.cssSize += stat.size;
              break;
          }
        }
      });
    };

    scanDir(this.buildDir);
    return stats;
  }

  findFiles(dir, extension) {
    const files = [];
    
    const scanDir = (currentDir) => {
      const items = fs.readdirSync(currentDir);
      
      items.forEach(item => {
        const itemPath = path.join(currentDir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          scanDir(itemPath);
        } else if (item.endsWith(extension)) {
          files.push(itemPath);
        }
      });
    };

    scanDir(dir);
    return files;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async run() {
    try {
      await this.prebuild();
      await this.build();
      await this.postbuild();
      
      const endTime = performance.now();
      const duration = ((endTime - this.startTime) / 1000).toFixed(2);
      
      this.log(`🎉 静态站点构建完成! 耗时: ${duration}s`, 'success');
      this.log(`📁 输出目录: ${this.buildDir}`, 'info');
      
    } catch (error) {
      this.log(`❌ 构建失败: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// 运行构建
if (require.main === module) {
  const builder = new StaticSiteBuilder();
  builder.run();
}

module.exports = StaticSiteBuilder; 