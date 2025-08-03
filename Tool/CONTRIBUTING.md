# 贡献指南

感谢您对工具集项目的关注！我们欢迎所有形式的贡献，包括但不限于：

- 🐛 报告 Bug
- 💡 提出新功能建议
- 📝 改进文档
- 🔧 提交代码修复
- 🎨 改进用户界面

## 🚀 快速开始

### 环境设置

1. **Fork 项目**
   ```bash
   # 在 GitHub 上 Fork 项目
   # 然后克隆你的 Fork
   git clone https://github.com/your-username/toolkit.git
   cd toolkit
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

4. **运行测试**
   ```bash
   npm test
   ```

## 📋 贡献流程

### 1. 创建 Issue

在开始工作之前，请先创建一个 Issue 来描述你的想法：

- **Bug 报告**: 详细描述问题、复现步骤、期望行为
- **功能请求**: 说明新功能的用途和实现思路
- **文档改进**: 指出需要改进的文档部分

### 2. 创建分支

```bash
# 确保你的主分支是最新的
git checkout main
git pull origin main

# 创建新分支
git checkout -b feature/your-feature-name
# 或者
git checkout -b fix/your-bug-fix
```

### 3. 开发

- 遵循项目的代码规范
- 编写测试用例
- 确保所有测试通过
- 更新相关文档

### 4. 提交代码

```bash
# 添加更改
git add .

# 提交更改（使用规范的提交信息）
git commit -m "feat: add new tool for text processing"
git commit -m "fix: resolve color picker issue"
git commit -m "docs: update README with new features"
```

### 5. 推送和创建 PR

```bash
# 推送到你的 Fork
git push origin feature/your-feature-name

# 在 GitHub 上创建 Pull Request
```

## 📝 代码规范

### 提交信息规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**类型 (type):**
- `feat`: 新功能
- `fix`: 修复 Bug
- `docs`: 文档更改
- `style`: 代码格式更改
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

**示例:**
```
feat(tools): add new image compression tool
fix(ui): resolve theme toggle issue
docs: update deployment guide
```

### 代码风格

- 使用 TypeScript 进行类型检查
- 遵循 ESLint 规则
- 使用 Prettier 格式化代码
- 编写有意义的变量和函数名
- 添加必要的注释

### 组件开发

```typescript
// 示例组件结构
interface ComponentProps {
  title: string;
  description?: string;
}

export function Component({ title, description }: ComponentProps) {
  return (
    <div className="component">
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}
```

## 🧪 测试

### 编写测试

```typescript
// 示例测试
import { render, screen } from '@testing-library/react';
import { Component } from './Component';

describe('Component', () => {
  it('renders title correctly', () => {
    render(<Component title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
});
```

### 运行测试

```bash
# 运行所有测试
npm test

# 运行测试并监听变化
npm run test:watch

# 生成覆盖率报告
npm run test:coverage
```

## 🛠️ 工具开发指南

### 添加新工具

1. **创建工具页面**
   ```bash
   # 在 src/app/tools/ 下创建新目录
   mkdir src/app/tools/your-category/your-tool
   ```

2. **创建页面文件**
   ```typescript
   // src/app/tools/your-category/your-tool/page.tsx
   'use client';
   
   import { useState } from 'react';
   
   export default function YourToolPage() {
     const [input, setInput] = useState('');
     const [output, setOutput] = useState('');
   
     const handleProcess = () => {
       // 工具逻辑
     };
   
     return (
       <div className="max-w-6xl mx-auto space-y-8">
         <div className="text-center">
           <h1 className="text-3xl font-bold">工具名称</h1>
           <p className="text-gray-600">工具描述</p>
         </div>
         
         {/* 工具界面 */}
       </div>
     );
   }
   ```

3. **更新导航**
   - 在 `src/app/tools/page.tsx` 中添加工具链接
   - 更新工具分类

### 工具开发原则

- **用户体验优先**: 界面简洁，操作直观
- **功能完整**: 提供必要的功能和选项
- **性能优化**: 避免阻塞主线程
- **错误处理**: 优雅处理异常情况
- **响应式设计**: 支持各种屏幕尺寸

## 📚 文档贡献

### 文档类型

- **README.md**: 项目介绍和使用指南
- **API 文档**: 组件和函数的使用说明
- **部署指南**: 部署和配置说明
- **贡献指南**: 贡献流程和规范

### 文档规范

- 使用清晰的语言
- 提供代码示例
- 包含截图或 GIF
- 保持文档的时效性

## 🐛 Bug 报告

### 报告模板

```markdown
## Bug 描述
简要描述 Bug 的内容

## 复现步骤
1. 打开网站
2. 点击某个按钮
3. 观察结果

## 期望行为
描述你期望看到的结果

## 实际行为
描述实际发生的情况

## 环境信息
- 浏览器: Chrome 120.0
- 操作系统: macOS 14.0
- 设备: Desktop

## 截图
如果适用，请添加截图
```

## 💡 功能请求

### 请求模板

```markdown
## 功能描述
详细描述你想要的功能

## 使用场景
说明这个功能的使用场景和用户价值

## 实现建议
如果有实现思路，请提供建议

## 相关链接
如果有相关的实现或参考，请提供链接
```

## 🎉 贡献者

感谢所有为项目做出贡献的开发者！

<!-- 这里会显示贡献者列表 -->

## 📞 联系我们

- **GitHub Issues**: [项目 Issues](https://github.com/your-username/toolkit/issues)
- **邮箱**: contact@your-domain.com
- **Discord**: [加入我们的社区](https://discord.gg/your-server)

---

再次感谢您的贡献！🎉 