#!/usr/bin/env node

/**
 * 性能测试脚本
 * 用于验证构建输出的质量和性能指标
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 开始性能测试...\n');

// 检查构建输出
function checkBuildOutput() {
  console.log('📁 检查构建输出...');
  
  const outDir = path.join(process.cwd(), 'out');
  if (!fs.existsSync(outDir)) {
    console.error('❌ 构建输出目录不存在！');
    return false;
  }

  const requiredFiles = [
    'index.html',
    'manifest.json',
    'sw.js',
    'robots.txt',
    'sitemap.xml'
  ];

  const missingFiles = requiredFiles.filter(file => {
    const filePath = path.join(outDir, file);
    return !fs.existsSync(filePath);
  });

  if (missingFiles.length > 0) {
    console.error(`❌ 缺少必要文件: ${missingFiles.join(', ')}`);
    return false;
  }

  console.log('✅ 所有必要文件都存在');
  return true;
}

// 检查文件大小
function checkFileSizes() {
  console.log('\n📊 检查文件大小...');
  
  const outDir = path.join(process.cwd(), 'out');
  const files = fs.readdirSync(outDir);
  
  let totalSize = 0;
  const sizeLimits = {
    'index.html': 25 * 1024, // 25KB
    'manifest.json': 3 * 1024, // 3KB
    'sw.js': 6 * 1024, // 6KB
  };

  files.forEach(file => {
    const filePath = path.join(outDir, file);
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    
    if (sizeLimits[file]) {
      const limitKB = sizeLimits[file] / 1024;
      if (stats.size > sizeLimits[file]) {
        console.warn(`⚠️  ${file}: ${sizeKB}KB (超过 ${limitKB}KB 限制)`);
      } else {
        console.log(`✅ ${file}: ${sizeKB}KB`);
      }
    } else {
      console.log(`📄 ${file}: ${sizeKB}KB`);
    }
    
    totalSize += stats.size;
  });

  const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
  console.log(`\n📦 总大小: ${totalSizeMB}MB`);
  
  if (totalSize > 25 * 1024 * 1024) { // 25MB
    console.warn(`⚠️  总大小超过25MB限制！`);
    return false;
  }
  
  console.log('✅ 文件大小符合要求');
  return true;
}

// 检查PWA配置
function checkPWAConfig() {
  console.log('\n📱 检查PWA配置...');
  
  const outDir = path.join(process.cwd(), 'out');
  const manifestPath = path.join(outDir, 'manifest.json');
  const swPath = path.join(outDir, 'sw.js');
  
  if (!fs.existsSync(manifestPath)) {
    console.error('❌ manifest.json 不存在');
    return false;
  }
  
  if (!fs.existsSync(swPath)) {
    console.error('❌ sw.js 不存在');
    return false;
  }
  
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const requiredFields = ['name', 'short_name', 'start_url', 'display'];
    
    const missingFields = requiredFields.filter(field => !manifest[field]);
    if (missingFields.length > 0) {
      console.error(`❌ manifest.json 缺少必要字段: ${missingFields.join(', ')}`);
      return false;
    }
    
    console.log('✅ PWA配置完整');
    return true;
  } catch (error) {
    console.error('❌ manifest.json 格式错误:', error.message);
    return false;
  }
}

// 检查SEO配置
function checkSEOConfig() {
  console.log('\n🔍 检查SEO配置...');
  
  const outDir = path.join(process.cwd(), 'out');
  const robotsPath = path.join(outDir, 'robots.txt');
  const sitemapPath = path.join(outDir, 'sitemap.xml');
  
  if (!fs.existsSync(robotsPath)) {
    console.error('❌ robots.txt 不存在');
    return false;
  }
  
  if (!fs.existsSync(sitemapPath)) {
    console.error('❌ sitemap.xml 不存在');
    return false;
  }
  
  const robotsContent = fs.readFileSync(robotsPath, 'utf8');
  const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
  
  if (!robotsContent.includes('User-agent: *')) {
    console.warn('⚠️  robots.txt 可能缺少标准配置');
  }
  
  if (!sitemapContent.includes('<?xml')) {
    console.warn('⚠️  sitemap.xml 格式可能不正确');
  }
  
  console.log('✅ SEO配置完整');
  return true;
}

// 检查工具页面
function checkToolPages() {
  console.log('\n🛠️  检查工具页面...');
  
  const outDir = path.join(process.cwd(), 'out');
  const toolsDir = path.join(outDir, 'tools');
  
  if (!fs.existsSync(toolsDir)) {
    console.error('❌ tools 目录不存在');
    return false;
  }
  
  const toolCategories = ['text', 'image', 'dev', 'utility', 'learn'];
  const missingCategories = toolCategories.filter(category => {
    const categoryPath = path.join(toolsDir, category);
    return !fs.existsSync(categoryPath);
  });
  
  if (missingCategories.length > 0) {
    console.error(`❌ 缺少工具分类: ${missingCategories.join(', ')}`);
    return false;
  }
  
  console.log('✅ 所有工具分类都存在');
  return true;
}

// 主函数
function runPerformanceTest() {
  console.log('🚀 工具集网站性能测试\n');
  
  const tests = [
    { name: '构建输出检查', fn: checkBuildOutput },
    { name: '文件大小检查', fn: checkFileSizes },
    { name: 'PWA配置检查', fn: checkPWAConfig },
    { name: 'SEO配置检查', fn: checkSEOConfig },
    { name: '工具页面检查', fn: checkToolPages }
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  tests.forEach(test => {
    console.log(`\n--- ${test.name} ---`);
    if (test.fn()) {
      passedTests++;
    }
  });
  
  console.log('\n' + '='.repeat(50));
  console.log(`📊 测试结果: ${passedTests}/${totalTests} 通过`);
  
  if (passedTests === totalTests) {
    console.log('🎉 所有测试通过！网站已准备好部署。');
    process.exit(0);
  } else {
    console.log('⚠️  部分测试失败，请检查并修复问题。');
    process.exit(1);
  }
}

// 运行测试
runPerformanceTest(); 