import { supabase, supabaseAdmin, getSupabaseErrorMessage } from './supabase'
import { ApiError } from './api-utils'
import type { 
  CreateFeedbackData, 
  UpdateFeedbackData, 
  QueryParams, 
  FeedbackStatus,
  FeedbackType,
  FeedbackPriority 
} from './validation'

// 反馈数据接口
export interface Feedback {
  id: string
  type: FeedbackType
  title: string
  description: string
  email?: string
  tool?: string
  status: FeedbackStatus
  priority: FeedbackPriority
  timestamp: string
  created_at: string
  updated_at: string
  reply?: string
  tags?: string[]
  metadata?: Record<string, any>
}

// 分页响应接口
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// 统计数据接口
export interface FeedbackStats {
  total: number
  byStatus: Record<FeedbackStatus, number>
  byType: Record<FeedbackType, number>
  byPriority: Record<FeedbackPriority, number>
  recentTrend: Array<{ date: string; count: number }>
}

class FeedbackService {
  private getClient() {
    if (!supabaseAdmin) {
      throw new ApiError('Supabase admin client not configured', 500, 'SUPABASE_NOT_CONFIGURED')
    }
    return supabaseAdmin
  }

  // 创建反馈
  async createFeedback(data: CreateFeedbackData): Promise<Feedback> {
    try {
      const client = this.getClient()
      
      const feedbackData = {
        ...data,
        id: `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'new' as FeedbackStatus,
      }

      const { data: result, error } = await client
        .from('feedbacks')
        .insert(feedbackData)
        .select()
        .single()

      if (error) {
        console.error('Supabase create error:', error)
        throw new ApiError(
          `创建反馈失败: ${getSupabaseErrorMessage(error)}`,
          500,
          'CREATE_FAILED'
        )
      }

      return result as Feedback
    } catch (error) {
      if (error instanceof ApiError) throw error
      console.error('Create feedback error:', error)
      throw new ApiError('创建反馈时发生错误', 500, 'INTERNAL_ERROR')
    }
  }

  // 获取反馈列表（分页）
  async getFeedbacks(params: QueryParams): Promise<PaginatedResponse<Feedback>> {
    try {
      const client = this.getClient()
      let query = client.from('feedbacks').select('*', { count: 'exact' })

      // 应用搜索过滤
      if (params.search) {
        query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`)
      }

      if (params.type) {
        query = query.eq('type', params.type)
      }

      if (params.status) {
        query = query.eq('status', params.status)
      }

      if (params.priority) {
        query = query.eq('priority', params.priority)
      }

      if (params.dateFrom) {
        query = query.gte('created_at', params.dateFrom)
      }

      if (params.dateTo) {
        query = query.lte('created_at', params.dateTo)
      }

      // 应用排序
      query = query.order(params.sortBy, { ascending: params.sortOrder === 'asc' })

      // 应用分页
      const offset = (params.page - 1) * params.limit
      query = query.range(offset, offset + params.limit - 1)

      const { data, error, count } = await query

      if (error) {
        console.error('Supabase fetch error:', error)
        throw new ApiError(
          `获取反馈列表失败: ${getSupabaseErrorMessage(error)}`,
          500,
          'FETCH_FAILED'
        )
      }

      const total = count || 0
      const totalPages = Math.ceil(total / params.limit)

      return {
        data: data as Feedback[],
        pagination: {
          page: params.page,
          limit: params.limit,
          total,
          totalPages,
          hasNext: params.page < totalPages,
          hasPrev: params.page > 1,
        }
      }
    } catch (error) {
      if (error instanceof ApiError) throw error
      console.error('Get feedbacks error:', error)
      throw new ApiError('获取反馈列表时发生错误', 500, 'INTERNAL_ERROR')
    }
  }

  // 获取单个反馈
  async getFeedbackById(id: string): Promise<Feedback> {
    try {
      const client = this.getClient()

      const { data, error } = await client
        .from('feedbacks')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new ApiError('反馈不存在', 404, 'FEEDBACK_NOT_FOUND')
        }
        console.error('Supabase fetch error:', error)
        throw new ApiError(
          `获取反馈失败: ${getSupabaseErrorMessage(error)}`,
          500,
          'FETCH_FAILED'
        )
      }

      return data as Feedback
    } catch (error) {
      if (error instanceof ApiError) throw error
      console.error('Get feedback by ID error:', error)
      throw new ApiError('获取反馈时发生错误', 500, 'INTERNAL_ERROR')
    }
  }

  // 更新反馈
  async updateFeedback(id: string, data: UpdateFeedbackData): Promise<Feedback> {
    try {
      const client = this.getClient()

      const updateData = {
        ...data,
        updated_at: new Date().toISOString(),
      }

      const { data: result, error } = await client
        .from('feedbacks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new ApiError('反馈不存在', 404, 'FEEDBACK_NOT_FOUND')
        }
        console.error('Supabase update error:', error)
        throw new ApiError(
          `更新反馈失败: ${getSupabaseErrorMessage(error)}`,
          500,
          'UPDATE_FAILED'
        )
      }

      return result as Feedback
    } catch (error) {
      if (error instanceof ApiError) throw error
      console.error('Update feedback error:', error)
      throw new ApiError('更新反馈时发生错误', 500, 'INTERNAL_ERROR')
    }
  }

  // 删除反馈
  async deleteFeedback(id: string): Promise<void> {
    try {
      const client = this.getClient()

      const { error } = await client
        .from('feedbacks')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Supabase delete error:', error)
        throw new ApiError(
          `删除反馈失败: ${getSupabaseErrorMessage(error)}`,
          500,
          'DELETE_FAILED'
        )
      }
    } catch (error) {
      if (error instanceof ApiError) throw error
      console.error('Delete feedback error:', error)
      throw new ApiError('删除反馈时发生错误', 500, 'INTERNAL_ERROR')
    }
  }

  // 批量删除反馈
  async batchDeleteFeedbacks(ids: string[]): Promise<void> {
    try {
      const client = this.getClient()

      const { error } = await client
        .from('feedbacks')
        .delete()
        .in('id', ids)

      if (error) {
        console.error('Supabase batch delete error:', error)
        throw new ApiError(
          `批量删除反馈失败: ${getSupabaseErrorMessage(error)}`,
          500,
          'BATCH_DELETE_FAILED'
        )
      }
    } catch (error) {
      if (error instanceof ApiError) throw error
      console.error('Batch delete feedbacks error:', error)
      throw new ApiError('批量删除反馈时发生错误', 500, 'INTERNAL_ERROR')
    }
  }

  // 批量更新状态
  async batchUpdateStatus(ids: string[], status: FeedbackStatus): Promise<void> {
    try {
      const client = this.getClient()

      const { error } = await client
        .from('feedbacks')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .in('id', ids)

      if (error) {
        console.error('Supabase batch update error:', error)
        throw new ApiError(
          `批量更新状态失败: ${getSupabaseErrorMessage(error)}`,
          500,
          'BATCH_UPDATE_FAILED'
        )
      }
    } catch (error) {
      if (error instanceof ApiError) throw error
      console.error('Batch update status error:', error)
      throw new ApiError('批量更新状态时发生错误', 500, 'INTERNAL_ERROR')
    }
  }

  // 获取统计数据
  async getStats(): Promise<FeedbackStats> {
    try {
      const client = this.getClient()

      // 获取总数
      const { count: total } = await client
        .from('feedbacks')
        .select('*', { count: 'exact', head: true })

      // 按状态统计
      const { data: statusData } = await client
        .from('feedbacks')
        .select('status')

      // 按类型统计
      const { data: typeData } = await client
        .from('feedbacks')
        .select('type')

      // 按优先级统计
      const { data: priorityData } = await client
        .from('feedbacks')
        .select('priority')

      // 最近趋势（最近30天）
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: trendData } = await client
        .from('feedbacks')
        .select('created_at')
        .gte('created_at', thirtyDaysAgo.toISOString())

      // 处理统计数据
      const byStatus = statusData?.reduce((acc, item) => {
        const status = item.status as FeedbackStatus
        acc[status] = (acc[status] || 0) + 1
        return acc
      }, {
        'new': 0,
        'reviewed': 0,
        'in-progress': 0,
        'resolved': 0
      } as Record<FeedbackStatus, number>) || {
        'new': 0,
        'reviewed': 0,
        'in-progress': 0,
        'resolved': 0
      }

      const byType = typeData?.reduce((acc, item) => {
        const type = item.type as FeedbackType
        acc[type] = (acc[type] || 0) + 1
        return acc
      }, {
        'bug': 0,
        'feature': 0,
        'improvement': 0,
        'other': 0
      } as Record<FeedbackType, number>) || {
        'bug': 0,
        'feature': 0,
        'improvement': 0,
        'other': 0
      }

      const byPriority = priorityData?.reduce((acc, item) => {
        const priority = item.priority as FeedbackPriority
        acc[priority] = (acc[priority] || 0) + 1
        return acc
      }, {
        'low': 0,
        'medium': 0,
        'high': 0,
        'urgent': 0
      } as Record<FeedbackPriority, number>) || {
        'low': 0,
        'medium': 0,
        'high': 0,
        'urgent': 0
      }

      // 生成趋势数据
      const recentTrend = this.generateTrendData(trendData || [])

      return {
        total: total || 0,
        byStatus,
        byType,
        byPriority,
        recentTrend,
      }
    } catch (error) {
      console.error('Get stats error:', error)
      throw new ApiError('获取统计数据时发生错误', 500, 'STATS_ERROR')
    }
  }

  // 生成趋势数据
  private generateTrendData(data: Array<{ created_at: string }>): Array<{ date: string; count: number }> {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      return date.toISOString().split('T')[0]
    })

    const countsByDate = data.reduce((acc, item) => {
      const date = item.created_at.split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return last30Days.map(date => ({
      date,
      count: countsByDate[date] || 0
    }))
  }

  // 健康检查
  async healthCheck(): Promise<{ status: 'ok' | 'error'; message: string }> {
    try {
      const client = this.getClient()
      const { error } = await client.from('feedbacks').select('count', { count: 'exact', head: true })
      
      if (error) {
        return { status: 'error', message: getSupabaseErrorMessage(error) }
      }
      
      return { status: 'ok', message: 'Database connection is healthy' }
    } catch (error) {
      return { status: 'error', message: '数据库连接失败' }
    }
  }
}

export const feedbackService = new FeedbackService()