# 反馈系统配置指南

## 问题解决

✅ **已修复**：用户和管理员使用不同设备的问题
- 用户反馈现在保存到云端数据库
- 管理员可以在任何设备上查看所有反馈
- 支持多种免费的后端服务

## 存储方案选择

### 方案1：Supabase（推荐）
免费的后端服务，包含数据库和认证。

#### 配置步骤：
1. 注册 [Supabase](https://supabase.com/) 账号
2. 创建新项目
3. 在SQL编辑器中创建表：

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
```

4. 获取项目URL和API密钥
5. 配置环境变量：

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_service_role_key
FEEDBACK_STORAGE_METHOD=supabase
```

### 方案2：Vercel KV（Redis）
Vercel提供的Redis服务，适合简单应用。

#### 配置步骤：
1. 在Vercel项目中启用KV
2. 配置环境变量：

```bash
# .env.local
KV_URL=your_kv_url
KV_REST_API_URL=your_kv_rest_url
KV_REST_API_TOKEN=your_kv_token
KV_REST_API_READ_ONLY_TOKEN=your_read_only_token
FEEDBACK_STORAGE_METHOD=vercel-kv
```

### 方案3：PlanetScale（MySQL）
免费MySQL数据库服务。

#### 配置步骤：
1. 注册 [PlanetScale](https://planetscale.com/) 账号
2. 创建数据库
3. 创建表：

```sql
CREATE TABLE feedbacks (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  email VARCHAR(255),
  tool VARCHAR(100),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_agent TEXT,
  page_url TEXT,
  status VARCHAR(20) DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

4. 配置环境变量：

```bash
# .env.local
DATABASE_URL=your_planetscale_url
FEEDBACK_STORAGE_METHOD=planetscale
```

### 方案4：Google Sheets
使用Google Sheets作为简单的数据库。

#### 配置步骤：
1. 创建Google Sheets
2. 设置Google Apps Script
3. 配置环境变量：

```bash
# .env.local
GOOGLE_SHEETS_ID=your_sheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email
GOOGLE_PRIVATE_KEY=your_private_key
FEEDBACK_STORAGE_METHOD=google-sheets
```

## 快速开始

### 推荐使用Supabase（最简单）

1. **注册Supabase**：
   - 访问 https://supabase.com/
   - 注册免费账号
   - 创建新项目

2. **创建数据库表**：
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
   ```

3. **获取配置信息**：
   - 项目URL：Settings → API
   - Service Role Key：Settings → API → service_role

4. **配置环境变量**：
   ```bash
   echo "NEXT_PUBLIC_SUPABASE_URL=your_supabase_url" >> .env.local
   echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_service_role_key" >> .env.local
   echo "FEEDBACK_STORAGE_METHOD=supabase" >> .env.local
   ```

5. **部署项目**：
   ```bash
   npm run build
   # 部署到您的托管服务
   ```

## 管理反馈

### 访问管理页面
```
https://your-domain.com/admin/feedback
```

### 功能
- ✅ 查看所有用户反馈
- ✅ 按类型筛选
- ✅ 搜索反馈内容
- ✅ 更新反馈状态
- ✅ 删除反馈
- ✅ 导出数据

## 数据安全

- 所有数据存储在云端数据库
- 支持数据备份和导出
- 管理员可以管理所有反馈
- 用户数据跨设备同步

## 注意事项

1. **选择免费方案**：所有推荐的服务都有免费套餐
2. **数据备份**：定期导出数据备份
3. **访问控制**：建议为管理页面添加认证
4. **隐私保护**：注意用户隐私数据保护

## 故障排除

### 常见问题
1. **API错误**：检查环境变量配置
2. **数据库连接失败**：检查网络和密钥
3. **权限问题**：确保API密钥有正确权限

### 调试方法
1. 检查浏览器控制台错误
2. 查看服务器日志
3. 测试API端点 