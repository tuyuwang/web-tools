'use client';

import { lazy, Suspense, useMemo } from 'react';
import { LucideProps } from 'lucide-react';

// 使用简化的动态导入策略
const createIconLoader = (iconName: string) => 
  lazy(() => 
    import('lucide-react').then(mod => ({ 
      default: mod[iconName as keyof typeof mod] as React.ComponentType<LucideProps>
    }))
  );

// 图标缓存
const iconCache = new Map<string, React.LazyExoticComponent<React.ComponentType<LucideProps>>>();

// 预加载缓存
const preloadCache = new Set<string>();

// 常用图标预定义（避免重复创建）
const commonIcons = [
  'TextCursorInput', 'Code', 'Image', 'QrCode', 'FileText', 'Palette', 
  'Send', 'Clock', 'Calculator', 'BookOpen', 'Shield', 'Home', 'Wrench',
  'Menu', 'X', 'Search', 'Filter', 'Copy', 'RotateCcw', 'Check',
  'MessageSquare', 'Brain', 'Hash', 'Sparkles', 'TrendingUp',
  'Heart', 'Frown', 'Meh', 'Download', 'RefreshCw'
];

// 预加载常用图标
commonIcons.forEach(iconName => {
  iconCache.set(iconName, createIconLoader(iconName));
});

interface DynamicIconProps extends Omit<LucideProps, 'ref'> {
  name: string;
  fallback?: React.ComponentType<LucideProps>;
  preload?: boolean;
}

// 优化的占位符图标
const DefaultIcon = ({ className, size = 24, ...props }: LucideProps) => (
  <div 
    className={`inline-flex items-center justify-center bg-gray-200 dark:bg-gray-600 rounded ${className}`}
    style={{ 
      width: size, 
      height: size,
      minWidth: size,
      minHeight: size
    }}
    role="img"
    aria-label="Loading icon"
    {...(props as any)}
  >
    <div className="w-1/2 h-1/2 bg-gray-400 dark:bg-gray-500 rounded-sm opacity-50" />
  </div>
);

export function DynamicIcon({ name, fallback: Fallback = DefaultIcon, preload = false, ...props }: DynamicIconProps) {
  const IconComponent = useMemo(() => {
    if (!name) return null;
    
    // 从缓存获取或创建新的图标组件
    if (!iconCache.has(name)) {
      iconCache.set(name, createIconLoader(name));
    }
    
    return iconCache.get(name);
  }, [name]);
  
  // 预加载支持 - 通过触发动态导入来实现
  if (preload && !preloadCache.has(name)) {
    preloadCache.add(name);
    // 触发导入但不等待结果
    import('lucide-react').catch(() => {
      // 忽略预加载错误
    });
  }
  
  if (!IconComponent) {
    return <Fallback {...props} />;
  }
  
  return (
    <Suspense fallback={<Fallback {...props} />}>
      <IconComponent {...props} />
    </Suspense>
  );
}

// 导出预加载函数
export const preloadIcon = (name: string) => {
  if (!iconCache.has(name)) {
    iconCache.set(name, createIconLoader(name));
  }
  
  if (!preloadCache.has(name)) {
    preloadCache.add(name);
    // 触发预加载
    import('lucide-react').catch(() => {
      // 忽略预加载错误
    });
  }
};

// 导出批量预加载函数
export const preloadIcons = (names: string[]) => {
  names.forEach(preloadIcon);
};

// 清理未使用的图标缓存
export const clearIconCache = () => {
  // 保留常用图标，清理其他
  const keysToDelete = Array.from(iconCache.keys()).filter(key => !commonIcons.includes(key));
  keysToDelete.forEach(key => iconCache.delete(key));
  preloadCache.clear();
};