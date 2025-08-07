import { NextRequest } from 'next/server'
import { feedbackService } from '@/lib/feedback-service'
import { 
  withErrorHandling, 
  createSuccessResponse, 
  createErrorResponse,
  checkRateLimit,
  handleOptions,
  createCorsResponse
} from '@/lib/api-utils'

// OPTIONS 处理
export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

// 获取反馈统计数据
export const GET = withErrorHandling(async (request: NextRequest) => {
  // 限流检查
  if (!checkRateLimit(request, 50, 60000)) {
    return createErrorResponse('请求过于频繁，请稍后再试', 429, 'RATE_LIMIT_EXCEEDED')
  }

  const stats = await feedbackService.getStats()
  const response = createSuccessResponse(stats)
  
  return createCorsResponse(response, request.headers.get('origin') || undefined)
})