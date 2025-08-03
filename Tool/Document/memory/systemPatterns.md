# 系统模式

## 架构模式

### 双项目分离架构
采用**微前端**思想，将静态功能和动态功能分离：

```
┌─────────────────┐    ┌──────────────────┐
│   主项目 (Tool)  │    │ 反馈系统 (Admin) │
├─────────────────┤    ├──────────────────┤
│ • 静态导出      │    │ • 动态Next.js    │
│ • 工具功能      │    │ • 管理功能       │
│ • PWA支持       │    │ • API路由        │
│ • 客户端处理    │    │ • 数据库交互     │
└─────────────────┘    └──────────────────┘
         │                       │
         └───────────────────────┘
               共享数据层 (Supabase)
```

### 数据共享模式
- **统一数据源**: 两个项目共享Supabase数据库
- **接口一致性**: 保持API接口规范统一
- **权限分离**: 主项目只读，反馈系统完整CRUD

## 设计模式

### 主项目模式

#### 静态生成模式
```typescript
// 所有页面在构建时预生成
export const generateStaticParams = async () => {
  return [
    { category: 'text' },
    { category: 'image' },
    { category: 'dev' },
    // ...
  ]
}
```

#### 客户端状态管理
```typescript
// 使用React状态管理工具状态
const useToolStore = create((set) => ({
  currentTool: null,
  setCurrentTool: (tool) => set({ currentTool: tool }),
  // ...
}))
```

#### PWA模式
```typescript
// Service Worker缓存策略
const CACHE_NAME = 'tool-cache-v1'
const urlsToCache = [
  '/',
  '/tools',
  '/static/js/bundle.js',
  // ...
]
```

### 反馈系统模式

#### API路由模式
```typescript
// RESTful API设计
export async function GET(request: Request) {
  // 获取反馈列表
}

export async function POST(request: Request) {
  // 创建新反馈
}

export async function PATCH(request: Request) {
  // 更新反馈
}
```

#### 数据库访问模式
```typescript
// Supabase客户端模式
const supabase = createClient(url, key)

// 查询模式
const { data, error } = await supabase
  .from('feedback')
  .select('*')
  .order('created_at', { ascending: false })
```

#### 组件模式
```typescript
// 容器组件模式
const FeedbackList = () => {
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(true)
  
  // 数据获取逻辑
  useEffect(() => {
    fetchFeedbacks()
  }, [])
  
  return <FeedbackListUI feedbacks={feedbacks} loading={loading} />
}
```

## 组件架构

### 主项目组件层次
```
App
├── Layout
│   ├── Navigation
│   ├── ThemeProvider
│   └── SWRegister
├── Page
│   ├── ToolContainer
│   └── ToolCard
└── PWAInstaller
```

### 反馈系统组件层次
```
App
├── Layout
│   ├── Navigation
│   └── Footer
├── Page
│   ├── FeedbackList
│   ├── FeedbackForm
│   └── FeedbackStats
└── API Routes
    ├── GET /api/feedback
    ├── POST /api/feedback
    └── PATCH /api/feedback/[id]
```

## 状态管理模式

### 主项目状态
- **工具状态**: 当前选中的工具
- **主题状态**: 深色/浅色主题
- **PWA状态**: 安装提示状态

### 反馈系统状态
- **反馈列表**: 分页和过滤状态
- **表单状态**: 提交和验证状态
- **用户状态**: 认证和权限状态

## 路由模式

### 主项目路由
```typescript
// 基于文件系统的路由
/tools                    // 工具列表
/tools/[category]         // 分类页面
/tools/[category]/[tool]  // 具体工具
```

### 反馈系统路由
```typescript
// 管理路由
/admin/feedback          // 反馈管理
/api/feedback           // API接口
/api/feedback/[id]      // 单个反馈操作
```

## 数据流模式

### 主项目数据流
```
用户操作 → 客户端处理 → 本地存储 → UI更新
```

### 反馈系统数据流
```
用户操作 → API请求 → 数据库操作 → 响应返回 → UI更新
```

## 错误处理模式

### 主项目错误处理
```typescript
// 客户端错误边界
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    // 记录错误到客户端
    console.error('Error:', error)
  }
}
```

### 反馈系统错误处理
```typescript
// API错误处理
export async function GET(request: Request) {
  try {
    const { data, error } = await supabase.from('feedback').select('*')
    if (error) throw error
    return Response.json(data)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
```

## 性能优化模式

### 主项目优化
- **静态生成**: 构建时预渲染所有页面
- **代码分割**: 按路由自动分割
- **图片优化**: WebP格式，响应式图片
- **缓存策略**: Service Worker缓存

### 反馈系统优化
- **API缓存**: 适当的缓存头
- **数据库优化**: 索引和查询优化
- **分页加载**: 避免一次性加载大量数据
- **CDN**: 利用Vercel边缘网络

## 安全模式

### 主项目安全
- **CSP**: 内容安全策略
- **HTTPS**: 强制安全连接
- **输入验证**: 客户端验证

### 反馈系统安全
- **API认证**: Supabase RLS策略
- **CORS**: 跨域资源共享
- **输入验证**: 服务器端验证
- **速率限制**: API调用频率限制

## 测试模式

### 主项目测试
```typescript
// 组件测试
describe('ToolCard', () => {
  it('should render tool information', () => {
    render(<ToolCard tool={mockTool} />)
    expect(screen.getByText(mockTool.name)).toBeInTheDocument()
  })
})
```

### 反馈系统测试
```typescript
// API测试
describe('Feedback API', () => {
  it('should create new feedback', async () => {
    const response = await fetch('/api/feedback', {
      method: 'POST',
      body: JSON.stringify(mockFeedback)
    })
    expect(response.status).toBe(200)
  })
})
```

## 部署模式

### 主项目部署
```bash
# 静态导出
npm run build
# 输出到 out/ 目录
# 部署到 Cloudflare Pages
```

### 反馈系统部署
```bash
# 动态构建
npm run build
# 部署到 Vercel
# 自动配置环境变量
```

## 监控模式

### 主项目监控
- **性能监控**: Lighthouse CI
- **错误监控**: 客户端错误收集
- **用户分析**: 隐私友好的分析

### 反馈系统监控
- **API监控**: 响应时间和错误率
- **数据库监控**: Supabase Dashboard
- **访问分析**: Vercel Analytics

## 扩展模式

### 主项目扩展
- **新工具**: 添加新的工具页面
- **PWA功能**: 增强离线功能
- **主题系统**: 多主题支持

### 反馈系统扩展
- **用户管理**: 添加认证系统
- **数据分析**: 增强统计功能
- **通知系统**: 实时通知
- **多语言**: 国际化支持

## 维护模式

### 代码维护
- **版本控制**: Git分支策略
- **代码审查**: PR审查流程
- **自动化测试**: CI/CD集成

### 数据维护
- **数据库备份**: 定期备份策略
- **数据清理**: 过期数据清理
- **性能监控**: 持续性能优化

## 总结

通过双项目架构模式，我们实现了：
- **职责分离**: 静态和动态功能完全分离
- **技术适配**: 每个项目使用最适合的技术栈
- **扩展性**: 可以独立扩展每个项目
- **维护性**: 降低系统复杂度，提高可维护性 