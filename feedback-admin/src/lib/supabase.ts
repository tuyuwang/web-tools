import { createClient } from '@supabase/supabase-js'

// 环境变量验证
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl && typeof window !== 'undefined') {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}

if (!supabaseAnonKey && typeof window !== 'undefined') {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// 客户端Supabase实例
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null

// 服务端Supabase客户端（使用service role key）
export const supabaseAdmin = (() => {
  if (!supabaseServiceKey || !supabaseUrl) {
    if (typeof window === 'undefined') {
      console.warn('SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL not found. Admin operations will be limited.')
    }
    return null
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
})()

// 数据库表类型定义
export interface Database {
  public: {
    Tables: {
      feedbacks: {
        Row: {
          id: string
          type: 'bug' | 'feature' | 'improvement' | 'other'
          title: string
          description: string
          email?: string
          tool?: string
          timestamp: string
          status: 'new' | 'reviewed' | 'in-progress' | 'resolved'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: 'bug' | 'feature' | 'improvement' | 'other'
          title: string
          description: string
          email?: string
          tool?: string
          timestamp?: string
          status?: 'new' | 'reviewed' | 'in-progress' | 'resolved'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: 'bug' | 'feature' | 'improvement' | 'other'
          title?: string
          description?: string
          email?: string
          tool?: string
          timestamp?: string
          status?: 'new' | 'reviewed' | 'in-progress' | 'resolved'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          updated_at?: string
        }
      }
    }
  }
}

// 类型安全的客户端
export const typedSupabase = supabase ? supabase as any : null

// 帮助函数：检查Supabase连接
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    if (!supabase) return false
    const { data, error } = await supabase.from('feedbacks').select('count', { count: 'exact', head: true })
    return !error
  } catch (error) {
    console.error('Supabase connection check failed:', error)
    return false
  }
}

// 帮助函数：获取错误信息
export function getSupabaseErrorMessage(error: any): string {
  if (typeof error === 'string') return error
  if (error?.message) return error.message
  if (error?.error_description) return error.error_description
  return '发生未知错误'
} 