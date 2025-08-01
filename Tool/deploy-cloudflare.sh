#!/bin/bash

# Cloudflare Pages 部署脚本

echo "🚀 开始部署到 Cloudflare Pages..."

# 1. 清理之前的构建
echo "📦 清理之前的构建..."
rm -rf .next out

# 2. 安装依赖
echo "📥 安装依赖..."
npm ci --only=production

# 3. 构建项目
echo "🔨 构建项目..."
npm run build

# 4. 检查构建结果
if [ -d "out" ]; then
    echo "✅ 构建成功！"
    echo "📁 构建输出目录: out/"
    echo "📄 生成的文件:"
    ls -la out/
else
    echo "❌ 构建失败！"
    exit 1
fi

# 5. 部署到 Cloudflare Pages
echo "🌐 部署到 Cloudflare Pages..."
echo "请按照以下步骤操作："
echo ""
echo "1. 登录 Cloudflare Dashboard"
echo "2. 进入 Pages 项目"
echo "3. 在构建设置中配置："
echo "   - 构建命令: npm run build"
echo "   - 构建输出目录: out"
echo "   - Node.js 版本: 18"
echo ""
echo "4. 触发新的部署"
echo ""
echo "或者使用 Wrangler CLI："
echo "wrangler pages deploy out"

echo "🎉 部署脚本完成！" 