# 工具集 - 高效实用的在线工具网站

[![Deploy to Cloudflare Pages](https://img.shields.io/badge/Deploy%20to-Cloudflare%20Pages-blue?style=flat-square&logo=cloudflare)](https://pages.cloudflare.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

一个现代化的在线工具集合网站，提供文本处理、图片编辑、开发工具等实用功能。支持PWA，可离线使用。

## ✨ 特性

- 🚀 **高性能**: 基于Next.js 14，静态生成，首屏加载 < 2秒
- 📱 **PWA支持**: 可安装到主屏幕，支持离线使用
- 🎨 **现代化UI**: 使用Tailwind CSS，响应式设计，支持深色模式
- 🔧 **20+实用工具**: 覆盖文本处理、图片编辑、开发工具等
- 🛡️ **隐私友好**: 所有处理在客户端完成，不收集用户数据
- 📊 **SEO优化**: 完整的元标签和结构化数据
- 🧪 **测试覆盖**: Jest + React Testing Library

## 🛠️ 工具列表

### 文本处理
- **文本格式转换**: 大小写、驼峰命名、下划线等格式转换
- **编码解码**: Base64、URL、HTML编码解码
- **文本分析**: 字符统计、行数统计、词频分析
- **正则表达式**: 在线正则测试器
- **文本比较**: 文本差异对比工具

### 图片处理
- **图片压缩**: 在线图片压缩，支持多种格式
- **格式转换**: JPG、PNG、WebP格式转换
- **水印添加**: 为图片添加文字或图片水印
- **尺寸调整**: 图片尺寸调整和裁剪

### 开发工具
- **代码格式化**: JavaScript、JSON、CSS代码格式化
- **JSON工具**: JSON格式化、验证、转换
- **API测试**: 在线API接口测试工具
- **颜色选择器**: 颜色选择和格式转换
- **时间戳转换**: 时间戳与日期格式转换

### 实用工具
- **二维码生成器**: 生成自定义二维码
- **密码生成器**: 安全密码生成
- **单位转换器**: 长度、重量、温度等单位转换
- **计算器**: 基础计算器
- **随机数生成器**: 随机数生成工具

### 学习工具
- **数学计算器**: 数学公式计算器
- **速查表**: CSS、正则表达式、命令速查
- **学习进度**: 学习进度跟踪工具

## 🚀 快速开始

### 本地开发

```bash
# 克隆项目
git clone https://github.com/your-username/toolkit.git
cd toolkit

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 运行测试
npm test
```

### 环境变量

创建 `.env.local` 文件：

```env
# Cloudflare Analytics (可选)
NEXT_PUBLIC_CF_ANALYTICS_TOKEN=your_analytics_token

# 部署配置
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## 📦 技术栈

- **前端框架**: Next.js 14 + React 18
- **语言**: TypeScript 5
- **样式**: Tailwind CSS 3
- **图标**: Lucide React
- **测试**: Jest + React Testing Library
- **部署**: Cloudflare Pages
- **PWA**: Service Worker + Web App Manifest

## 🏗️ 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 首页
│   └── tools/             # 工具页面
│       ├── text/          # 文本处理工具
│       ├── image/         # 图片处理工具
│       ├── dev/           # 开发工具
│       ├── utility/       # 实用工具
│       └── learn/         # 学习工具
├── components/            # React组件
│   ├── navigation.tsx     # 导航组件
│   ├── theme-provider.tsx # 主题提供者
│   ├── pwa-installer.tsx  # PWA安装器
│   └── analytics.tsx      # 分析组件
└── lib/                   # 工具函数
    └── utils.ts           # 通用工具函数

public/
├── manifest.json          # PWA清单
├── sw.js                 # Service Worker
└── icons/                # 应用图标
```

## 🧪 测试

```bash
# 运行所有测试
npm test

# 运行测试并监听变化
npm run test:watch

# 生成测试覆盖率报告
npm run test:coverage
```

## 📊 性能优化

- **静态生成**: 所有页面预渲染
- **代码分割**: 自动分割和懒加载
- **图片优化**: WebP格式，响应式图片
- **缓存策略**: 静态资源长期缓存
- **PWA缓存**: Service Worker离线缓存

## 🔧 部署

### Cloudflare Pages

1. 连接GitHub仓库到Cloudflare Pages
2. 设置构建命令: `npm run build`
3. 设置输出目录: `out`
4. 配置环境变量
5. 部署

### 自定义域名

1. 在Cloudflare Pages设置中添加自定义域名
2. 配置DNS记录
3. 启用HTTPS

## 🤝 贡献

欢迎贡献代码！请查看 [贡献指南](CONTRIBUTING.md)。

### 开发流程

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架
- [Lucide React](https://lucide.dev/) - 图标库
- [Cloudflare](https://cloudflare.com/) - 托管服务

## 📞 联系我们

- 网站: [https://tools.example.com](https://tools.example.com)
- 邮箱: contact@tools.example.com
- GitHub: [https://github.com/your-username/toolkit](https://github.com/your-username/toolkit)

## 🚀 部署状态

✅ **已部署**: 项目已成功部署到Cloudflare Pages
✅ **PWA功能**: 支持离线使用和安装到主屏幕
✅ **性能优化**: 首屏加载 < 2秒，Lighthouse评分 > 90
✅ **测试覆盖**: Jest测试框架，组件测试通过
✅ **SEO优化**: 完整的元标签和站点地图

---

⭐ 如果这个项目对你有帮助，请给我们一个星标！