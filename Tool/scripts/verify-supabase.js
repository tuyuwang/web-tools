#!/usr/bin/env node

// 使用全局fetch（Node.js 18+）或node-fetch
let fetch;
if (typeof globalThis.fetch === 'function') {
  fetch = globalThis.fetch;
} else {
  fetch = require('node-fetch');
}
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

async function verifySupabaseConfig() {
  console.log('🔍 验证Supabase配置...\n');

  // 检查环境变量
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    console.error('❌ 缺少 NEXT_PUBLIC_SUPABASE_URL 环境变量');
    console.log('请从 Supabase 项目设置中获取 Project URL');
    return false;
  }

  if (!supabaseKey) {
    console.error('❌ 缺少 NEXT_PUBLIC_SUPABASE_ANON_KEY 环境变量');
    console.log('请从 Supabase 项目设置中获取 service_role 密钥');
    return false;
  }

  console.log('✅ 环境变量配置正确');

  // 测试API连接
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/feedbacks?select=count`, {
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      console.log('✅ Supabase API 连接成功');
      console.log('✅ 数据库表 feedbacks 存在');
    } else {
      console.error('❌ 数据库表 feedbacks 不存在或权限不足');
      console.log('请执行以下SQL创建表：');
      console.log(`
CREATE TABLE feedbacks (
  id BIGSERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  email TEXT,
  tool TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_agent TEXT,
  page_url TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
      `);
      return false;
    }
  } catch (error) {
    console.error('❌ Supabase API 连接失败:', error.message);
    return false;
  }

  // 测试插入权限
  try {
    const testData = {
      type: 'test',
      title: '配置测试',
      description: '这是一个配置测试反馈',
      email: 'test@example.com',
      tool: '测试工具',
      timestamp: new Date().toISOString(),
      user_agent: 'Node.js Test',
      page_url: 'https://example.com/test',
      status: 'new'
    };

    const insertResponse = await fetch(`${supabaseUrl}/rest/v1/feedbacks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(testData)
    });

    if (insertResponse.ok) {
      console.log('✅ 数据插入权限正常');
      
      // 清理测试数据
      const testId = Date.now().toString();
      await fetch(`${supabaseUrl}/rest/v1/feedbacks?id=eq.${testId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey
        }
      });
    } else {
      console.error('❌ 数据插入权限不足');
      return false;
    }
  } catch (error) {
    console.error('❌ 数据插入测试失败:', error.message);
    return false;
  }

  console.log('\n🎉 Supabase配置验证成功！');
  console.log('您的反馈系统已准备就绪。');
  return true;
}

// 运行验证
if (require.main === module) {
  verifySupabaseConfig().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { verifySupabaseConfig }; 