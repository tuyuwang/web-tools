# 技术上下文

## 技术栈

### 主项目 (Tool/)
- **框架**: Next.js 14 + React 18 + TypeScript
- **样式**: Tailwind CSS
- **部署**: Cloudflare Pages (静态导出)
- **PWA**: Service Worker + Web App Manifest
- **测试**: Jest + React Testing Library
- **构建**: `output: 'export'` (静态导出)

### 反馈管理系统 (feedback-admin/)
- **框架**: Next.js 14 + React 18 + TypeScript
- **样式**: Tailwind CSS
- **数据库**: Supabase
- **部署**: Vercel (支持API路由)
- **图标**: Lucide React
- **构建**: 动态构建 (支持API路由)

## 项目架构

### 双项目架构设计
```
┌─────────────────┐    ┌──────────────────┐
│   主项目 (Tool)  │    │ 反馈系统 (Admin) │
├─────────────────┤    ├──────────────────┤
│ • 静态导出      │    │ • 动态Next.js    │
│ • Cloudflare    │    │ • Vercel部署     │
│ • 专注工具功能  │    │ • API路由支持    │
│ • 无服务器功能  │    │ • 数据库交互     │
└─────────────────┘    └──────────────────┘
         │                       │
         └───────────────────────┘
               共享Supabase数据库
```

### 数据共享机制
- **数据库**: 两个项目共享同一个Supabase实例
- **表结构**: 统一的feedback表结构
- **API接口**: 保持接口一致性
- **权限控制**: 主项目只读，反馈系统完整CRUD

## 开发环境

### 主项目环境
- **端口**: 3000 (默认)
- **构建**: 静态导出
- **热重载**: 支持
- **TypeScript**: 严格模式

### 反馈系统环境
- **端口**: 3001 (避免冲突)
- **构建**: 动态构建
- **API路由**: 支持
- **数据库**: Supabase连接

## 依赖管理

### 主项目依赖
```json
{
  "next": "14.2.31",
  "react": "^18",
  "react-dom": "^18",
  "typescript": "^5",
  "tailwindcss": "^3.3.0",
  "lucide-react": "^0.294.0"
}
```

### 反馈系统依赖
```json
{
  "next": "14.0.4",
  "react": "^18",
  "react-dom": "^18",
  "typescript": "^5",
  "tailwindcss": "^3.3.0",
  "@supabase/supabase-js": "^2.39.0",
  "lucide-react": "^0.294.0"
}
```

## 配置差异

### 主项目配置 (next.config.js)
```javascript
const nextConfig = {
  output: 'export',  // 静态导出
  trailingSlash: true,
  images: {
    unoptimized: true, // Cloudflare Pages需要
  },
  // 移除API路由支持
}
```

### 反馈系统配置 (next.config.js)
```javascript
const nextConfig = {
  // 移除静态导出配置
  compress: true,
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  // 支持API路由
}
```

## 环境变量

### 主项目环境变量
```env
NEXT_PUBLIC_FEEDBACK_API_URL=https://your-feedback-admin.vercel.app/api
NEXT_PUBLIC_APP_URL=https://your-tool-website.pages.dev
```

### 反馈系统环境变量
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_APP_URL=https://your-feedback-admin.vercel.app
NEXT_PUBLIC_APP_NAME=反馈管理系统
```

## 部署策略

### 主项目部署 (Cloudflare Pages)
- **平台**: Cloudflare Pages
- **构建命令**: `npm run build`
- **输出目录**: `out/`
- **域名**: `tools.yourdomain.com`

### 反馈系统部署 (Vercel)
- **平台**: Vercel
- **构建命令**: `npm run build`
- **输出目录**: `.next/`
- **域名**: `admin.yourdomain.com`

## 数据库设计

### Supabase表结构
```sql
-- 反馈表
CREATE TABLE feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_feedback_status ON feedback(status);
CREATE INDEX idx_feedback_created_at ON feedback(created_at);
```

### API接口规范
```typescript
// 反馈API接口
interface FeedbackAPI {
  GET /api/feedback - 获取反馈列表
  POST /api/feedback - 创建新反馈
  GET /api/feedback/[id] - 获取单个反馈
  PATCH /api/feedback/[id] - 更新反馈
  DELETE /api/feedback/[id] - 删除反馈
}
```

## 性能优化

### 主项目优化
- **静态导出**: 预生成所有页面
- **图片优化**: WebP格式，响应式图片
- **代码分割**: 按路由分割
- **PWA缓存**: Service Worker缓存策略

### 反馈系统优化
- **API缓存**: 适当的缓存策略
- **数据库优化**: 索引和查询优化
- **代码分割**: 按组件分割
- **CDN**: Vercel边缘网络

## 安全配置

### 主项目安全
- **CSP**: 内容安全策略
- **HTTPS**: 强制HTTPS
- **XSS防护**: 输入验证和转义

### 反馈系统安全
- **API认证**: Supabase RLS策略
- **CORS**: 跨域资源共享配置
- **速率限制**: API调用频率限制
- **输入验证**: 服务器端验证

## 监控和分析

### 主项目监控
- **Cloudflare Analytics**: 访问统计
- **Lighthouse**: 性能监控
- **错误追踪**: 客户端错误

### 反馈系统监控
- **Vercel Analytics**: 访问和性能
- **Supabase Dashboard**: 数据库监控
- **API监控**: 响应时间和错误率

## 开发工具

### 代码质量
- **ESLint**: 代码规范检查
- **Prettier**: 代码格式化
- **TypeScript**: 类型检查

### 测试工具
- **Jest**: 单元测试框架
- **React Testing Library**: 组件测试
- **API测试**: 接口测试脚本

## 版本控制

### Git仓库结构
```
WebSite/
├── Tool/                    # 主项目
│   ├── .gitignore
│   ├── package.json
│   └── src/
└── feedback-admin/          # 反馈系统
    ├── .gitignore
    ├── package.json
    └── src/
```

### 分支策略
- **主项目**: `main` 分支
- **反馈系统**: `main` 分支
- **功能开发**: `feature/` 分支
- **修复**: `hotfix/` 分支

## 技术约束

### 主项目约束
- **静态导出**: 无法使用服务器端功能
- **文件大小**: 总包大小 < 25MB
- **兼容性**: 支持现代浏览器
- **PWA**: 离线功能要求

### 反馈系统约束
- **API限制**: Vercel函数执行时间限制
- **数据库**: Supabase连接数限制
- **存储**: Vercel存储限制
- **域名**: 需要配置自定义域名

## 扩展性考虑

### 主项目扩展
- **新工具**: 添加新的工具页面
- **PWA功能**: 增强离线功能
- **SEO优化**: 改进搜索引擎优化

### 反馈系统扩展
- **用户管理**: 添加用户认证
- **数据分析**: 增强统计功能
- **通知系统**: 实时通知功能
- **多语言**: 国际化支持 