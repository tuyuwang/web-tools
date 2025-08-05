'use client';

import { lazy, Suspense, ComponentType } from 'react';
import { LucideProps } from 'lucide-react';

// 加载状态组件
const ToolLoadingPlaceholder = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
      </div>
      <div className="space-y-4">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
        <div className="h-32 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
        <div className="flex space-x-2">
          <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
          <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
        </div>
      </div>
    </div>
  </div>
);

// 工具页面映射
const toolPageMap = {
  // 文本工具
  'text/analyze': () => import('@/app/tools/text/analyze/page'),
  'text/case': () => import('@/app/tools/text/case/page'),
  'text/compare': () => import('@/app/tools/text/compare/page'),
  'text/deduplicate': () => import('@/app/tools/text/deduplicate/page'),
  'text/encode': () => import('@/app/tools/text/encode/page'),
  'text/regex': () => import('@/app/tools/text/regex/page'),
  'text/stats': () => import('@/app/tools/text/stats/page'),
  
  // 实用工具
  'utility/calculator': () => import('@/app/tools/utility/calculator/page'),
  'utility/color-picker': () => import('@/app/tools/utility/color-picker/page'),
  'utility/converter': () => import('@/app/tools/utility/converter/page'),
  'utility/data-generator': () => import('@/app/tools/utility/data-generator/page'),
  'utility/file-converter': () => import('@/app/tools/utility/file-converter/page'),
  'utility/network-tools': () => import('@/app/tools/utility/network-tools/page'),
  'utility/password': () => import('@/app/tools/utility/password/page'),
  'utility/qr': () => import('@/app/tools/utility/qr/page'),
  'utility/random': () => import('@/app/tools/utility/random/page'),
  'utility/time-calculator': () => import('@/app/tools/utility/time-calculator/page'),
  'utility/unit-converter': () => import('@/app/tools/utility/unit-converter/page'),
  
  // 开发工具
  'dev/api': () => import('@/app/tools/dev/api/page'),
  'dev/color': () => import('@/app/tools/dev/color/page'),
  'dev/format': () => import('@/app/tools/dev/format/page'),
  'dev/json': () => import('@/app/tools/dev/json/page'),
  'dev/timestamp': () => import('@/app/tools/dev/timestamp/page'),
  
  // 图片工具
  'image/compress': () => import('@/app/tools/image/compress/page'),
  'image/convert': () => import('@/app/tools/image/convert/page'),
  'image/filter': () => import('@/app/tools/image/filter/page'),
  'image/resize': () => import('@/app/tools/image/resize/page'),
  'image/watermark': () => import('@/app/tools/image/watermark/page'),
  
  // AI工具
  'ai/keyword-extract': () => import('@/app/tools/ai/keyword-extract/page'),
  'ai/language-detect': () => import('@/app/tools/ai/language-detect/page'),
  'ai/sentiment-analysis': () => import('@/app/tools/ai/sentiment-analysis/page'),
  'ai/text-generator': () => import('@/app/tools/ai/text-generator/page'),
  'ai/text-summary': () => import('@/app/tools/ai/text-summary/page'),
  
  // 健康工具
  'health/bmi': () => import('@/app/tools/health/bmi/page'),
  'health/calorie': () => import('@/app/tools/health/calorie/page'),
  
  // 学习工具
  'learn/calculator': () => import('@/app/tools/learn/calculator/page'),
  'learn/cheatsheet': () => import('@/app/tools/learn/cheatsheet/page'),
  'learn/notes': () => import('@/app/tools/learn/notes/page'),
  'learn/progress': () => import('@/app/tools/learn/progress/page'),
} as const;

type ToolPath = keyof typeof toolPageMap;

// 创建懒加载组件缓存
const lazyComponentCache = new Map<ToolPath, ComponentType<any>>();

// 获取或创建懒加载组件
function getLazyComponent(toolPath: ToolPath): ComponentType<any> {
  if (!lazyComponentCache.has(toolPath)) {
    const loader = toolPageMap[toolPath];
    if (loader) {
      const LazyComponent = lazy(loader);
      lazyComponentCache.set(toolPath, LazyComponent);
    }
  }
  return lazyComponentCache.get(toolPath) || (() => <div>Tool not found</div>);
}

// 预加载工具组件
export const preloadTool = (toolPath: ToolPath) => {
  const loader = toolPageMap[toolPath];
  if (loader) {
    loader().catch(() => {
      // 忽略预加载错误
    });
  }
};

// 批量预加载工具
export const preloadTools = (toolPaths: ToolPath[]) => {
  toolPaths.forEach(preloadTool);
};

// 懒加载工具组件接口
interface LazyToolLoaderProps {
  toolPath: ToolPath;
  className?: string;
  fallback?: ComponentType<any>;
  preload?: boolean;
}

// 主要的懒加载工具组件
export function LazyToolLoader({ 
  toolPath, 
  className = "", 
  fallback: CustomFallback,
  preload = false 
}: LazyToolLoaderProps) {
  const LazyComponent = getLazyComponent(toolPath);
  const FallbackComponent = CustomFallback || ToolLoadingPlaceholder;
  
  // 预加载支持
  if (preload) {
    preloadTool(toolPath);
  }
  
  return (
    <Suspense fallback={<FallbackComponent className={className} />}>
      <LazyComponent />
    </Suspense>
  );
}

// 工具路径验证
export const isValidToolPath = (path: string): path is ToolPath => {
  return path in toolPageMap;
};

// 获取所有可用的工具路径
export const getAvailableToolPaths = (): ToolPath[] => {
  return Object.keys(toolPageMap) as ToolPath[];
};

// 清理懒加载缓存
export const clearLazyCache = () => {
  lazyComponentCache.clear();
};

// 按类别预加载工具
export const preloadToolsByCategory = (category: string) => {
  const categoryTools = getAvailableToolPaths().filter(path => path.startsWith(category));
  preloadTools(categoryTools);
};

// 智能预加载：基于用户行为预加载相关工具
export const smartPreload = (currentToolPath: ToolPath) => {
  const category = currentToolPath.split('/')[0];
  const relatedTools = getAvailableToolPaths()
    .filter(path => path.startsWith(category) && path !== currentToolPath)
    .slice(0, 3); // 只预加载3个相关工具
  
  // 延迟预加载，避免影响当前页面性能
  setTimeout(() => {
    preloadTools(relatedTools);
  }, 1000);
};