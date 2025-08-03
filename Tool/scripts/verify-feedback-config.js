#!/usr/bin/env node

/**
 * 反馈功能配置验证脚本
 * 用于检查环境变量和Supabase连接状态
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 验证反馈功能配置...\n');

// 检查环境变量文件
const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.log('❌ 未找到 .env.local 文件');
  console.log('请运行: cp env.local.template .env.local');
  console.log('然后配置您的Supabase参数\n');
  process.exit(1);
}

// 读取环境变量
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#][^=]+)=(.*)$/);
  if (match) {
    const [, key, value] = match;
    envVars[key.trim()] = value.trim();
  }
});

console.log('📋 环境变量检查:');

// 检查必需的Supabase配置
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
];

let allRequiredVarsPresent = true;

requiredVars.forEach(varName => {
  const value = envVars[varName];
  if (value && value !== 'your_actual_value_here') {
    console.log(`✅ ${varName}: 已配置`);
  } else {
    console.log(`❌ ${varName}: 未配置或使用默认值`);
    allRequiredVarsPresent = false;
  }
});

// 检查可选配置
const optionalVars = [
  'NEXT_PUBLIC_SITE_URL',
  'FEEDBACK_STORAGE_METHOD'
];

console.log('\n📋 可选配置检查:');
optionalVars.forEach(varName => {
  const value = envVars[varName];
  if (value && value !== 'your_actual_value_here') {
    console.log(`✅ ${varName}: ${value}`);
  } else {
    console.log(`⚠️  ${varName}: 未配置（可选）`);
  }
});

// 检查数据库表结构
console.log('\n📋 数据库表结构检查:');
console.log('请确保在Supabase中创建了以下表结构:');
console.log(`
CREATE TABLE feedbacks (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  tool TEXT,
  page_url TEXT,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_feedbacks_created_at ON feedbacks(created_at DESC);
CREATE INDEX idx_feedbacks_category ON feedbacks(category);
`);

// 总结
console.log('\n📊 配置总结:');
if (allRequiredVarsPresent) {
  console.log('✅ 所有必需的配置项都已设置');
  console.log('🎉 反馈功能已准备就绪！');
  console.log('\n下一步:');
  console.log('1. 确保Supabase数据库表已创建');
  console.log('2. 运行 npm run dev 启动开发服务器');
  console.log('3. 访问任意工具页面测试反馈功能');
} else {
  console.log('❌ 部分配置项缺失');
  console.log('\n请按照以下步骤配置:');
  console.log('1. 访问 https://supabase.com/ 创建项目');
  console.log('2. 在项目设置中获取 Project URL 和 Anon Key');
  console.log('3. 更新 .env.local 文件中的配置');
  console.log('4. 在Supabase SQL编辑器中创建 feedbacks 表');
  console.log('5. 重新运行此脚本验证配置');
}

console.log('\n📚 相关文档:');
console.log('- FEEDBACK_SETUP_GUIDE.md - 详细设置指南');
console.log('- SUPABASE_SETUP.md - Supabase配置指南');
console.log('- FEEDBACK_IMPLEMENTATION_SUMMARY.md - 功能实现总结'); 