import { NextRequest, NextResponse } from 'next/server';

// 更新反馈状态
async function updateFeedbackInSupabase(id: string, data: any) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase配置缺失');
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/feedbacks?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseKey}`,
      'apikey': supabaseKey,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error('更新反馈失败');
  }

  return response;
}

// 删除反馈
async function deleteFeedbackFromSupabase(id: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase配置缺失');
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/feedbacks?id=eq.${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${supabaseKey}`,
      'apikey': supabaseKey,
      'Prefer': 'return=minimal'
    }
  });

  if (!response.ok) {
    throw new Error('删除反馈失败');
  }

  return response;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const { id } = params;

    const storageMethod = process.env.FEEDBACK_STORAGE_METHOD || 'supabase';
    
    let result;
    switch (storageMethod) {
      case 'supabase':
        result = await updateFeedbackInSupabase(id, data);
        break;
      default:
        throw new Error('未配置存储方式');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('更新反馈失败:', error);
    return NextResponse.json(
      { error: '更新反馈失败' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const storageMethod = process.env.FEEDBACK_STORAGE_METHOD || 'supabase';
    
    let result;
    switch (storageMethod) {
      case 'supabase':
        result = await deleteFeedbackFromSupabase(id);
        break;
      default:
        throw new Error('未配置存储方式');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除反馈失败:', error);
    return NextResponse.json(
      { error: '删除反馈失败' },
      { status: 500 }
    );
  }
} 