#!/usr/bin/env node

/**
 * 增强版性能测试脚本
 * 用于验证构建输出的质量和性能指标
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 增强的性能测试脚本
class PerformanceTester {
  constructor() {
    this.buildDir = path.join(process.cwd(), '.next');
    this.staticDir = path.join(process.cwd(), 'out');
    this.report = {
      timestamp: new Date().toISOString(),
      buildMetrics: {},
      bundleAnalysis: {},
      pageMetrics: {},
      recommendations: [],
      optimization: {
        suggestions: [],
        priorities: [],
        estimatedSavings: {}
      }
    };
  }

  // 分析构建结果
  analyzeBuild() {
    console.log('🔍 分析构建结果...');
    
    const outputDir = fs.existsSync(this.staticDir) ? this.staticDir : this.buildDir;
    const buildStats = this.getDirectoryStats(outputDir);
    
    this.report.buildMetrics = {
      totalSize: buildStats.totalSize,
      fileCount: buildStats.fileCount,
      ...this.analyzeBundleFiles(outputDir)
    };

    console.log(`📊 总构建大小: ${this.formatBytes(buildStats.totalSize)}`);
    console.log(`📁 文件总数: ${buildStats.fileCount}`);
  }

  // 分析Bundle文件
  analyzeBundleFiles(dir) {
    const analysis = {
      javascript: { count: 0, size: 0, files: [] },
      css: { count: 0, size: 0, files: [] },
      html: { count: 0, size: 0, files: [] },
      images: { count: 0, size: 0, files: [] },
      fonts: { count: 0, size: 0, files: [] },
      other: { count: 0, size: 0, files: [] }
    };

    this.walkDirectory(dir, (filePath, stats) => {
      const ext = path.extname(filePath).toLowerCase();
      const size = stats.size;
      const fileName = path.basename(filePath);
      
      const fileInfo = { name: fileName, size, path: filePath };

      switch (ext) {
        case '.js':
        case '.mjs':
          analysis.javascript.count++;
          analysis.javascript.size += size;
          analysis.javascript.files.push(fileInfo);
          break;
        case '.css':
          analysis.css.count++;
          analysis.css.size += size;
          analysis.css.files.push(fileInfo);
          break;
        case '.html':
          analysis.html.count++;
          analysis.html.size += size;
          analysis.html.files.push(fileInfo);
          break;
        case '.png':
        case '.jpg':
        case '.jpeg':
        case '.gif':
        case '.svg':
        case '.webp':
          analysis.images.count++;
          analysis.images.size += size;
          analysis.images.files.push(fileInfo);
          break;
        case '.woff':
        case '.woff2':
        case '.ttf':
        case '.eot':
          analysis.fonts.count++;
          analysis.fonts.size += size;
          analysis.fonts.files.push(fileInfo);
          break;
        default:
          analysis.other.count++;
          analysis.other.size += size;
          analysis.other.files.push(fileInfo);
      }
    });

    // 排序文件（按大小降序）
    Object.keys(analysis).forEach(key => {
      if (analysis[key].files) {
        analysis[key].files.sort((a, b) => b.size - a.size);
      }
    });

    return analysis;
  }

  // 深度Bundle分析
  performBundleAnalysis() {
    console.log('📦 执行Bundle分析...');
    
    const chunksDir = path.join(this.buildDir, 'static', 'chunks');
    if (!fs.existsSync(chunksDir)) {
      console.log('⚠️  未找到chunks目录，跳过Bundle分析');
      return;
    }

    const chunks = [];
    let totalBundleSize = 0;
    let largestBundle = { name: '', size: 0, path: '' };

    // 分析所有chunk文件
    fs.readdirSync(chunksDir).forEach(file => {
      if (file.endsWith('.js')) {
        const filePath = path.join(chunksDir, file);
        const stats = fs.statSync(filePath);
        const sizeKB = Math.round(stats.size / 1024 * 100) / 100;
        
        chunks.push({ name: file, size: sizeKB, path: filePath });
        totalBundleSize += sizeKB;
        
        if (sizeKB > largestBundle.size) {
          largestBundle = { name: file, size: sizeKB, path: filePath };
        }
      }
    });

    // 分析依赖大小
    const dependencies = this.analyzeDependencies();
    
    this.report.bundleAnalysis = {
      timestamp: new Date().toISOString(),
      totalBundleSize,
      largestBundle,
      topDependencies: dependencies.slice(0, 5),
      suggestions: this.generateBundleOptimizationSuggestions(chunks, dependencies),
      recommendations: this.generateBundleRecommendations(totalBundleSize, largestBundle)
    };

    console.log(`📦 Bundle总大小: ${totalBundleSize.toFixed(2)}KB`);
    console.log(`🔍 最大Bundle: ${largestBundle.name} (${largestBundle.size.toFixed(2)}KB)`);
  }

  // 分析依赖大小
  analyzeDependencies() {
    console.log('📚 分析依赖项...');
    
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      const depSizes = [];
      
      Object.keys(dependencies).forEach(dep => {
        try {
          const depPath = path.join('node_modules', dep);
          if (fs.existsSync(depPath)) {
            const size = this.getDirectoryStats(depPath).totalSize;
            depSizes.push({
              name: dep,
              size: Math.round(size / 1024), // KB
              unit: 'K'
            });
          }
        } catch (error) {
          // 忽略无法访问的依赖
        }
      });
      
      return depSizes.sort((a, b) => b.size - a.size);
    } catch (error) {
      console.log('⚠️  无法分析依赖项:', error.message);
      return [];
    }
  }

  // 生成Bundle优化建议
  generateBundleOptimizationSuggestions(chunks, dependencies) {
    const suggestions = [];
    
    // 检查大型依赖
    const largeDeps = dependencies.filter(dep => dep.size > 1000);
    if (largeDeps.length > 0) {
      suggestions.push({
        type: 'dependency-optimization',
        message: `发现${largeDeps.length}个大型依赖项`,
        action: `考虑替换或优化: ${largeDeps.slice(0, 3).map(d => d.name).join(', ')}`
      });
    }

    // 检查重复功能的依赖
    const duplicates = this.findDuplicateDependencies(dependencies);
    if (duplicates.length > 0) {
      suggestions.push({
        type: 'duplicate-dependencies',
        message: `发现${duplicates.length}个可能的重复依赖`,
        action: '检查并合并相似功能的包'
      });
    }

    // 检查chunk大小
    const largeChunks = chunks.filter(chunk => chunk.size > 500);
    if (largeChunks.length > 0) {
      suggestions.push({
        type: 'code-splitting',
        message: `发现${largeChunks.length}个大型chunk`,
        action: '考虑进一步代码分割'
      });
    }

    return suggestions;
  }

  // 查找重复依赖
  findDuplicateDependencies(dependencies) {
    const duplicates = [];
    const patterns = [
      ['moment', 'date-fns', 'dayjs'], // 日期库
      ['lodash', 'ramda', 'underscore'], // 工具库
      ['axios', 'fetch', 'superagent'], // HTTP客户端
      ['react-router', 'next-router', '@reach/router'], // 路由
    ];

    patterns.forEach(pattern => {
      const found = dependencies.filter(dep => 
        pattern.some(p => dep.name.includes(p))
      );
      if (found.length > 1) {
        duplicates.push(...found);
      }
    });

    return duplicates;
  }

  // 生成Bundle优化建议
  generateBundleRecommendations(totalSize, largestBundle) {
    const recommendations = [];
    
    if (totalSize > 2000) {
      recommendations.push('考虑使用动态导入减少初始加载大小');
    }
    
    if (largestBundle.size > 500) {
      recommendations.push('实现组件级别的懒加载');
    }
    
    recommendations.push('优化图片和静态资源');
    recommendations.push('使用Tree Shaking移除未使用的代码');
    recommendations.push('考虑使用更轻量的替代库');
    
    return recommendations;
  }

  // 分析页面性能
  analyzePageMetrics() {
    console.log('📄 分析页面性能...');
    
    const htmlDir = fs.existsSync(this.staticDir) ? this.staticDir : this.buildDir;
    const htmlFiles = this.findFiles(htmlDir, '.html');
    
    const pageMetrics = {};
    
    htmlFiles.forEach(filePath => {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(htmlDir, filePath);
      
      pageMetrics[relativePath] = {
        size: Buffer.byteLength(content, 'utf8'),
        scriptTags: (content.match(/<script[^>]*>/g) || []).length,
        styleTags: (content.match(/<style[^>]*>/g) || []).length,
        linkTags: (content.match(/<link[^>]*>/g) || []).length,
        imageTags: (content.match(/<img[^>]*>/g) || []).length,
        hasServiceWorker: content.includes('serviceWorker'),
        hasManifest: content.includes('manifest'),
        title: this.extractTitle(content),
        metaTags: (content.match(/<meta[^>]*>/g) || []).length
      };
    });
    
    this.report.pageMetrics = pageMetrics;
    console.log(`📄 分析了 ${Object.keys(pageMetrics).length} 个页面`);
  }

  // 提取页面标题
  extractTitle(html) {
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    return titleMatch ? titleMatch[1] : 'No title';
  }

  // 生成优化建议
  generateOptimizationRecommendations() {
    console.log('💡 生成优化建议...');
    
    const suggestions = [];
    const priorities = [];
    const estimatedSavings = {};

    // 基于Bundle分析的建议
    if (this.report.bundleAnalysis.totalBundleSize > 2000) {
      suggestions.push({
        type: 'code-splitting',
        title: '代码分割优化',
        description: '当前Bundle过大，建议实施更细粒度的代码分割',
        impact: 'high',
        effort: 'medium',
        steps: [
          '使用动态导入(import())分割大型组件',
          '按路由分割代码',
          '分离第三方库到单独的chunk'
        ]
      });
      priorities.push('code-splitting');
      estimatedSavings['code-splitting'] = '30-50%';
    }

    // 图标优化建议
    const lucideUsage = this.analyzeLucideUsage();
    if (lucideUsage.totalIcons > 20) {
      suggestions.push({
        type: 'icon-optimization',
        title: '图标库优化',
        description: '优化Lucide图标的使用方式',
        impact: 'medium',
        effort: 'low',
        steps: [
          '使用选择性图标导入',
          '实现图标缓存机制',
          '按需加载图标'
        ]
      });
      estimatedSavings['icon-optimization'] = '15-25%';
    }

    // 图片优化建议
    const imageAnalysis = this.report.buildMetrics.images;
    if (imageAnalysis && imageAnalysis.size > 500000) {
      suggestions.push({
        type: 'image-optimization',
        title: '图片资源优化',
        description: '图片资源占用较大空间',
        impact: 'medium',
        effort: 'low',
        steps: [
          '使用WebP格式',
          '实施图片压缩',
          '添加响应式图片'
        ]
      });
      estimatedSavings['image-optimization'] = '20-40%';
    }

    // 缓存策略建议
    suggestions.push({
      type: 'caching-strategy',
      title: '缓存策略优化',
      description: '改进资源缓存机制',
      impact: 'high',
      effort: 'medium',
      steps: [
        '实施Service Worker缓存',
        '优化HTTP缓存头',
        '使用浏览器缓存API'
      ]
    });

    this.report.optimization = {
      suggestions,
      priorities,
      estimatedSavings
    };
  }

  // 分析Lucide图标使用情况
  analyzeLucideUsage() {
    const srcDir = path.join(process.cwd(), 'src');
    let totalIcons = 0;
    const iconUsage = new Set();

    try {
      this.walkDirectory(srcDir, (filePath) => {
        if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
          const content = fs.readFileSync(filePath, 'utf8');
          
          // 查找从lucide-react导入的图标
          const imports = content.match(/import\s+{([^}]+)}\s+from\s+['"]lucide-react['"]/g);
          if (imports) {
            imports.forEach(imp => {
              const icons = imp.match(/{([^}]+)}/)[1]
                .split(',')
                .map(i => i.trim())
                .filter(i => i && !i.includes('Props'));
              
              icons.forEach(icon => iconUsage.add(icon));
              totalIcons += icons.length;
            });
          }
        }
      });
    } catch (error) {
      console.log('⚠️  无法分析图标使用情况:', error.message);
    }

    return {
      totalIcons,
      uniqueIcons: iconUsage.size,
      iconList: Array.from(iconUsage)
    };
  }

  // 生成报告
  generateReport() {
    console.log('📋 生成性能报告...');
    
    const reportPath = path.join(process.cwd(), 'performance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.report, null, 2));
    
    console.log(`✅ 报告已生成: ${reportPath}`);
    
    // 生成人类可读的摘要
    this.generateSummary();
  }

  // 生成摘要
  generateSummary() {
    console.log('\n📊 性能分析摘要');
    console.log('='.repeat(50));
    
    // 构建大小摘要
    if (this.report.buildMetrics.totalSize) {
      console.log(`📦 总构建大小: ${this.formatBytes(this.report.buildMetrics.totalSize)}`);
    }
    
    // Bundle分析摘要
    if (this.report.bundleAnalysis.totalBundleSize) {
      console.log(`🗜️  Bundle大小: ${this.report.bundleAnalysis.totalBundleSize.toFixed(2)}KB`);
      console.log(`🔍 最大Bundle: ${this.report.bundleAnalysis.largestBundle.name} (${this.report.bundleAnalysis.largestBundle.size.toFixed(2)}KB)`);
    }
    
    // 页面数量
    const pageCount = Object.keys(this.report.pageMetrics).length;
    if (pageCount > 0) {
      console.log(`📄 分析页面数: ${pageCount}`);
    }
    
    // 优化建议
    const suggestionCount = this.report.optimization.suggestions.length;
    if (suggestionCount > 0) {
      console.log(`💡 优化建议: ${suggestionCount}项`);
      
      // 显示高优先级建议
      const highPriority = this.report.optimization.suggestions.filter(s => s.impact === 'high');
      if (highPriority.length > 0) {
        console.log('\n🔥 高优先级优化:');
        highPriority.forEach((suggestion, index) => {
          console.log(`  ${index + 1}. ${suggestion.title}`);
        });
      }
    }
    
    console.log('\n✨ 详细报告请查看 performance-report.json');
  }

  // 工具方法
  getDirectoryStats(dir) {
    let totalSize = 0;
    let fileCount = 0;
    
    this.walkDirectory(dir, (filePath, stats) => {
      totalSize += stats.size;
      fileCount++;
    });
    
    return { totalSize, fileCount };
  }

  walkDirectory(dir, callback) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const itemPath = path.join(dir, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        this.walkDirectory(itemPath, callback);
      } else {
        callback(itemPath, stats);
      }
    });
  }

  findFiles(dir, extension) {
    const files = [];
    
    this.walkDirectory(dir, (filePath) => {
      if (filePath.endsWith(extension)) {
        files.push(filePath);
      }
    });
    
    return files;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // 主要执行方法
  async run() {
    console.log('🚀 开始性能分析...');
    console.log('='.repeat(50));
    
    try {
      this.analyzeBuild();
      this.performBundleAnalysis();
      this.analyzePageMetrics();
      this.generateOptimizationRecommendations();
      this.generateReport();
      
      console.log('\n✅ 性能分析完成！');
    } catch (error) {
      console.error('❌ 性能分析失败:', error.message);
      process.exit(1);
    }
  }
}

// 执行性能测试
if (require.main === module) {
  const tester = new PerformanceTester();
  tester.run();
}

module.exports = PerformanceTester; 