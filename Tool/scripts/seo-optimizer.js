#!/usr/bin/env node

/**
 * SEO优化脚本
 * 用于检查和优化网站的SEO配置
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 开始SEO优化检查...\n');

// 检查robots.txt
function checkRobotsTxt() {
  console.log('🤖 检查robots.txt...');
  
  const robotsPath = path.join(process.cwd(), 'out', 'robots.txt');
  if (!fs.existsSync(robotsPath)) {
    console.error('❌ robots.txt 不存在');
    return false;
  }
  
  const content = fs.readFileSync(robotsPath, 'utf8');
  
  // 检查标准配置
  const requiredLines = [
    'User-agent: *',
    'Allow: /',
    'Sitemap:'
  ];
  
  const missingLines = requiredLines.filter(line => !content.includes(line));
  if (missingLines.length > 0) {
    console.warn(`⚠️  robots.txt 缺少标准配置: ${missingLines.join(', ')}`);
  }
  
  console.log('✅ robots.txt 配置检查完成');
  return true;
}

// 检查sitemap.xml
function checkSitemap() {
  console.log('\n🗺️  检查sitemap.xml...');
  
  const sitemapPath = path.join(process.cwd(), 'out', 'sitemap.xml');
  if (!fs.existsSync(sitemapPath)) {
    console.error('❌ sitemap.xml 不存在');
    return false;
  }
  
  const content = fs.readFileSync(sitemapPath, 'utf8');
  
  // 检查XML格式
  if (!content.includes('<?xml')) {
    console.error('❌ sitemap.xml 格式不正确');
    return false;
  }
  
  // 检查URL数量
  const urlMatches = content.match(/<url>/g);
  const urlCount = urlMatches ? urlMatches.length : 0;
  
  console.log(`📊 发现 ${urlCount} 个URL`);
  
  if (urlCount < 10) {
    console.warn('⚠️  sitemap.xml 中的URL数量较少');
  }
  
  console.log('✅ sitemap.xml 检查完成');
  return true;
}

// 检查meta标签
function checkMetaTags() {
  console.log('\n🏷️  检查meta标签...');
  
  const indexPath = path.join(process.cwd(), 'out', 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.error('❌ index.html 不存在');
    return false;
  }
  
  const content = fs.readFileSync(indexPath, 'utf8');
  
  // 检查必要的meta标签
  const requiredMetaTags = [
    'title',
    'description',
    'viewport',
    'charset'
  ];
  
  const missingTags = requiredMetaTags.filter(tag => {
    if (tag === 'charset') {
      return !content.includes('charset=');
    }
    return !content.includes(`name="${tag}"`) && !content.includes(`property="${tag}"`);
  });
  
  if (missingTags.length > 0) {
    console.warn(`⚠️  缺少meta标签: ${missingTags.join(', ')}`);
  }
  
  // 检查Open Graph标签
  const ogTags = ['og:title', 'og:description', 'og:type', 'og:url'];
  const missingOgTags = ogTags.filter(tag => !content.includes(`property="${tag}"`));
  
  if (missingOgTags.length > 0) {
    console.warn(`⚠️  缺少Open Graph标签: ${missingOgTags.join(', ')}`);
  }
  
  // 检查Twitter Card标签
  const twitterTags = ['twitter:card', 'twitter:title', 'twitter:description'];
  const missingTwitterTags = twitterTags.filter(tag => !content.includes(`name="${tag}"`));
  
  if (missingTwitterTags.length > 0) {
    console.warn(`⚠️  缺少Twitter Card标签: ${missingTwitterTags.join(', ')}`);
  }
  
  console.log('✅ meta标签检查完成');
  return true;
}

// 检查结构化数据
function checkStructuredData() {
  console.log('\n📊 检查结构化数据...');
  
  const indexPath = path.join(process.cwd(), 'out', 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.error('❌ index.html 不存在');
    return false;
  }
  
  const content = fs.readFileSync(indexPath, 'utf8');
  
  // 检查JSON-LD结构化数据
  if (!content.includes('application/ld+json')) {
    console.warn('⚠️  缺少JSON-LD结构化数据');
  } else {
    console.log('✅ 发现JSON-LD结构化数据');
  }
  
  // 检查微数据
  if (!content.includes('itemtype=')) {
    console.warn('⚠️  缺少微数据结构化数据');
  } else {
    console.log('✅ 发现微数据结构化数据');
  }
  
  console.log('✅ 结构化数据检查完成');
  return true;
}

// 检查页面性能
function checkPagePerformance() {
  console.log('\n⚡ 检查页面性能...');
  
  const indexPath = path.join(process.cwd(), 'out', 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.error('❌ index.html 不存在');
    return false;
  }
  
  const content = fs.readFileSync(indexPath, 'utf8');
  const fileSize = fs.statSync(indexPath).size;
  const fileSizeKB = (fileSize / 1024).toFixed(2);
  
  console.log(`📄 页面大小: ${fileSizeKB}KB`);
  
  if (fileSize > 50 * 1024) { // 50KB
    console.warn('⚠️  页面大小超过50KB，可能影响加载速度');
  } else {
    console.log('✅ 页面大小合理');
  }
  
  // 检查图片优化
  const imgTags = content.match(/<img[^>]*>/g) || [];
  console.log(`🖼️  发现 ${imgTags.length} 个图片标签`);
  
  // 检查CSS和JS优化
  const cssLinks = content.match(/<link[^>]*rel="stylesheet"[^>]*>/g) || [];
  const jsScripts = content.match(/<script[^>]*src[^>]*>/g) || [];
  
  console.log(`🎨 CSS文件: ${cssLinks.length} 个`);
  console.log(`📜 JS文件: ${jsScripts.length} 个`);
  
  console.log('✅ 页面性能检查完成');
  return true;
}

// 生成SEO报告
function generateSEOReport() {
  console.log('\n📋 生成SEO优化建议...\n');
  
  const recommendations = [
    '✅ 确保所有页面都有唯一的title和description',
    '✅ 使用语义化HTML标签（h1, h2, article, section等）',
    '✅ 优化图片alt属性',
    '✅ 实现面包屑导航',
    '✅ 添加内部链接',
    '✅ 优化URL结构',
    '✅ 实现移动端优化',
    '✅ 添加结构化数据',
    '✅ 优化页面加载速度',
    '✅ 实现PWA功能（已完成）',
    '✅ 添加站点地图（已完成）',
    '✅ 配置robots.txt（已完成）'
  ];
  
  console.log('🎯 SEO优化建议:');
  recommendations.forEach((rec, index) => {
    console.log(`${index + 1}. ${rec}`);
  });
  
  console.log('\n📈 下一步SEO优化行动:');
  console.log('1. 提交站点地图到搜索引擎');
  console.log('2. 注册Google Search Console');
  console.log('3. 注册Bing Webmaster Tools');
  console.log('4. 监控搜索排名和流量');
  console.log('5. 定期更新内容');
  console.log('6. 优化页面加载速度');
}

// 主函数
function runSEOOptimization() {
  console.log('🚀 工具集网站SEO优化检查\n');
  
  const tests = [
    { name: 'robots.txt检查', fn: checkRobotsTxt },
    { name: 'sitemap.xml检查', fn: checkSitemap },
    { name: 'meta标签检查', fn: checkMetaTags },
    { name: '结构化数据检查', fn: checkStructuredData },
    { name: '页面性能检查', fn: checkPagePerformance }
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
  console.log(`📊 SEO检查结果: ${passedTests}/${totalTests} 通过`);
  
  generateSEOReport();
  
  if (passedTests === totalTests) {
    console.log('\n🎉 SEO配置良好！网站已准备好搜索引擎优化。');
    process.exit(0);
  } else {
    console.log('\n⚠️  部分SEO配置需要优化，请参考上述建议。');
    process.exit(1);
  }
}

// 运行SEO优化检查
runSEOOptimization(); 