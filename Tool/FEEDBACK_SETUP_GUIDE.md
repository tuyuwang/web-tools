# 用户反馈功能设置指南

## 功能概述

用户反馈功能已在主项目中实现，包括：

- **悬浮反馈按钮**: 在所有工具页面右下角显示
- **反馈弹窗**: 点击按钮后弹出反馈表单
- **Supabase集成**: 直接提交到Supabase数据库
- **客户端处理**: 适配静态导出架构

## 设置步骤

### 1. 复制环境变量模板

```bash
cp env.local.template .env.local
```

### 2. 配置Supabase

1. 访问 [Supabase官网](https://supabase.com/)
2. 创建新项目或使用现有项目
3. 在项目设置中获取以下信息：
   - Project URL
   - Anon Key (public)

### 3. 创建数据库表

在Supabase SQL编辑器中执行：

```sql
CREATE TABLE feedbacks (
  id BIGSERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  email TEXT,
  tool TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_agent TEXT,
  page_url TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX idx_feedbacks_created_at ON feedbacks(created_at DESC);
CREATE INDEX idx_feedbacks_status ON feedbacks(status);
CREATE INDEX idx_feedbacks_type ON feedbacks(type);
```

### 4. 配置环境变量

编辑 `.env.local` 文件：

```env
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# 网站配置（可选）
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### 5. 验证配置

运行开发服务器：

```bash
npm run dev
```

访问任意工具页面，右下角应该显示反馈按钮。

## 功能特性

### 反馈表单字段

- **标题** (必填): 反馈标题
- **邮箱** (可选): 联系邮箱
- **反馈类型** (必填): 
  - 一般反馈
  - 问题报告
  - 功能建议
  - 改进建议
- **反馈内容** (必填): 详细描述

### 自动收集信息

- **工具名称**: 当前访问的工具
- **页面URL**: 完整的页面地址
- **用户代理**: 浏览器信息
- **时间戳**: 提交时间

### 用户体验

- **加载状态**: 提交时显示加载动画
- **成功提示**: 提交成功后显示确认信息
- **错误处理**: 网络错误时显示友好提示
- **表单验证**: 客户端验证必填字段

## 技术实现

### 架构设计

由于主项目是静态导出，反馈功能采用客户端实现：

```
用户点击反馈按钮
    ↓
弹出反馈表单
    ↓
用户填写并提交
    ↓
客户端Supabase客户端
    ↓
直接写入Supabase数据库
```

### 关键组件

- `FeedbackButton`: 悬浮按钮和弹窗组件
- `supabase-client.ts`: 客户端Supabase配置
- 环境变量检查: 确保只在客户端初始化

### 安全考虑

- 使用Supabase的匿名密钥
- 客户端验证和服务器端验证
- 环境变量保护敏感信息

## 故障排除

### 常见问题

1. **按钮不显示**
   - 检查组件是否正确导入
   - 确认构建成功

2. **提交失败**
   - 检查环境变量配置
   - 确认Supabase表已创建
   - 查看浏览器控制台错误

3. **构建错误**
   - 确认Supabase客户端只在客户端初始化
   - 检查TypeScript类型定义

### 调试步骤

1. 打开浏览器开发者工具
2. 查看Console标签页的错误信息
3. 检查Network标签页的API请求
4. 验证Supabase仪表板中的数据

## 下一步

1. **配置Supabase**: 按照上述步骤设置数据库
2. **测试功能**: 在开发环境中测试反馈提交
3. **部署验证**: 在生产环境中验证功能
4. **监控数据**: 在Supabase仪表板中查看反馈数据

## 相关文档

- [Supabase设置指南](SUPABASE_SETUP.md)
- [反馈管理系统](FEEDBACK_ADMIN_PROJECT_SUMMARY.md)
- [项目架构说明](ARCHITECTURE_SEPARATION_SUMMARY.md) 