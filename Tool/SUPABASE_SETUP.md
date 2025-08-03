# Supabase配置指南

## 步骤1：创建环境变量文件

复制 `env.local.template` 文件为 `.env.local`：

```bash
cp env.local.template .env.local
```

## 步骤2：获取Supabase参数

### 2.1 注册Supabase账号
1. 访问 [Supabase官网](https://supabase.com/)
2. 点击"Start your project"
3. 使用GitHub或邮箱注册

### 2.2 创建项目
1. 登录后点击"New Project"
2. 填写项目信息：
   - **Organization**: 选择或创建组织
   - **Project name**: 例如 `toolkit-feedback`
   - **Database password**: 设置数据库密码（请记住）
   - **Region**: 选择离您最近的地区（如 `Asia Pacific (Singapore)`）

### 2.3 获取配置参数

#### 获取项目URL
1. 进入项目仪表板
2. 点击左侧菜单 **Settings** → **API**
3. 复制 **Project URL**（格式：`https://xxxxxxxxxxxxx.supabase.co`）

#### 获取Service Role Key
1. 在同一页面（Settings → API）
2. 找到 **Project API keys** 部分
3. 复制 **service_role** 密钥（以 `eyJ...` 开头的长字符串）

## 步骤3：创建数据库表

1. 在Supabase仪表板中，点击左侧菜单的 **SQL Editor**
2. 点击 **New query**
3. 执行以下SQL语句：

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

## 步骤4：配置环境变量

编辑 `.env.local` 文件，填入您的参数：

```bash
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_actual_service_role_key

# 存储方式
FEEDBACK_STORAGE_METHOD=supabase

# 网站配置（可选）
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## 步骤5：验证配置

运行验证命令：

```bash
npm run verify-supabase
```

如果看到以下输出，说明配置成功：
```
🔍 验证Supabase配置...

✅ 环境变量配置正确
✅ Supabase API 连接成功
✅ 数据库表 feedbacks 存在
✅ 数据插入权限正常

🎉 Supabase配置验证成功！
您的反馈系统已准备就绪。
```

## 参数说明

### 必须参数

| 参数名 | 说明 | 获取位置 | 示例 |
|--------|------|----------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase项目URL | Settings → API → Project URL | `https://abcdefghijklmnop.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 服务角色密钥 | Settings → API → service_role | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

### 可选参数

| 参数名 | 说明 | 获取位置 | 示例 |
|--------|------|----------|------|
| `NEXT_PUBLIC_SITE_URL` | 您的网站域名 | 您的网站 | `https://tools.example.com` |

## 常见问题

### Q: 找不到service_role密钥？
A: 在Settings → API页面，向下滚动找到"Project API keys"部分，service_role密钥在那里。

### Q: 验证失败怎么办？
A: 
1. 检查环境变量是否正确填写
2. 确认数据库表是否已创建
3. 检查网络连接
4. 查看错误信息进行排查

### Q: 如何查看已提交的反馈？
A: 访问 `/admin/feedback` 页面查看所有反馈。

## 安全注意事项

1. **不要提交.env.local文件**：该文件已添加到.gitignore
2. **保护Service Role Key**：这个密钥有完整权限，请妥善保管
3. **定期备份数据**：建议定期导出反馈数据

## 下一步

配置完成后：
1. 重新构建项目：`npm run build`
2. 部署到您的托管服务
3. 测试反馈功能
4. 访问管理页面查看反馈 