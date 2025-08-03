#!/usr/bin/env node

// 测试反馈API的脚本
const fs = require('fs');
const path = require('path');

// 加载 .env.local 文件
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=');
          process.env[key] = value;
        }
      }
    });
  }
}

// 加载环境变量
loadEnvFile();

async function testFeedbackAPI() {
  console.log('🔍 测试反馈API...\n');

  // 检查环境变量
  console.log('环境变量检查:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '已配置' : '未配置');
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '已配置' : '未配置');
  console.log('- FEEDBACK_STORAGE_METHOD:', process.env.FEEDBACK_STORAGE_METHOD || '未配置');
  console.log('');

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const testData = {
    type: 'test',
    title: 'API测试反馈',
    description: '这是一个API测试反馈，用于验证反馈系统是否正常工作。',
    email: 'test@example.com',
    tool: '测试工具',
    timestamp: new Date().toISOString(),
    user_agent: 'Node.js Test Script',
    page_url: 'https://example.com/test',
    status: 'new'
  };

  console.log('测试数据:', testData);
  console.log('目标URL:', `${baseUrl}/api/feedback`);

  try {
    const response = await fetch(`${baseUrl}/api/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log('响应状态:', response.status);
    console.log('响应头:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const result = await response.json();
      console.log('✅ API测试成功:', result);
    } else {
      const errorData = await response.json().catch(() => ({ error: '未知错误' }));
      console.error('❌ API测试失败:', errorData);
    }
  } catch (error) {
    console.error('❌ 网络请求失败:', error.message);
    console.log('请确保开发服务器正在运行: npm run dev');
  }
}

// 运行测试
if (require.main === module) {
  testFeedbackAPI().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error('测试失败:', error);
    process.exit(1);
  });
}

module.exports = { testFeedbackAPI }; 