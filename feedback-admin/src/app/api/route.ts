import { NextRequest, NextResponse } from 'next/server';

// 方案1：使用Supabase
async function saveToSupabase(data: any) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('Supabase配置:', { 
    url: supabaseUrl ? '已配置' : '未配置',
    key: supabaseKey ? '已配置' : '未配置'
  });
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase配置缺失: NEXT_PUBLIC_SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY');
  }

  try {
    console.log('向Supabase发送请求:', `${supabaseUrl}/rest/v1/feedbacks`);
    
    const response = await fetch(`${supabaseUrl}/rest/v1/feedbacks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(data)
    });

    console.log('Supabase响应状态:', response.status);
    console.log('Supabase响应头:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Supabase错误响应:', errorText);
      throw new Error(`Supabase保存失败: ${response.status} - ${errorText}`);
    }

    console.log('Supabase保存成功');
    return response;
  } catch (error) {
    console.error('Supabase请求失败:', error);
    throw error;
  }
}

// 方案2：使用PlanetScale（MySQL）
async function saveToPlanetScale(data: any) {
  const response = await fetch('/api/feedback/planetscale', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error('PlanetScale保存失败');
  }

  return response;
}

// 方案3：使用Vercel KV（Redis）- 已禁用
async function saveToVercelKV(data: any) {
  throw new Error('Vercel KV 未配置，请使用 Supabase');
}

// 方案4：使用Google Sheets API
async function saveToGoogleSheets(data: any) {
  const response = await fetch('/api/feedback/sheets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error('Google Sheets保存失败');
  }

  return response;
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    console.log('收到反馈数据:', data);
    
    // 验证必需字段
    if (!data.title || !data.description || !data.type) {
      console.error('缺少必需字段:', { title: !!data.title, description: !!data.description, type: !!data.type });
      return NextResponse.json(
        { error: '缺少必需字段：标题、描述或类型' },
        { status: 400 }
      );
    }
    
    // 添加ID和时间戳
    const feedbackData = {
      id: Date.now().toString(),
      ...data,
      created_at: new Date().toISOString()
    };

    console.log('处理后的反馈数据:', feedbackData);

    // 根据环境变量选择存储方式
    const storageMethod = process.env.FEEDBACK_STORAGE_METHOD || 'supabase';
    console.log('使用存储方式:', storageMethod);
    
    let result;
    try {
      switch (storageMethod) {
        case 'supabase':
          result = await saveToSupabase(feedbackData);
          break;
        case 'planetscale':
          result = await saveToPlanetScale(feedbackData);
          break;
        case 'vercel-kv':
          result = await saveToVercelKV(feedbackData);
          break;
        case 'google-sheets':
          result = await saveToGoogleSheets(feedbackData);
          break;
        default:
          throw new Error('未配置存储方式');
      }
      
      console.log('存储成功:', result);
      return NextResponse.json({ success: true, id: feedbackData.id });
    } catch (storageError: any) {
      console.error('存储失败:', storageError);
      return NextResponse.json(
        { error: `存储失败: ${storageError.message}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('处理反馈请求失败:', error);
    return NextResponse.json(
      { error: '处理请求失败，请检查数据格式' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const storageMethod = process.env.FEEDBACK_STORAGE_METHOD || 'supabase';
    
    let feedbacks;
    switch (storageMethod) {
      case 'supabase':
        feedbacks = await getFromSupabase();
        break;
      case 'planetscale':
        feedbacks = await getFromPlanetScale();
        break;
      case 'vercel-kv':
        feedbacks = await getFromVercelKV();
        break;
      case 'google-sheets':
        feedbacks = await getFromGoogleSheets();
        break;
      default:
        throw new Error('未配置存储方式');
    }

    return NextResponse.json(feedbacks);
  } catch (error) {
    console.error('获取反馈失败:', error);
    return NextResponse.json(
      { error: '获取反馈失败' },
      { status: 500 }
    );
  }
}

// 获取反馈数据的函数
async function getFromSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase配置缺失');
  }
  
  const response = await fetch(`${supabaseUrl}/rest/v1/feedbacks?select=*&order=created_at.desc`, {
    headers: {
      'Authorization': `Bearer ${supabaseKey}`,
      'apikey': supabaseKey,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('获取反馈失败');
  }

  return response.json();
}

async function getFromPlanetScale() {
  // 实现从PlanetScale获取数据
  return [];
}

async function getFromVercelKV() {
  throw new Error('Vercel KV 未配置，请使用 Supabase');
}

async function getFromGoogleSheets() {
  // 实现从Google Sheets获取数据
  return [];
} 