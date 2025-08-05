#!/usr/bin/env node

/**
 * 增强版性能测试脚本
 * 用于验证构建输出的质量和性能指标
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 开始增强版性能测试...\n');

// 性能指标收集器
class PerformanceCollector {
  constructor() {
    this.metrics = {
      buildSize: 0,
      bundleAnalysis: {},
      pageMetrics: {},
      resourceOptimization: {},
      cacheability: {},
      accessibility: {},
      seo: {},
      timestamp: new Date().toISOString()
    };
  }

  // 收集构建大小指标
  collectBuildMetrics() {
    console.log('📊 收集构建指标...');
    
    const outDir = path.join(process.cwd(), 'out');
    if (!fs.existsSync(outDir)) {
      console.error('❌ 构建输出目录不存在！');
      return false;
    }

    // 计算总构建大小
    const totalSize = this.calculateDirectorySize(outDir);
    this.metrics.buildSize = totalSize;

    // 分析各类文件大小
    const fileTypes = this.analyzeFileTypes(outDir);
    this.metrics.bundleAnalysis = fileTypes;

    console.log(`✅ 总构建大小: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
    
    return true;
  }

  // 计算目录大小
  calculateDirectorySize(dirPath) {
    let totalSize = 0;
    const items = fs.readdirSync(dirPath);

    items.forEach(item => {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);

      if (stats.isDirectory()) {
        totalSize += this.calculateDirectorySize(itemPath);
      } else {
        totalSize += stats.size;
      }
    });

    return totalSize;
  }

  // 分析文件类型分布
  analyzeFileTypes(dirPath) {
    const fileTypes = {
      javascript: { count: 0, size: 0 },
      css: { count: 0, size: 0 },
      html: { count: 0, size: 0 },
      images: { count: 0, size: 0 },
      fonts: { count: 0, size: 0 },
      other: { count: 0, size: 0 }
    };

    const analyzeDir = (dir) => {
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const itemPath = path.join(dir, item);
        const stats = fs.statSync(itemPath);

        if (stats.isDirectory()) {
          analyzeDir(itemPath);
        } else {
          const ext = path.extname(item).toLowerCase();
          const size = stats.size;

          switch (ext) {
            case '.js':
            case '.mjs':
              fileTypes.javascript.count++;
              fileTypes.javascript.size += size;
              break;
            case '.css':
              fileTypes.css.count++;
              fileTypes.css.size += size;
              break;
            case '.html':
              fileTypes.html.count++;
              fileTypes.html.size += size;
              break;
            case '.png':
            case '.jpg':
            case '.jpeg':
            case '.gif':
            case '.svg':
            case '.webp':
              fileTypes.images.count++;
              fileTypes.images.size += size;
              break;
            case '.woff':
            case '.woff2':
            case '.ttf':
            case '.eot':
              fileTypes.fonts.count++;
              fileTypes.fonts.size += size;
              break;
            default:
              fileTypes.other.count++;
              fileTypes.other.size += size;
          }
        }
      });
    };

    analyzeDir(dirPath);
    return fileTypes;
  }

  // 检查页面性能指标
  collectPageMetrics() {
    console.log('\n🚀 分析页面性能指标...');
    
    const outDir = path.join(process.cwd(), 'out');
    const htmlFiles = this.findHtmlFiles(outDir);
    
    htmlFiles.forEach(htmlFile => {
      const relativePath = path.relative(outDir, htmlFile);
      const content = fs.readFileSync(htmlFile, 'utf8');
      
      this.metrics.pageMetrics[relativePath] = {
        size: fs.statSync(htmlFile).size,
        scriptTags: (content.match(/<script/g) || []).length,
        styleTags: (content.match(/<style/g) || []).length,
        linkTags: (content.match(/<link/g) || []).length,
        imageTags: (content.match(/<img/g) || []).length,
        hasServiceWorker: content.includes('sw.js'),
        hasManifest: content.includes('manifest.json'),
        title: this.extractTitle(content),
        metaTags: (content.match(/<meta/g) || []).length
      };
    });

    console.log(`✅ 分析了 ${htmlFiles.length} 个HTML文件`);
  }

  // 查找HTML文件
  findHtmlFiles(dir) {
    const htmlFiles = [];
    
    const searchDir = (searchPath) => {
      const items = fs.readdirSync(searchPath);
      
      items.forEach(item => {
        const itemPath = path.join(searchPath, item);
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
          searchDir(itemPath);
        } else if (path.extname(item).toLowerCase() === '.html') {
          htmlFiles.push(itemPath);
        }
      });
    };
    
    searchDir(dir);
    return htmlFiles;
  }

  // 提取页面标题
  extractTitle(content) {
    const titleMatch = content.match(/<title>(.*?)<\/title>/i);
    return titleMatch ? titleMatch[1] : 'No title';
  }

  // 检查资源优化
  checkResourceOptimization() {
    console.log('\n⚡ 检查资源优化...');
    
    const outDir = path.join(process.cwd(), 'out');
    
    // 检查压缩文件
    const hasGzipFiles = this.checkForFiles(outDir, '.gz');
    const hasBrotliFiles = this.checkForFiles(outDir, '.br');
    
    // 检查图片优化
    const imageOptimization = this.checkImageOptimization(outDir);
    
    // 检查CSS和JS压缩
    const assetOptimization = this.checkAssetOptimization(outDir);
    
    this.metrics.resourceOptimization = {
      gzipCompression: hasGzipFiles,
      brotliCompression: hasBrotliFiles,
      imageOptimization,
      assetOptimization
    };

    console.log(`✅ 资源优化检查完成`);
  }

  // 检查特定扩展名的文件
  checkForFiles(dir, extension) {
    const checkDir = (searchPath) => {
      const items = fs.readdirSync(searchPath);
      
      for (const item of items) {
        const itemPath = path.join(searchPath, item);
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
          if (checkDir(itemPath)) return true;
        } else if (item.endsWith(extension)) {
          return true;
        }
      }
      return false;
    };
    
    return checkDir(dir);
  }

  // 检查图片优化
  checkImageOptimization(dir) {
    const imageStats = {
      total: 0,
      webpCount: 0,
      avgSize: 0,
      largeImages: []
    };

    const checkImages = (searchPath) => {
      const items = fs.readdirSync(searchPath);
      
      items.forEach(item => {
        const itemPath = path.join(searchPath, item);
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
          checkImages(itemPath);
        } else {
          const ext = path.extname(item).toLowerCase();
          if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'].includes(ext)) {
            imageStats.total++;
            imageStats.avgSize += stats.size;
            
            if (ext === '.webp') {
              imageStats.webpCount++;
            }
            
            if (stats.size > 100 * 1024) { // 大于100KB
              imageStats.largeImages.push({
                path: path.relative(dir, itemPath),
                size: stats.size
              });
            }
          }
        }
      });
    };

    checkImages(dir);
    
    if (imageStats.total > 0) {
      imageStats.avgSize = imageStats.avgSize / imageStats.total;
    }

    return imageStats;
  }

  // 检查资源压缩
  checkAssetOptimization(dir) {
    const optimization = {
      minifiedJS: 0,
      minifiedCSS: 0,
      totalJS: 0,
      totalCSS: 0
    };

    const checkAssets = (searchPath) => {
      const items = fs.readdirSync(searchPath);
      
      items.forEach(item => {
        const itemPath = path.join(searchPath, item);
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
          checkAssets(itemPath);
        } else {
          const ext = path.extname(item).toLowerCase();
          
          if (ext === '.js') {
            optimization.totalJS++;
            if (item.includes('.min.') || this.isMinified(itemPath)) {
              optimization.minifiedJS++;
            }
          } else if (ext === '.css') {
            optimization.totalCSS++;
            if (item.includes('.min.') || this.isMinified(itemPath)) {
              optimization.minifiedCSS++;
            }
          }
        }
      });
    };

    checkAssets(dir);
    return optimization;
  }

  // 简单检查文件是否被压缩
  isMinified(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      // 如果平均行长度很长且换行很少，可能是压缩的
      const avgLineLength = content.length / lines.length;
      return avgLineLength > 200 && lines.length < 10;
    } catch {
      return false;
    }
  }

  // 检查缓存策略
  checkCacheability() {
    console.log('\n💾 检查缓存策略...');
    
    const outDir = path.join(process.cwd(), 'out');
    const cacheAnalysis = {
      hashedFiles: 0,
      totalStaticFiles: 0,
      serviceWorker: false,
      manifest: false
    };

    const checkCache = (searchPath) => {
      const items = fs.readdirSync(searchPath);
      
      items.forEach(item => {
        const itemPath = path.join(searchPath, item);
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
          checkCache(itemPath);
        } else {
          const ext = path.extname(item).toLowerCase();
          
          if (['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'].includes(ext)) {
            cacheAnalysis.totalStaticFiles++;
            
            // 检查是否有hash（通常包含8+字符的随机字符串）
            if (/[a-f0-9]{8,}/.test(item)) {
              cacheAnalysis.hashedFiles++;
            }
          }
          
          if (item === 'sw.js') {
            cacheAnalysis.serviceWorker = true;
          }
          
          if (item === 'manifest.json') {
            cacheAnalysis.manifest = true;
          }
        }
      });
    };

    checkCache(outDir);
    this.metrics.cacheability = cacheAnalysis;

    console.log(`✅ 缓存策略检查完成`);
  }

  // 生成性能报告
  generateReport() {
    console.log('\n📄 生成性能报告...');
    
    const report = {
      ...this.metrics,
      summary: this.generateSummary(),
      recommendations: this.generateRecommendations(),
      score: this.calculatePerformanceScore()
    };

    const reportPath = 'performance-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`✅ 详细报告已保存到: ${reportPath}`);
    return report;
  }

  // 生成摘要
  generateSummary() {
    const buildSizeMB = (this.metrics.buildSize / 1024 / 1024).toFixed(2);
    const pageCount = Object.keys(this.metrics.pageMetrics).length;
    
    return {
      buildSizeMB: parseFloat(buildSizeMB),
      pageCount,
      hasServiceWorker: this.metrics.cacheability.serviceWorker,
      hasManifest: this.metrics.cacheability.manifest,
      imageOptimizationRatio: this.metrics.resourceOptimization.imageOptimization.webpCount / 
        Math.max(this.metrics.resourceOptimization.imageOptimization.total, 1)
    };
  }

  // 生成建议
  generateRecommendations() {
    const recommendations = [];
    
    // 构建大小建议
    if (this.metrics.buildSize > 25 * 1024 * 1024) {
      recommendations.push({
        type: 'build-size',
        priority: 'high',
        message: '构建包大小超过25MB限制',
        action: '考虑代码分割、移除未使用依赖、压缩资源'
      });
    }

    // 图片优化建议
    const imageOpt = this.metrics.resourceOptimization.imageOptimization;
    if (imageOpt.total > 0 && imageOpt.webpCount / imageOpt.total < 0.5) {
      recommendations.push({
        type: 'image-optimization',
        priority: 'medium',
        message: '建议使用更多WebP格式图片',
        action: '转换PNG/JPEG图片为WebP格式以减少大小'
      });
    }

    // 缓存策略建议
    const cache = this.metrics.cacheability;
    if (cache.hashedFiles / Math.max(cache.totalStaticFiles, 1) < 0.8) {
      recommendations.push({
        type: 'caching',
        priority: 'medium',
        message: '静态资源缺少文件名哈希',
        action: '为静态资源添加内容哈希以改善缓存策略'
      });
    }

    // PWA建议
    if (!cache.serviceWorker || !cache.manifest) {
      recommendations.push({
        type: 'pwa',
        priority: 'low',
        message: 'PWA功能不完整',
        action: '添加Service Worker和Web App Manifest'
      });
    }

    return recommendations;
  }

  // 计算性能分数
  calculatePerformanceScore() {
    let score = 100;
    
    // 构建大小评分 (30分)
    const buildSizeMB = this.metrics.buildSize / 1024 / 1024;
    if (buildSizeMB > 25) score -= 30;
    else if (buildSizeMB > 15) score -= 20;
    else if (buildSizeMB > 10) score -= 10;
    else if (buildSizeMB > 5) score -= 5;

    // 资源优化评分 (25分)
    const imageOpt = this.metrics.resourceOptimization.imageOptimization;
    const webpRatio = imageOpt.total > 0 ? imageOpt.webpCount / imageOpt.total : 1;
    score -= (1 - webpRatio) * 15;

    const assetOpt = this.metrics.resourceOptimization.assetOptimization;
    const jsMinRatio = assetOpt.totalJS > 0 ? assetOpt.minifiedJS / assetOpt.totalJS : 1;
    const cssMinRatio = assetOpt.totalCSS > 0 ? assetOpt.minifiedCSS / assetOpt.totalCSS : 1;
    score -= (2 - jsMinRatio - cssMinRatio) * 5;

    // 缓存策略评分 (25分)
    const cache = this.metrics.cacheability;
    const hashRatio = cache.totalStaticFiles > 0 ? cache.hashedFiles / cache.totalStaticFiles : 1;
    score -= (1 - hashRatio) * 15;
    
    if (!cache.serviceWorker) score -= 5;
    if (!cache.manifest) score -= 5;

    // 页面质量评分 (20分)
    const pages = Object.values(this.metrics.pageMetrics);
    if (pages.length > 0) {
      const avgScriptTags = pages.reduce((sum, page) => sum + page.scriptTags, 0) / pages.length;
      if (avgScriptTags > 10) score -= 10;
      else if (avgScriptTags > 5) score -= 5;
    }

    return Math.max(0, Math.round(score));
  }
}

// 主函数
async function main() {
  try {
    const collector = new PerformanceCollector();
    
    // 收集各项指标
    if (!collector.collectBuildMetrics()) {
      process.exit(1);
    }
    
    collector.collectPageMetrics();
    collector.checkResourceOptimization();
    collector.checkCacheability();
    
    // 生成报告
    const report = collector.generateReport();
    
    // 输出总结
    console.log('\n🎯 性能测试总结:');
    console.log(`📦 构建大小: ${report.summary.buildSizeMB}MB`);
    console.log(`📄 页面数量: ${report.summary.pageCount}`);
    console.log(`⚡ 性能评分: ${report.score}/100`);
    console.log(`💡 优化建议: ${report.recommendations.length}条`);
    
    // 输出建议
    if (report.recommendations.length > 0) {
      console.log('\n📋 优化建议:');
      report.recommendations.forEach((rec, index) => {
        const priority = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
        console.log(`${index + 1}. ${priority} ${rec.message}`);
        console.log(`   ➡️  ${rec.action}`);
      });
    }
    
    // 根据评分给出总体评价
    if (report.score >= 90) {
      console.log('\n🎉 优秀！性能表现出色');
    } else if (report.score >= 75) {
      console.log('\n✅ 良好！性能表现不错');
    } else if (report.score >= 60) {
      console.log('\n⚠️  一般！建议进行优化');
    } else {
      console.log('\n🚨 需要改进！请立即优化');
    }
    
  } catch (error) {
    console.error('❌ 性能测试过程中发生错误:', error.message);
    process.exit(1);
  }
}

main(); 