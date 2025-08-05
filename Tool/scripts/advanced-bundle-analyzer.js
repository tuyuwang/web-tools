#!/usr/bin/env node

/**
 * 高级Bundle分析器
 * 分析依赖项大小，识别优化机会
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 开始高级Bundle分析...\n');

// 分析包大小
function analyzeBundleSize() {
  console.log('📊 分析Bundle大小...');
  
  const nextDir = path.join(process.cwd(), '.next');
  const staticDir = path.join(nextDir, 'static', 'chunks');
  
  if (!fs.existsSync(staticDir)) {
    console.error('❌ 构建输出不存在，请先运行 npm run build');
    return;
  }
  
  const chunks = fs.readdirSync(staticDir).filter(file => file.endsWith('.js'));
  const bundleInfo = [];
  
  chunks.forEach(chunk => {
    const filePath = path.join(staticDir, chunk);
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    
    bundleInfo.push({
      name: chunk,
      size: parseFloat(sizeKB),
      path: filePath
    });
  });
  
  // 按大小排序
  bundleInfo.sort((a, b) => b.size - a.size);
  
  console.log('\n📦 Bundle文件大小排序:');
  bundleInfo.forEach((bundle, index) => {
    const icon = index === 0 ? '🔴' : index < 3 ? '🟡' : '🟢';
    console.log(`${icon} ${bundle.name}: ${bundle.size}KB`);
  });
  
  return bundleInfo;
}

// 分析依赖项
function analyzeDependencies() {
  console.log('\n📋 分析依赖项...');
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  // 获取每个包的大小信息
  const depSizes = [];
  
  Object.keys(deps).forEach(dep => {
    try {
      const depPath = path.join('node_modules', dep);
      if (fs.existsSync(depPath)) {
        const result = execSync(`du -sh ${depPath}`, { encoding: 'utf8' });
        const sizeStr = result.split('\t')[0];
        const sizeMatch = sizeStr.match(/(\d+(?:\.\d+)?)(K|M|G)?/);
        
        if (sizeMatch) {
          let size = parseFloat(sizeMatch[1]);
          const unit = sizeMatch[2];
          
          // 转换为KB
          if (unit === 'M') size *= 1024;
          else if (unit === 'G') size *= 1024 * 1024;
          
          depSizes.push({ name: dep, size, unit: unit || 'K' });
        }
      }
    } catch (error) {
      // 忽略错误，继续处理其他依赖
    }
  });
  
  // 按大小排序
  depSizes.sort((a, b) => b.size - a.size);
  
  console.log('\n📦 依赖项大小排序（前10个）:');
  depSizes.slice(0, 10).forEach((dep, index) => {
    const icon = index === 0 ? '🔴' : index < 3 ? '🟡' : '🟢';
    console.log(`${icon} ${dep.name}: ${dep.size.toFixed(1)}${dep.unit}B`);
  });
  
  return depSizes;
}

// 生成优化建议
function generateOptimizationSuggestions(bundleInfo, depSizes) {
  console.log('\n💡 优化建议:');
  
  const suggestions = [];
  
  // 检查大型vendor chunk
  const largeVendorChunk = bundleInfo.find(b => b.name.includes('vendors') && b.size > 500);
  if (largeVendorChunk) {
    suggestions.push({
      type: 'bundle-splitting',
      message: `Vendor chunk过大 (${largeVendorChunk.size}KB)，建议进一步分割`,
      action: '实现更细粒度的代码分割策略'
    });
  }
  
  // 检查大型依赖项
  const largeDeps = depSizes.filter(d => d.size > 1000); // 大于1MB
  if (largeDeps.length > 0) {
    suggestions.push({
      type: 'dependency-optimization',
      message: `发现${largeDeps.length}个大型依赖项`,
      action: `考虑替换或优化: ${largeDeps.slice(0, 3).map(d => d.name).join(', ')}`
    });
  }
  
  // 检查重复依赖
  const duplicates = findDuplicateDependencies();
  if (duplicates.length > 0) {
    suggestions.push({
      type: 'duplicate-dependencies',
      message: `发现${duplicates.length}个可能的重复依赖`,
      action: '检查并合并相似功能的包'
    });
  }
  
  // 输出建议
  suggestions.forEach((suggestion, index) => {
    console.log(`\n${index + 1}. 📌 ${suggestion.message}`);
    console.log(`   ➡️  ${suggestion.action}`);
  });
  
  if (suggestions.length === 0) {
    console.log('✅ 当前Bundle配置良好，无需特殊优化');
  }
  
  return suggestions;
}

// 查找重复依赖
function findDuplicateDependencies() {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const deps = Object.keys({ ...packageJson.dependencies, ...packageJson.devDependencies });
  
  const duplicates = [];
  const categories = {
    ui: ['react', 'vue', 'angular'],
    icons: ['lucide', 'feather', 'heroicons', 'react-icons'],
    css: ['tailwind', 'styled-components', 'emotion'],
    utils: ['lodash', 'ramda', 'underscore'],
    charts: ['recharts', 'chart.js', 'd3']
  };
  
  Object.entries(categories).forEach(([category, keywords]) => {
    const matching = deps.filter(dep => 
      keywords.some(keyword => dep.includes(keyword))
    );
    
    if (matching.length > 1) {
      duplicates.push({ category, packages: matching });
    }
  });
  
  return duplicates;
}

// 生成优化报告
function generateOptimizationReport(bundleInfo, depSizes, suggestions) {
  const report = {
    timestamp: new Date().toISOString(),
    totalBundleSize: bundleInfo.reduce((sum, b) => sum + b.size, 0),
    largestBundle: bundleInfo[0],
    topDependencies: depSizes.slice(0, 5),
    suggestions: suggestions,
    recommendations: [
      '考虑使用动态导入减少初始加载大小',
      '实现组件级别的懒加载',
      '优化图片和静态资源',
      '使用Tree Shaking移除未使用的代码',
      '考虑使用更轻量的替代库'
    ]
  };
  
  fs.writeFileSync('bundle-analysis-report.json', JSON.stringify(report, null, 2));
  console.log('\n📄 详细报告已保存到: bundle-analysis-report.json');
  
  return report;
}

// 主函数
async function main() {
  try {
    const bundleInfo = analyzeBundleSize();
    const depSizes = analyzeDependencies();
    const suggestions = generateOptimizationSuggestions(bundleInfo, depSizes);
    const report = generateOptimizationReport(bundleInfo, depSizes, suggestions);
    
    console.log('\n🎯 总结:');
    console.log(`📦 总Bundle大小: ${report.totalBundleSize.toFixed(2)}KB`);
    console.log(`🔴 最大Bundle: ${report.largestBundle.name} (${report.largestBundle.size}KB)`);
    console.log(`💡 优化建议数量: ${suggestions.length}`);
    
    if (report.totalBundleSize > 25 * 1024) { // 25MB
      console.log('\n⚠️  警告: 总Bundle大小超过25MB限制！');
      console.log('🚨 建议立即优化以符合部署要求');
    } else {
      console.log('\n✅ Bundle大小在合理范围内');
    }
    
  } catch (error) {
    console.error('❌ 分析过程中发生错误:', error.message);
    process.exit(1);
  }
}

main();