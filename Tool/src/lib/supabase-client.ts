import { createClient } from '@supabase/supabase-js';

let supabase: any = null;

// 只在客户端创建Supabase客户端
if (typeof window !== 'undefined') {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
}

export { supabase };

export interface FeedbackData {
  title: string;
  description: string;
  type: string;
  email?: string;
  tool?: string;
  page_url?: string;
  user_agent?: string;
  timestamp?: string;
} 