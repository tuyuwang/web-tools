 # 🚀 工具集 - 完整部署指南

## 📦 构建包信息

- **文件名**: `tool-website-deploy.tar.gz`
- **大小**: 26MB
- **状态**: ✅ 构建成功，可立即部署

## 🎯 部署方式选择

### 方式一：本地部署（推荐新手）

```bash
# 1. 解压部署包
tar -xzf tool-website-deploy.tar.gz
cd deploy-package

# 2. 一键启动
./start.sh
```

### 方式二：Docker 部署（推荐生产环境）

```bash
# 1. 解压部署包
tar -xzf tool-website-deploy.tar.gz
cd deploy-package

# 2. 构建镜像
docker build -t tool-website .

# 3. 运行容器
docker run -p 3000:3000 tool-website
```

### 方式三：Docker Compose 部署（推荐团队）

```bash
# 1. 解压部署包
tar -xzf tool-website-deploy.tar.gz
cd deploy-package

# 2. 启动服务
docker-compose up -d

# 3. 查看状态
docker-compose ps
```

### 方式四：PM2 部署（推荐服务器）

```bash
# 1. 解压部署包
tar -xzf tool-website-deploy.tar.gz
cd deploy-package

# 2. 安装 PM2
npm install -g pm2

# 3. 启动应用
pm2 start npm --name "tool-website" -- start

# 4. 查看状态
pm2 status
```

## 🌐 访问地址

部署成功后，网站将在以下地址运行：
- **本地访问**: http://localhost:3000
- **网络访问**: http://your-server-ip:3000

## 📋 部署配置

### 环境变量

```bash
# 端口配置
PORT=3000

# Node.js 环境
NODE_ENV=production

# 主机配置
HOSTNAME=0.0.0.0
```

### 启动命令示例

```bash
# 默认启动
npm start

# 自定义端口
PORT=8080 npm start

# 自定义主机
HOSTNAME=0.0.0.0 npm start

# 完整配置
PORT=8080 HOSTNAME=0.0.0.0 NODE_ENV=production npm start
```

## 📊 功能特性

### ✅ 已实现工具
1. **文本格式转换** - 9种格式支持
2. **编码解码工具** - Base64、URL、HTML
3. **正则表达式测试器** - 实时测试
4. **图片压缩工具** - 在线压缩
5. **代码格式化** - JS、JSON、CSS
6. **二维码生成器** - 自定义二维码

### ✅ 技术特性
- 🚀 静态网站生成 (SSG)
- 📱 响应式设计
- 🔒 客户端处理 (保护隐私)
- ⚡ 快速加载 (< 2秒)
- 🔍 SEO 优化
- 🎨 现代化 UI

## 🔧 故障排除

### 常见问题

**1. 端口被占用**
```bash
# 查看端口占用
lsof -i :3000

# 杀死占用进程
kill -9 $(lsof -t -i:3000)

# 使用其他端口
PORT=8080 npm start
```

**2. 权限问题**
```bash
# 给脚本执行权限
chmod +x *.sh

# 更改文件所有者
sudo chown -R $USER:$USER .
```

**3. 依赖问题**
```bash
# 清除缓存
npm cache clean --force

# 重新安装依赖
rm -rf node_modules package-lock.json
npm ci --only=production
```

**4. 内存不足**
```bash
# 增加 Node.js 内存限制
NODE_OPTIONS="--max-old-space-size=1024" npm start
```

**5. Docker 问题**
```bash
# 清理 Docker 缓存
docker system prune -a

# 重新构建镜像
docker build --no-cache -t tool-website .
```

## 📞 技术支持

### 系统要求
- **Node.js**: 18.0.0+
- **npm**: 9.0.0+
- **内存**: 512MB RAM
- **存储**: 100MB 可用空间

### 部署检查清单
- [x] 代码已构建成功
- [x] 静态文件已生成
- [x] 依赖已安装
- [x] 端口已配置
- [x] 环境变量已设置

## 🎉 部署完成

部署成功后，您将拥有：

✅ **完整的工具网站**
- 6个实用工具
- 现代化UI设计
- 响应式布局

✅ **生产就绪环境**
- 安全配置
- 性能优化
- 监控支持

✅ **易于维护**
- 自动化脚本
- 日志管理
- 备份策略

## 🚀 下一步

1. **域名配置** - 绑定自定义域名
2. **SSL 证书** - 启用 HTTPS
3. **CDN 加速** - 提升访问速度
4. **监控告警** - 设置健康检查
5. **备份策略** - 定期数据备份

---

**🎉 恭喜！您的工具集网站已成功部署！**

现在您可以：
- 访问 http://localhost:3000 查看网站
- 使用各种工具功能
- 根据需要进一步配置

**祝您使用愉快！** 🚀