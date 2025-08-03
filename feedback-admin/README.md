# 反馈管理系统

这是一个独立的反馈管理系统，用于管理和分析用户反馈数据。

## 项目概述

### 架构设计
- **主项目**：静态导出的工具网站，专注于工具功能
- **反馈系统**：独立的动态Next.js项目，支持API路由和数据库交互

### 技术栈
- **框架**：Next.js 14 + React 18 + TypeScript
- **样式**：Tailwind CSS
- **数据库**：Supabase
- **图标**：Lucide React

## 功能特性

### 核心功能
- ✅ 反馈数据管理
- ✅ 反馈统计分析
- ✅ 反馈回复功能
- ✅ 数据导出功能
- ✅ 实时通知系统

### 管理功能
- ✅ 反馈列表查看
- ✅ 反馈详情查看
- ✅ 反馈状态管理
- ✅ 批量操作支持
- ✅ 高级搜索过滤

## 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 环境配置
1. 复制环境变量文件：
```bash
cp .env.example .env.local
```

2. 配置Supabase连接：
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:3001 查看应用。

## 项目结构

```
feedback-admin/
├── src/
│   ├── app/
│   │   ├── api/feedback/     # 反馈API路由
│   │   ├── admin/feedback/   # 反馈管理页面
│   │   └── page.tsx          # 首页
│   ├── components/           # 反馈相关组件
│   └── lib/
│       └── supabase.ts       # Supabase客户端
├── public/                   # 静态资源
└── package.json
```

## API路由

### 反馈API
- `GET /api/feedback` - 获取反馈列表
- `POST /api/feedback` - 创建新反馈
- `GET /api/feedback/[id]` - 获取单个反馈
- `PATCH /api/feedback/[id]` - 更新反馈
- `DELETE /api/feedback/[id]` - 删除反馈

## 部署

### Vercel部署
1. 连接GitHub仓库
2. 配置环境变量
3. 自动部署

### 其他平台
支持任何支持Next.js的平台部署。

## 开发指南

### 代码规范
- 使用TypeScript进行类型检查
- 遵循ESLint规则
- 使用Prettier格式化代码

### 测试
```bash
npm run test
```

### 构建
```bash
npm run build
```

## 与主项目集成

### 数据共享
- 使用相同的Supabase数据库
- 共享反馈数据表结构
- 保持API接口一致性

### 部署策略
- 主项目：Cloudflare Pages（静态部署）
- 反馈系统：Vercel或其他支持API的平台

## 维护说明

### 数据库维护
- 定期备份Supabase数据
- 监控数据库性能
- 清理过期数据

### 系统监控
- 监控API响应时间
- 跟踪错误日志
- 监控用户活动

## 许可证

MIT License
