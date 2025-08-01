# 系统模式

## 系统架构

### 整体架构
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   用户浏览器    │    │  Cloudflare CDN │    │  Cloudflare Pages│
│                 │    │                 │    │                 │
│  - PWA缓存      │◄──►│  - 边缘缓存     │◄──►│  - 静态文件存储 │
│  - 离线功能     │    │  - 压缩优化     │    │  - HTML/CSS/JS  │
│  - 本地存储     │    │  - 安全策略     │    │  - 图片资源     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 前端架构
```
┌─────────────────────────────────────────────────────────────┐
│                        App Shell                             │
├─────────────────────────────────────────────────────────────┤
│  Header │ Navigation │ Main Content │ Sidebar │ Footer      │
├─────────────────────────────────────────────────────────────┤
│                    Tool Components                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ 文本工具    │ │ 图片工具    │ │ 开发工具    │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

## 关键技术决策

### 1. 静态网站生成（SSG）
**决策**: 使用Next.js的静态导出功能
**原因**: 
- 高可用性，无服务器依赖
- 快速加载，SEO友好
- 成本低，易于扩展
- 兼容Cloudflare Pages部署

### 2. 客户端处理
**决策**: 所有工具功能在浏览器中执行
**原因**:
- 保护用户隐私
- 减少服务器负载
- 支持离线使用

### 3. PWA支持
**决策**: 实现渐进式Web应用
**原因**:
- 提供原生应用体验
- 支持离线功能
- 提高用户留存

### 4. 组件化设计
**决策**: 使用React组件架构
**原因**:
- 代码复用性高
- 易于维护和测试
- 团队协作友好

### 5. Cloudflare Pages部署
**决策**: 使用Cloudflare Pages进行静态部署
**原因**:
- 全球CDN网络，访问速度快
- 自动HTTPS和压缩
- 零配置部署
- 免费额度充足

## 使用中的设计模式

### 1. 组件模式
```typescript
// 工具组件基类
interface ToolComponent {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType;
  component: React.ComponentType;
  category: ToolCategory;
}

// 工具容器组件
const ToolContainer: React.FC<{tool: ToolComponent}> = ({tool}) => {
  return (
    <div className="tool-container">
      <tool.icon />
      <h2>{tool.name}</h2>
      <p>{tool.description}</p>
      <tool.component />
    </div>
  );
};
```

### 2. 状态管理模式
```typescript
// Zustand状态管理
interface AppState {
  currentTool: string;
  theme: 'light' | 'dark';
  favorites: string[];
  history: ToolUsage[];
  
  setCurrentTool: (tool: string) => void;
  toggleTheme: () => void;
  addFavorite: (tool: string) => void;
  addToHistory: (usage: ToolUsage) => void;
}
```

### 3. 路由模式
```typescript
// 基于文件系统的路由
/pages/
  index.tsx          // 首页
  tools/
    [category]/
      [tool].tsx     // 具体工具页面
  api/
    sitemap.xml.ts   // 站点地图
```

### 4. 缓存模式
```typescript
// 服务工作者缓存策略
const CACHE_STRATEGIES = {
  STATIC: 'cache-first',      // 静态资源
  API: 'network-first',       // API请求
  IMAGES: 'stale-while-revalidate' // 图片资源
};
```

## 组件关系

### 组件层次结构
```
App
├── Layout
│   ├── Header
│   ├── Navigation
│   ├── Main
│   └── Footer
├── ToolProvider
│   ├── ToolList
│   ├── ToolDetail
│   └── ToolSearch
└── ThemeProvider
    ├── ThemeToggle
    └── ThemeContext
```

### 数据流
```
用户操作 → 组件事件 → 状态更新 → UI重新渲染
    ↓
本地存储 ← 状态持久化 ← 状态管理 ← 业务逻辑
```

### 工具集成模式
```typescript
// 工具注册系统
class ToolRegistry {
  private tools: Map<string, ToolComponent> = new Map();
  
  register(tool: ToolComponent) {
    this.tools.set(tool.id, tool);
  }
  
  getTool(id: string): ToolComponent | undefined {
    return this.tools.get(id);
  }
  
  getAllTools(): ToolComponent[] {
    return Array.from(this.tools.values());
  }
  
  getToolsByCategory(category: ToolCategory): ToolComponent[] {
    return this.getAllTools().filter(tool => tool.category === category);
  }
}
```

## 性能优化模式

### 1. 代码分割
```typescript
// 动态导入工具组件
const ToolComponent = dynamic(() => import(`../tools/${toolId}`), {
  loading: () => <ToolSkeleton />,
  ssr: false
});
```

### 2. 图片优化
```typescript
// Next.js Image组件
import Image from 'next/image';

<Image
  src="/images/tool-icon.png"
  alt="工具图标"
  width={64}
  height={64}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### 3. 缓存策略
```typescript
// 浏览器缓存
const cacheConfig = {
  maxAge: 31536000, // 1年
  immutable: true,
  staleWhileRevalidate: 86400 // 1天
};
```

## 部署模式

### 1. 静态导出模式
```typescript
// next.config.js
const nextConfig = {
  output: 'export', // 静态导出
  trailingSlash: true, // 支持Cloudflare Pages路由
  images: {
    unoptimized: true, // 禁用图片优化
  },
};
```

### 2. Cloudflare Pages配置模式
```toml
# wrangler.toml
[build]
command = "npm run build"
publish = "out"

[build.environment]
NODE_VERSION = "18"

[[redirects]]
from = "/*"
to = "/index.html"
status = 200
```

### 3. 构建优化模式
```typescript
// 代码分割和懒加载
const ToolComponent = dynamic(() => import(`../tools/${toolId}`), {
  loading: () => <ToolSkeleton />,
  ssr: false // 客户端渲染
});

// 静态资源优化
const staticAssets = {
  images: '/images/',
  fonts: '/fonts/',
  icons: '/icons/'
};
```

## 安全模式

### 1. CSP策略
```typescript
// Content Security Policy
const csp = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self';
  connect-src 'self';
`;
```

### 2. 输入验证
```typescript
// 工具输入验证
const validateInput = (input: string, type: InputType): boolean => {
  const validators = {
    text: (str: string) => str.length <= 10000,
    url: (str: string) => /^https?:\/\/.+/.test(str),
    email: (str: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)
  };
  
  return validators[type]?.(input) ?? false;
};
``` 