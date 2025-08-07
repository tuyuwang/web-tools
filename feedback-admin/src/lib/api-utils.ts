import { NextRequest, NextResponse } from 'next/server'
import { ZodSchema, ZodError } from 'zod'

// API错误类型
export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  code?: string
}

// 创建成功响应
export function createSuccessResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({
    success: true,
    data
  } as ApiResponse<T>, { status })
}

// 创建错误响应
export function createErrorResponse(
  error: string | Error | ApiError,
  status = 500,
  code?: string
): NextResponse {
  let message: string
  let statusCode: number
  let errorCode: string | undefined

  if (error instanceof ApiError) {
    message = error.message
    statusCode = error.statusCode
    errorCode = error.code
  } else if (error instanceof Error) {
    message = error.message
    statusCode = status
    errorCode = code
  } else {
    message = error
    statusCode = status
    errorCode = code
  }

  console.error('API Error:', { message, statusCode, errorCode })

  return NextResponse.json({
    success: false,
    error: message,
    code: errorCode
  } as ApiResponse, { status: statusCode })
}

// 请求验证中间件
export async function validateRequest<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<T> {
  try {
    const body = await request.json()
    return schema.parse(body)
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ApiError(
        `数据验证失败: ${error.issues.map(e => e.message).join(', ')}`,
        400,
        'VALIDATION_ERROR'
      )
    }
    throw new ApiError('无效的请求数据', 400, 'INVALID_REQUEST')
  }
}

// 错误处理包装器
export function withErrorHandling(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    try {
      return await handler(request, context)
    } catch (error) {
      if (error instanceof ApiError) {
        return createErrorResponse(error)
      }
      
      console.error('Unhandled API error:', error)
      return createErrorResponse('内部服务器错误', 500, 'INTERNAL_ERROR')
    }
  }
}

// CORS处理
export function createCorsResponse(response: NextResponse, origin?: string): NextResponse {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001']
  
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  } else if (process.env.NODE_ENV === 'development') {
    response.headers.set('Access-Control-Allow-Origin', '*')
  }
  
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Max-Age', '86400')
  
  return response
}

// OPTIONS请求处理
export function handleOptions(request: NextRequest): NextResponse {
  const response = NextResponse.json({}, { status: 200 })
  return createCorsResponse(response, request.headers.get('origin') || undefined)
}

// 分页参数解析
export interface PaginationParams {
  page: number
  limit: number
  offset: number
}

export function parsePaginationParams(request: NextRequest): PaginationParams {
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')))
  const offset = (page - 1) * limit
  
  return { page, limit, offset }
}

// 排序参数解析
export interface SortParams {
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

export function parseSortParams(
  request: NextRequest,
  allowedFields: string[] = ['created_at']
): SortParams {
  const { searchParams } = new URL(request.url)
  const sortBy = searchParams.get('sortBy') || 'created_at'
  const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'
  
  if (!allowedFields.includes(sortBy)) {
    throw new ApiError(`无效的排序字段: ${sortBy}`, 400, 'INVALID_SORT_FIELD')
  }
  
  return { sortBy, sortOrder }
}

// 搜索参数解析
export function parseSearchParams(request: NextRequest): Record<string, string> {
  const { searchParams } = new URL(request.url)
  const search: Record<string, string> = {}
  
  // 通用搜索参数
  const searchQuery = searchParams.get('search')
  if (searchQuery) search.search = searchQuery
  
  const status = searchParams.get('status')
  if (status) search.status = status
  
  const type = searchParams.get('type')
  if (type) search.type = type
  
  const priority = searchParams.get('priority')
  if (priority) search.priority = priority
  
  return search
}

// 限流检查（简单实现）
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  request: NextRequest,
  limit: number = 100,
  windowMs: number = 60000
): boolean {
  const clientId = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  const now = Date.now()
  const windowStart = now - windowMs
  
  const clientData = rateLimitMap.get(clientId)
  
  if (!clientData || clientData.resetTime < windowStart) {
    rateLimitMap.set(clientId, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (clientData.count >= limit) {
    return false
  }
  
  clientData.count++
  return true
}