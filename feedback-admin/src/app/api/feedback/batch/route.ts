import { NextRequest } from 'next/server'
import { feedbackService } from '@/lib/feedback-service'
import { 
  withErrorHandling, 
  createSuccessResponse, 
  createErrorResponse,
  checkRateLimit,
  handleOptions,
  createCorsResponse,
  ApiError
} from '@/lib/api-utils'
import { 
  BatchActionSchema,
  FeedbackStatusSchema
} from '@/lib/validation'

// OPTIONS 处理
export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

// 批量操作
export const POST = withErrorHandling(async (request: NextRequest) => {
  // 限流检查（批量操作更严格）
  if (!checkRateLimit(request, 5, 60000)) {
    return createErrorResponse('请求过于频繁，请稍后再试', 429, 'RATE_LIMIT_EXCEEDED')
  }

  const rawData = await request.json()
  
  // 验证批量操作数据
  const { ids, action, data } = BatchActionSchema.parse(rawData)

  let result: any

  switch (action) {
    case 'delete':
      await feedbackService.batchDeleteFeedbacks(ids)
      result = { message: `成功删除 ${ids.length} 个反馈` }
      break

    case 'update_status':
      if (!data?.status) {
        throw new ApiError('缺少状态参数', 400, 'MISSING_STATUS')
      }
      
      const status = FeedbackStatusSchema.parse(data.status)
      await feedbackService.batchUpdateStatus(ids, status)
      result = { message: `成功更新 ${ids.length} 个反馈的状态为 ${status}` }
      break

    case 'add_tags':
      // TODO: 实现批量添加标签功能
      throw new ApiError('批量添加标签功能暂未实现', 501, 'NOT_IMPLEMENTED')

    default:
      throw new ApiError('不支持的批量操作', 400, 'UNSUPPORTED_ACTION')
  }

  const response = createSuccessResponse(result)
  return createCorsResponse(response, request.headers.get('origin') || undefined)
})