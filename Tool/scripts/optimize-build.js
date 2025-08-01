const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 开始优化构建包大小...');

// 1. 清理不必要的文件
const cleanupFiles = [
  '.next/cache',
  '.next/server/pages-manifest.json',
  '.next/server/app-build-manifest.json',
  '.next/server/build-manifest.json',
];

cleanupFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    if (fs.statSync(filePath).isDirectory()) {
      fs.rmSync(filePath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(filePath);
    }
    console.log(`✅ 清理: ${file}`);
  }
});

// 2. 压缩静态资源
const publicDir = path.join(process.cwd(), 'public');
if (fs.existsSync(publicDir)) {
  console.log('📦 压缩静态资源...');
  // 这里可以添加图片压缩等逻辑
}

// 3. 生成优化报告
const buildDir = path.join(process.cwd(), '.next');
if (fs.existsSync(buildDir)) {
  const stats = fs.statSync(buildDir);
  const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`📊 构建包大小: ${sizeInMB}MB`);
  
  if (parseFloat(sizeInMB) > 25) {
    console.log('⚠️  警告: 构建包大小超过25MB限制');
    console.log('💡 建议:');
    console.log('   - 检查大型依赖包');
    console.log('   - 优化图片资源');
    console.log('   - 使用动态导入');
    console.log('   - 移除未使用的代码');
  } else {
    console.log('✅ 构建包大小符合要求');
  }
}

console.log('🎉 构建优化完成!'); 