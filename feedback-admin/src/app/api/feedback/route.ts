import { NextRequest } from 'next/server'
import { feedbackService } from '@/lib/feedback-service'
import { 
  withErrorHandling, 
  createSuccessResponse, 
  createErrorResponse,
  parsePaginationParams,
  parseSortParams,
  parseSearchParams,
  checkRateLimit,
  handleOptions,
  createCorsResponse
} from '@/lib/api-utils'
import { 
  validateCreateFeedback, 
  sanitizeFeedbackData,
  CreateFeedbackSchema,
  QueryParamsSchema
} from '@/lib/validation'

// OPTIONS 处理
export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

// 获取反馈列表
export const GET = withErrorHandling(async (request: NextRequest) => {
  // 限流检查
  if (!checkRateLimit(request, 100, 60000)) {
    return createErrorResponse('请求过于频繁，请稍后再试', 429, 'RATE_LIMIT_EXCEEDED')
  }

  const { searchParams } = new URL(request.url)
  
  // 解析查询参数
  const paginationParams = parsePaginationParams(request)
  const sortParams = parseSortParams(request, ['created_at', 'updated_at', 'title', 'type', 'status', 'priority'])
  const searchParamsData = parseSearchParams(request)

  // 组合查询参数
  const queryParams = QueryParamsSchema.parse({
    ...paginationParams,
    ...sortParams,
    ...searchParamsData,
    dateFrom: searchParams.get('dateFrom'),
    dateTo: searchParams.get('dateTo'),
  })

  const result = await feedbackService.getFeedbacks(queryParams)
  const response = createSuccessResponse(result)
  
  return createCorsResponse(response, request.headers.get('origin') || undefined)
})

// 创建新反馈
export const POST = withErrorHandling(async (request: NextRequest) => {
  // 限流检查（创建操作更严格）
  if (!checkRateLimit(request, 10, 60000)) {
    return createErrorResponse('请求过于频繁，请稍后再试', 429, 'RATE_LIMIT_EXCEEDED')
  }

  const rawData = await request.json()
  
  // 验证数据
  const validatedData = CreateFeedbackSchema.parse(rawData)
  const sanitizedData = sanitizeFeedbackData(validatedData)

  // 添加元数据
  const feedbackData = {
    ...sanitizedData,
    userAgent: request.headers.get('user-agent') || undefined,
    referrer: request.headers.get('referer') || undefined,
    metadata: {
      ...sanitizedData.metadata,
      ip: request.ip || request.headers.get('x-forwarded-for'),
      timestamp: new Date().toISOString(),
    }
  }

  const feedback = await feedbackService.createFeedback(feedbackData)
  const response = createSuccessResponse(feedback, 201)
  
  return createCorsResponse(response, request.headers.get('origin') || undefined)
})