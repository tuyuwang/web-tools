import { NextRequest } from 'next/server'
import { feedbackService } from '@/lib/feedback-service'
import { 
  withErrorHandling, 
  createSuccessResponse,
  handleOptions,
  createCorsResponse
} from '@/lib/api-utils'

// OPTIONS 处理
export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

// 健康检查
export const GET = withErrorHandling(async (request: NextRequest) => {
  const dbHealth = await feedbackService.healthCheck()
  
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    database: dbHealth,
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
  }

  const response = createSuccessResponse(healthData)
  return createCorsResponse(response, request.headers.get('origin') || undefined)
})