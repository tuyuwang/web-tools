import { z } from 'zod'

// 反馈类型枚举
export const FeedbackTypeSchema = z.enum(['bug', 'feature', 'improvement', 'other'])
export const FeedbackStatusSchema = z.enum(['new', 'reviewed', 'in-progress', 'resolved'])
export const FeedbackPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent'])

// 创建反馈的验证模式
export const CreateFeedbackSchema = z.object({
  type: FeedbackTypeSchema,
  title: z.string()
    .min(1, '标题不能为空')
    .max(200, '标题不能超过200个字符'),
  description: z.string()
    .min(1, '描述不能为空')
    .max(5000, '描述不能超过5000个字符'),
  email: z.string()
    .email('邮箱格式不正确')
    .optional(),
  tool: z.string()
    .max(100, '工具名称不能超过100个字符')
    .optional(),
  priority: FeedbackPrioritySchema.default('medium'),
  userAgent: z.string().optional(),
  referrer: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
})

// 更新反馈的验证模式
export const UpdateFeedbackSchema = z.object({
  type: FeedbackTypeSchema.optional(),
  title: z.string()
    .min(1, '标题不能为空')
    .max(200, '标题不能超过200个字符')
    .optional(),
  description: z.string()
    .min(1, '描述不能为空')
    .max(5000, '描述不能超过5000个字符')
    .optional(),
  status: FeedbackStatusSchema.optional(),
  priority: FeedbackPrioritySchema.optional(),
  email: z.string()
    .email('邮箱格式不正确')
    .optional(),
  tool: z.string()
    .max(100, '工具名称不能超过100个字符')
    .optional(),
  reply: z.string()
    .max(2000, '回复不能超过2000个字符')
    .optional(),
  tags: z.array(z.string()).optional(),
})

// 批量操作验证模式
export const BatchActionSchema = z.object({
  ids: z.array(z.string()).min(1, '至少选择一个反馈'),
  action: z.enum(['delete', 'update_status', 'add_tags']),
  data: z.record(z.string(), z.any()).optional(),
})

// ID参数验证模式
export const IdParamSchema = z.object({
  id: z.string().min(1, 'ID不能为空'),
})

// 查询参数验证模式
export const QueryParamsSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
  type: FeedbackTypeSchema.optional(),
  status: FeedbackStatusSchema.optional(),
  priority: FeedbackPrioritySchema.optional(),
  sortBy: z.enum(['created_at', 'updated_at', 'title', 'type', 'status', 'priority']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
})

// 统计查询参数验证模式
export const StatsQuerySchema = z.object({
  period: z.enum(['day', 'week', 'month', 'year']).default('month'),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
})

// 导出类型
export type CreateFeedbackData = z.infer<typeof CreateFeedbackSchema>
export type UpdateFeedbackData = z.infer<typeof UpdateFeedbackSchema>
export type BatchActionData = z.infer<typeof BatchActionSchema>
export type QueryParams = z.infer<typeof QueryParamsSchema>
export type StatsQueryParams = z.infer<typeof StatsQuerySchema>
export type FeedbackType = z.infer<typeof FeedbackTypeSchema>
export type FeedbackStatus = z.infer<typeof FeedbackStatusSchema>
export type FeedbackPriority = z.infer<typeof FeedbackPrioritySchema>

// 验证帮助函数
export function validateCreateFeedback(data: unknown): CreateFeedbackData {
  return CreateFeedbackSchema.parse(data)
}

export function validateUpdateFeedback(data: unknown): UpdateFeedbackData {
  return UpdateFeedbackSchema.parse(data)
}

export function validateBatchAction(data: unknown): BatchActionData {
  return BatchActionSchema.parse(data)
}

export function validateQueryParams(data: unknown): QueryParams {
  return QueryParamsSchema.parse(data)
}

export function validateStatsQuery(data: unknown): StatsQueryParams {
  return StatsQuerySchema.parse(data)
}

// 数据清理函数
export function sanitizeFeedbackData(data: CreateFeedbackData): CreateFeedbackData {
  return {
    ...data,
    title: data.title.trim(),
    description: data.description.trim(),
    email: data.email?.trim().toLowerCase(),
    tool: data.tool?.trim(),
  }
}

// 数据完整性检查
export function validateFeedbackIntegrity(data: any): boolean {
  if (!data.id || !data.created_at) {
    return false
  }
  
  if (!data.title || !data.description || !data.type) {
    return false
  }
  
  return true
}