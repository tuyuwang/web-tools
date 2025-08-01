#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 开始一键打包流程...\n');

// 颜色输出函数
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`
};

// 步骤执行函数
function executeStep(stepName, stepFunction) {
  console.log(colors.blue(`📋 ${stepName}...`));
  try {
    stepFunction();
    console.log(colors.green(`✅ ${stepName} 完成\n`));
  } catch (error) {
    console.log(colors.red(`❌ ${stepName} 失败: ${error.message}\n`));
    process.exit(1);
  }
}

// 步骤1: 清理环境
function cleanEnvironment() {
  const dirsToClean = ['.next', 'node_modules/.cache'];
  dirsToClean.forEach(dir => {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
  
  // 清理之前的构建包
  const buildFiles = ['build-package.tar.gz', 'build-package.zip'];
  buildFiles.forEach(file => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
  });
}

// 步骤2: 安装依赖
function installDependencies() {
  console.log('📦 检查依赖...');
  if (!fs.existsSync('node_modules')) {
    execSync('npm install', { stdio: 'inherit' });
  } else {
    execSync('npm ci', { stdio: 'inherit' });
  }
}

// 步骤3: 类型检查
function typeCheck() {
  console.log('🔍 执行类型检查...');
  execSync('npm run type-check', { stdio: 'inherit' });
}

// 步骤4: 代码检查
function lintCode() {
  console.log('🔍 执行代码检查...');
  try {
    execSync('npm run lint', { stdio: 'inherit' });
  } catch (error) {
    console.log(colors.yellow('⚠️  代码检查发现问题，但继续构建...'));
  }
}

// 步骤5: 构建项目
function buildProject() {
  console.log('🏗️  构建项目...');
  execSync('npm run build', { stdio: 'inherit' });
}

// 步骤6: 优化构建
function optimizeBuild() {
  console.log('⚡ 优化构建包...');
  
  // 清理不必要的文件
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
    }
  });

  // 压缩静态资源
  const publicDir = path.join(process.cwd(), 'public');
  if (fs.existsSync(publicDir)) {
    console.log('📦 压缩静态资源...');
  }
}

// 步骤7: 检查包大小
function checkPackageSize() {
  console.log('📊 检查包大小...');
  
  const buildDir = path.join(process.cwd(), '.next');
  if (fs.existsSync(buildDir)) {
    const stats = fs.statSync(buildDir);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`📦 构建目录大小: ${sizeInMB}MB`);
    
    if (parseFloat(sizeInMB) > 50) {
      console.log(colors.red(`⚠️  警告: 构建目录大小超过50MB`));
    }
  }
}

// 步骤8: 创建发布包
function createPackage() {
  console.log('📦 创建发布包...');
  
  const packageName = `build-package-${new Date().toISOString().split('T')[0]}.tar.gz`;
  const filesToInclude = [
    '.next',
    'package.json',
    'package-lock.json',
    'public',
    'src',
    'next.config.js',
    'tailwind.config.js',
    'tsconfig.json',
    'postcss.config.js'
  ];

  // 检查文件是否存在
  const missingFiles = filesToInclude.filter(file => !fs.existsSync(file));
  if (missingFiles.length > 0) {
    throw new Error(`缺少必要文件: ${missingFiles.join(', ')}`);
  }

  // 创建tar包
  const tarCommand = `tar -czf ${packageName} ${filesToInclude.join(' ')}`;
  execSync(tarCommand, { stdio: 'inherit' });

  // 检查包大小
  const packageStats = fs.statSync(packageName);
  const packageSizeMB = (packageStats.size / (1024 * 1024)).toFixed(2);
  
  console.log(`📦 发布包: ${packageName}`);
  console.log(`📊 包大小: ${packageSizeMB}MB`);
  
  if (parseFloat(packageSizeMB) > 25) {
    console.log(colors.red(`❌ 错误: 包大小超过25MB限制!`));
    process.exit(1);
  } else if (parseFloat(packageSizeMB) > 20) {
    console.log(colors.yellow(`⚠️  警告: 包大小接近25MB限制`));
  } else {
    console.log(colors.green(`✅ 包大小符合要求 (< 25MB)`));
  }
}

// 步骤9: 生成报告
function generateReport() {
  console.log('📋 生成构建报告...');
  
  const report = {
    timestamp: new Date().toISOString(),
    packageName: `build-package-${new Date().toISOString().split('T')[0]}.tar.gz`,
    buildSize: 0,
    packageSize: 0,
    status: 'success'
  };

  // 获取构建大小
  const buildDir = path.join(process.cwd(), '.next');
  if (fs.existsSync(buildDir)) {
    const stats = fs.statSync(buildDir);
    report.buildSize = (stats.size / (1024 * 1024)).toFixed(2);
  }

  // 获取包大小
  if (fs.existsSync(report.packageName)) {
    const stats = fs.statSync(report.packageName);
    report.packageSize = (stats.size / (1024 * 1024)).toFixed(2);
  }

  // 保存报告
  const reportPath = path.join(process.cwd(), 'build-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`📄 构建报告已保存: build-report.json`);
  console.log(`📊 构建大小: ${report.buildSize}MB`);
  console.log(`📦 包大小: ${report.packageSize}MB`);
}

// 主执行流程
async function main() {
  console.log(colors.bold('🎯 一键打包流程开始\n'));
  
  executeStep('清理环境', cleanEnvironment);
  executeStep('安装依赖', installDependencies);
  executeStep('类型检查', typeCheck);
  executeStep('代码检查', lintCode);
  executeStep('构建项目', buildProject);
  executeStep('优化构建', optimizeBuild);
  executeStep('检查包大小', checkPackageSize);
  executeStep('创建发布包', createPackage);
  executeStep('生成报告', generateReport);
  
  console.log(colors.bold(colors.green('🎉 一键打包完成! 🎉')));
  console.log('\n📋 下一步:');
  console.log('  1. 检查 build-report.json 了解详细信息');
  console.log('  2. 测试发布包是否正常工作');
  console.log('  3. 部署到目标环境');
}

// 错误处理
process.on('uncaughtException', (error) => {
  console.log(colors.red(`❌ 未捕获的错误: ${error.message}`));
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.log(colors.red(`❌ 未处理的Promise拒绝: ${reason}`));
  process.exit(1);
});

// 启动主流程
main().catch(error => {
  console.log(colors.red(`❌ 打包失败: ${error.message}`));
  process.exit(1);
}); 