#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 开始静态构建...');

// 临时目录
const tempDir = path.join(process.cwd(), '.temp-api');
const apiDir = path.join(process.cwd(), 'src/app/api');

// 备份API目录
function backupApiDir() {
  if (fs.existsSync(apiDir)) {
    console.log('📁 备份API目录...');
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    fs.cpSync(apiDir, tempDir, { recursive: true });
    fs.rmSync(apiDir, { recursive: true, force: true });
    console.log('✅ API目录已备份');
  }
}

// 恢复API目录
function restoreApiDir() {
  if (fs.existsSync(tempDir)) {
    console.log('📁 恢复API目录...');
    fs.cpSync(tempDir, apiDir, { recursive: true });
    fs.rmSync(tempDir, { recursive: true, force: true });
    console.log('✅ API目录已恢复');
  }
}

// 执行构建
function buildProject() {
  try {
    console.log('🚀 执行Next.js构建...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ 构建完成');
  } catch (error) {
    console.error('❌ 构建失败:', error.message);
    throw error;
  }
}

// 主函数
async function main() {
  try {
    // 1. 备份API目录
    backupApiDir();
    
    // 2. 执行构建
    buildProject();
    
    // 3. 恢复API目录
    restoreApiDir();
    
    console.log('🎉 静态构建完成！');
  } catch (error) {
    console.error('❌ 构建失败，正在恢复...');
    restoreApiDir();
    process.exit(1);
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = { main }; 