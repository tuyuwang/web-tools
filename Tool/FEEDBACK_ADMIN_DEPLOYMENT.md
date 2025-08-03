# 反馈管理系统部署指南

## 项目概述

反馈管理系统是一个独立的Next.js项目，用于管理和分析用户反馈数据。它与主工具网站分离，以解决静态导出与动态API路由的冲突。

## 部署架构

### 双项目架构
```
主项目 (Tool/)
├── 静态导出
├── Cloudflare Pages部署
├── 专注工具功能
└── 无服务器端功能

反馈系统 (feedback-admin/)
├── 动态Next.js应用
├── Vercel部署
├── 支持API路由
└── 数据库交互
```

## 部署步骤

### 1. 反馈管理系统部署

#### 环境准备
1. 确保Node.js 18+已安装
2. 配置Supabase数据库
3. 准备环境变量

#### Vercel部署（推荐）
```bash
# 1. 安装Vercel CLI
npm i -g vercel

# 2. 登录Vercel
vercel login

# 3. 进入反馈项目目录
cd feedback-admin

# 4. 部署
vercel --prod
```

#### 环境变量配置
在Vercel控制台中配置以下环境变量：
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_APP_URL=https://your-feedback-admin.vercel.app
NEXT_PUBLIC_APP_NAME=反馈管理系统
```

### 2. 主项目部署

#### Cloudflare Pages部署
```bash
# 1. 构建项目
npm run build

# 2. 部署到Cloudflare Pages
# 通过Cloudflare控制台或CLI部署
```

#### 环境变量配置
```env
NEXT_PUBLIC_FEEDBACK_API_URL=https://your-feedback-admin.vercel.app/api
NEXT_PUBLIC_APP_URL=https://your-tool-website.pages.dev
```

## 数据共享配置

### Supabase数据库
两个项目共享同一个Supabase数据库：

1. **数据库表结构**
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
```

2. **权限配置**
- 主项目：只读权限（用于显示反馈统计）
- 反馈系统：完整CRUD权限

### API接口一致性
确保两个项目的API接口保持一致：

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

## 域名配置

### 推荐域名结构
```
主项目: https://tools.yourdomain.com
反馈系统: https://admin.yourdomain.com
```

### DNS配置
1. 主项目：CNAME指向Cloudflare Pages
2. 反馈系统：CNAME指向Vercel

## 监控和维护

### 性能监控
- 使用Vercel Analytics监控反馈系统
- 使用Cloudflare Analytics监控主项目
- 设置错误追踪（Sentry）

### 数据库监控
- 监控Supabase性能
- 设置数据库备份
- 监控API调用频率

### 安全配置
- 配置CORS策略
- 设置API速率限制
- 启用HTTPS强制重定向

## 故障排除

### 常见问题

1. **API连接失败**
   - 检查环境变量配置
   - 验证Supabase连接
   - 检查CORS设置

2. **构建失败**
   - 检查依赖版本兼容性
   - 验证TypeScript配置
   - 检查ESLint规则

3. **部署失败**
   - 检查环境变量
   - 验证构建脚本
   - 检查平台限制

### 调试工具
```bash
# 本地测试反馈系统
cd feedback-admin
npm run dev

# 测试API接口
curl http://localhost:3001/api/feedback

# 检查构建
npm run build
```

## 更新和维护

### 代码更新流程
1. 更新反馈系统代码
2. 测试API接口
3. 部署到Vercel
4. 更新主项目配置（如需要）
5. 部署主项目

### 数据库迁移
1. 在Supabase中执行迁移
2. 测试API接口
3. 更新应用代码
4. 部署更新

### 备份策略
- 定期备份Supabase数据
- 备份环境变量配置
- 保存部署配置

## 成本估算

### Vercel部署
- Hobby计划：免费（适合小规模使用）
- Pro计划：$20/月（适合生产环境）

### Cloudflare Pages
- 免费计划：适合大多数项目
- 付费计划：按使用量计费

### Supabase
- 免费计划：适合开发和小规模使用
- Pro计划：$25/月（适合生产环境）

## 总结

通过分离反馈管理系统，我们成功解决了静态导出与动态功能的冲突，同时保持了项目的可维护性和扩展性。这种架构设计为未来的功能扩展提供了良好的基础。 