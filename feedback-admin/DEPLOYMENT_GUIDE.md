# 反馈管理系统部署指南

## 快速部署

### 1. 环境准备

#### 系统要求
- Node.js 18+ 
- npm 或 yarn
- Supabase 账户（推荐）

#### 克隆项目
```bash
git clone <your-repo-url>
cd feedback-admin
```

### 2. 依赖安装

```bash
npm install
```

### 3. 环境配置

#### 复制环境变量文件
```bash
cp .env.example .env.local
```

#### 配置必需的环境变量
```env
# 必需配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3001
NODE_ENV=development
```

### 4. 数据库设置

#### Supabase 表结构
```sql
-- 创建反馈表
CREATE TABLE feedbacks (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('bug', 'feature', 'improvement', 'other')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    email TEXT,
    tool TEXT,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'in-progress', 'resolved')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    timestamp TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reply TEXT,
    tags TEXT[],
    metadata JSONB
);

-- 创建索引
CREATE INDEX idx_feedbacks_status ON feedbacks(status);
CREATE INDEX idx_feedbacks_type ON feedbacks(type);
CREATE INDEX idx_feedbacks_created_at ON feedbacks(created_at);
CREATE INDEX idx_feedbacks_priority ON feedbacks(priority);
CREATE INDEX idx_feedbacks_status_created ON feedbacks(status, created_at);

-- 启用 RLS (行级安全)
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

-- 创建策略（根据需要调整）
CREATE POLICY "Allow all operations" ON feedbacks FOR ALL USING (true);
```

### 5. 本地开发

```bash
# 启动开发服务器
npm run dev

# 访问应用
# 前端: http://localhost:3001
# 管理后台: http://localhost:3001/admin
```

### 6. 构建和部署

#### 本地构建测试
```bash
npm run build
npm start
```

#### Vercel 部署
1. 连接 GitHub 仓库到 Vercel
2. 设置环境变量
3. 部署

#### 其他平台部署
支持任何支持 Next.js 的平台：
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## API 文档

### 端点概览

```
GET    /api/health              # 健康检查
GET    /api/feedback            # 获取反馈列表（支持分页、搜索、过滤）
POST   /api/feedback            # 创建新反馈
GET    /api/feedback/[id]       # 获取特定反馈
PATCH  /api/feedback/[id]       # 更新反馈
DELETE /api/feedback/[id]       # 删除反馈
POST   /api/feedback/batch      # 批量操作
GET    /api/feedback/stats      # 获取统计数据
```

### 使用示例

#### 创建反馈
```javascript
const response = await fetch('/api/feedback', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    type: 'bug',
    title: '发现了一个bug',
    description: '详细描述...',
    email: 'user@example.com',
    priority: 'high'
  })
});

const result = await response.json();
if (result.success) {
  console.log('反馈创建成功:', result.data);
}
```

#### 获取反馈列表
```javascript
const response = await fetch('/api/feedback?page=1&limit=10&status=new');
const result = await response.json();

if (result.success) {
  const { data, pagination } = result.data;
  console.log('反馈列表:', data);
  console.log('分页信息:', pagination);
}
```

## 监控和维护

### 健康检查
```bash
curl http://localhost:3001/api/health
```

### 日志监控
- 检查应用日志
- 监控 API 响应时间
- 跟踪错误率

### 数据库维护
- 定期备份数据
- 监控查询性能
- 清理过期数据

## 故障排除

### 常见问题

#### 1. 环境变量未配置
**错误**: `Missing env.NEXT_PUBLIC_SUPABASE_URL`
**解决**: 确保 `.env.local` 文件包含所有必需的环境变量

#### 2. 数据库连接失败
**错误**: 数据库操作失败
**解决**: 
- 检查 Supabase 凭据
- 确认网络连接
- 验证数据库表是否存在

#### 3. 构建失败
**错误**: TypeScript 或编译错误
**解决**:
- 运行 `npm run build` 查看详细错误
- 检查依赖版本兼容性
- 确保所有类型定义正确

#### 4. API 限流
**错误**: `429 Too Many Requests`
**解决**: 调整请求频率或联系管理员

### 性能优化建议

#### 数据库优化
- 使用适当的索引
- 定期分析查询性能
- 考虑数据分区

#### 前端优化
- 启用缓存
- 优化图片资源
- 使用 CDN

#### API 优化
- 实现响应缓存
- 优化查询逻辑
- 使用连接池

## 安全建议

### 环境变量安全
- 不要在代码中硬编码敏感信息
- 使用不同环境的不同凭据
- 定期轮换 API 密钥

### API 安全
- 启用 CORS 限制
- 实现适当的限流
- 验证所有输入数据
- 使用 HTTPS

### 数据库安全
- 启用行级安全 (RLS)
- 定期更新凭据
- 监控异常访问

## 扩展功能

### 即将推出的功能
- [ ] 邮件通知系统
- [ ] 实时推送通知
- [ ] 高级数据分析
- [ ] 用户认证系统
- [ ] 多语言支持

### 自定义集成
系统支持通过以下方式扩展：
- Webhook 集成
- 第三方 API 连接
- 自定义插件开发

## 支持

### 技术支持
- 查看项目文档
- 提交 GitHub Issue
- 联系开发团队

### 社区
- 参与讨论
- 贡献代码
- 分享使用经验

---

**注意**: 此部署指南假设你已经有基本的 Web 开发和部署经验。如需更详细的指导，请参考相关技术文档。