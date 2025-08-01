# 技术上下文

## 技术栈

### 前端框架
- **Next.js 14**: React框架，支持SSG、SSR、静态导出
- **React 18**: 用户界面库，支持并发特性
- **TypeScript 5**: 类型安全的JavaScript超集

### 样式和UI
- **Tailwind CSS 3**: 实用优先的CSS框架
- **Lucide React**: 现代图标库
- **clsx**: 条件类名工具

### 构建工具
- **Webpack**: 模块打包器（Next.js内置）
- **SWC**: 快速JavaScript/TypeScript编译器
- **PostCSS**: CSS后处理器

### 代码质量
- **ESLint**: JavaScript代码检查
- **Prettier**: 代码格式化
- **TypeScript**: 静态类型检查

## 部署配置

### 部署平台
- **Cloudflare Pages**: 静态网站托管平台
- **CDN**: Cloudflare全球内容分发网络
- **边缘计算**: Cloudflare Workers（未来扩展）

### 构建配置
```javascript
// next.config.js
const nextConfig = {
  output: 'export', // 静态导出
  trailingSlash: true, // 支持Cloudflare Pages路由
  images: {
    unoptimized: true, // 禁用图片优化
  },
  experimental: {
    swcMinify: true, // 启用SWC压缩
  },
}
```

### 部署文件
- `wrangler.toml`: Cloudflare Pages配置
- `.cloudflare/pages.json`: 部署配置
- `deploy-cloudflare.sh`: 自动化部署脚本

## 架构设计

### 静态生成策略
- **预渲染**: 构建时生成所有页面
- **客户端路由**: 使用Next.js App Router
- **代码分割**: 自动分割和懒加载

### 性能优化
- **图片优化**: WebP格式，响应式图片
- **字体优化**: 预加载关键字体
- **缓存策略**: 静态资源长期缓存
- **压缩**: Gzip/Brotli压缩

### SEO优化
- **元标签**: 完整的Open Graph和Twitter卡片
- **结构化数据**: JSON-LD格式
- **站点地图**: 自动生成（待实现）
- **可访问性**: WCAG 2.1标准（待实现）

## 开发环境

### 本地开发
```bash
# 安装依赖
npm install

# 开发服务器
npm run dev

# 构建项目
npm run build

# 本地预览
npx serve out
```

### 代码规范
- **ESLint配置**: Next.js推荐配置
- **Prettier配置**: 统一的代码格式
- **TypeScript**: 严格模式
- **Git hooks**: 提交前检查（待配置）

### 测试策略
- **单元测试**: Jest + React Testing Library（待实现）
- **集成测试**: Cypress（待实现）
- **性能测试**: Lighthouse CI（待实现）

## 依赖管理

### 核心依赖
```json
{
  "next": "^14.0.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "typescript": "^5.0.0",
  "tailwindcss": "^3.3.0"
}
```

### 工具依赖
```json
{
  "lucide-react": "^0.535.0",
  "qrcode": "^1.5.4",
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.3.1"
}
```

### 开发依赖
```json
{
  "eslint": "^8.0.0",
  "eslint-config-next": "^14.0.0",
  "prettier": "^3.0.0",
  "@types/node": "^20.0.0"
}
```

## 安全考虑

### 客户端安全
- **CSP**: 内容安全策略（待实现）
- **HTTPS**: 强制HTTPS连接
- **XSS防护**: React内置防护
- **CSRF防护**: 客户端处理，无服务器端

### 数据隐私
- **客户端处理**: 所有数据在浏览器中处理
- **无服务器存储**: 不收集用户数据
- **隐私友好**: 符合GDPR要求

## 监控和分析

### 性能监控
- **Core Web Vitals**: 监控关键性能指标
- **错误追踪**: 客户端错误监控（待实现）
- **用户分析**: 隐私友好的分析工具（待实现）

### 部署监控
- **构建状态**: Cloudflare Pages构建监控
- **可用性**: 网站可用性监控（待实现）
- **性能**: 定期性能测试（待实现）

## 扩展计划

### 短期扩展
- **PWA支持**: Service Worker和离线功能
- **多语言**: 国际化支持
- **主题系统**: 深色/浅色主题切换

### 长期扩展
- **Cloudflare Workers**: 边缘计算功能
- **数据库集成**: 用户数据存储
- **API服务**: 后端服务支持

## 技术债务

### 当前债务
- **测试覆盖**: 缺少自动化测试
- **监控系统**: 缺少完整的监控
- **文档**: 需要更详细的API文档

### 优先级
1. **高**: 添加自动化测试
2. **中**: 实现监控系统
3. **低**: 完善文档

---

**最后更新**: 2024年12月
**技术状态**: 生产就绪
**维护状态**: 活跃开发 