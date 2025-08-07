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
  UpdateFeedbackSchema,
  IdParamSchema
} from '@/lib/validation'

// OPTIONS 处理
export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

// 获取单个反馈
export const GET = withErrorHandling(async (
  request: NextRequest, 
  { params }: { params: { id: string } }
) => {
  // 限流检查
  if (!checkRateLimit(request, 200, 60000)) {
    return createErrorResponse('请求过于频繁，请稍后再试', 429, 'RATE_LIMIT_EXCEEDED')
  }

  // 验证ID参数
  const { id } = IdParamSchema.parse(params)

  const feedback = await feedbackService.getFeedbackById(id)
  const response = createSuccessResponse(feedback)
  
  return createCorsResponse(response, request.headers.get('origin') || undefined)
})

// 更新反馈
export const PATCH = withErrorHandling(async (
  request: NextRequest, 
  { params }: { params: { id: string } }
) => {
  // 限流检查
  if (!checkRateLimit(request, 50, 60000)) {
    return createErrorResponse('请求过于频繁，请稍后再试', 429, 'RATE_LIMIT_EXCEEDED')
  }

  // 验证ID参数
  const { id } = IdParamSchema.parse(params)

  const rawData = await request.json()
  
  // 验证更新数据
  const validatedData = UpdateFeedbackSchema.parse(rawData)

  // 检查是否有实际更新内容
  if (Object.keys(validatedData).length === 0) {
    throw new ApiError('没有提供要更新的数据', 400, 'NO_UPDATE_DATA')
  }

  const feedback = await feedbackService.updateFeedback(id, validatedData)
  const response = createSuccessResponse(feedback)
  
  return createCorsResponse(response, request.headers.get('origin') || undefined)
})

// 删除反馈
export const DELETE = withErrorHandling(async (
  request: NextRequest, 
  { params }: { params: { id: string } }
) => {
  // 限流检查
  if (!checkRateLimit(request, 20, 60000)) {
    return createErrorResponse('请求过于频繁，请稍后再试', 429, 'RATE_LIMIT_EXCEEDED')
  }

  // 验证ID参数
  const { id } = IdParamSchema.parse(params)

  await feedbackService.deleteFeedback(id)
  const response = createSuccessResponse({ message: '反馈已成功删除' })
  
  return createCorsResponse(response, request.headers.get('origin') || undefined)
})