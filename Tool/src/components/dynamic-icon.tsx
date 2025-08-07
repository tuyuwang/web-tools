'use client';

import { lazy, Suspense, useMemo, memo } from 'react';
import { LucideProps } from 'lucide-react';

// 优化的图标导入策略 - 回退到稳定的方法
const createSelectiveIconLoader = (iconName: string) => 
  lazy(async () => {
    try {
      // 使用完整库导入但只选择需要的图标
      const fullModule = await import('lucide-react');
      const IconComponent = fullModule[iconName as keyof typeof fullModule] as React.ComponentType<LucideProps>;
      
      if (!IconComponent) {
        throw new Error(`Icon ${iconName} not found`);
      }
      
      return { default: IconComponent };
    } catch (error) {
      console.warn(`Failed to load icon: ${iconName}`, error);
      // 返回默认图标组件
      return {
        default: (props: LucideProps) => (
          <div 
            className="inline-flex items-center justify-center bg-gray-200 dark:bg-gray-600 rounded"
            style={{ width: props.size || 24, height: props.size || 24 }}
            role="img"
            aria-label="Icon not found"
          >
            <div className="w-1/2 h-1/2 bg-gray-400 dark:bg-gray-500 rounded-sm opacity-50" />
          </div>
        )
      };
    }
  });

// 图标缓存 - 使用WeakMap提高内存效率
const iconCache = new Map<string, React.LazyExoticComponent<React.ComponentType<LucideProps>>>();
const preloadCache = new Set<string>();

// 按使用频率分层的图标预定义
const criticalIcons = [
  'Home', 'Menu', 'X', 'Search', 'Check', 'Copy'
];

const commonIcons = [
  'TextCursorInput', 'Code', 'Image', 'QrCode', 'FileText', 'Palette', 
  'Send', 'Clock', 'Calculator', 'BookOpen', 'Shield', 'Wrench',
  'Filter', 'RotateCcw', 'MessageSquare', 'Brain', 'Hash', 'Sparkles', 
  'TrendingUp', 'Heart', 'Frown', 'Meh', 'Download', 'RefreshCw'
];

// 预加载关键图标（页面初始化时必需）
criticalIcons.forEach(iconName => {
  iconCache.set(iconName, createSelectiveIconLoader(iconName));
});

interface DynamicIconProps extends Omit<LucideProps, 'ref'> {
  name: string;
  fallback?: React.ComponentType<any>;
  preload?: boolean;
  priority?: 'critical' | 'high' | 'normal' | 'low';
}

// 优化的占位符图标 - 减少DOM操作
const DefaultIcon = memo(({ className, size = 24 }: any) => (
  <div 
    className={`inline-flex items-center justify-center bg-gray-200 dark:bg-gray-600 rounded ${className || ''}`}
    style={{ 
      width: size, 
      height: size,
      minWidth: size,
      minHeight: size
    }}
    role="img"
    aria-label="Loading icon"
  >
    <div className="w-1/2 h-1/2 bg-gray-400 dark:bg-gray-500 rounded-sm opacity-50" />
  </div>
));
DefaultIcon.displayName = 'DefaultIcon';

// 智能预加载策略
const shouldPreload = (iconName: string, priority: string = 'normal') => {
  if (criticalIcons.includes(iconName)) return true;
  if (priority === 'critical' || priority === 'high') return true;
  if (commonIcons.includes(iconName) && priority !== 'low') return true;
  return false;
};

export const DynamicIcon = memo(({ 
  name, 
  fallback: Fallback = DefaultIcon, 
  preload = false, 
  priority = 'normal',
  ...props 
}: DynamicIconProps) => {
  const IconComponent = useMemo(() => {
    if (!name) return null;
    
    // 智能缓存策略
    if (!iconCache.has(name)) {
      iconCache.set(name, createSelectiveIconLoader(name));
    }
    
    return iconCache.get(name);
  }, [name]);
  
  // 智能预加载
  if ((preload || shouldPreload(name, priority)) && !preloadCache.has(name)) {
    preloadCache.add(name);
    // 非阻塞预加载
    Promise.resolve().then(() => {
      import('lucide-react').catch(() => {
        // 忽略预加载错误
      });
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
});
DynamicIcon.displayName = 'DynamicIcon';

// 批量预加载 - 支持优先级
export const preloadIcons = (names: string[], priority: 'critical' | 'high' | 'normal' | 'low' = 'normal') => {
  const iconsToPreload = names.filter(name => shouldPreload(name, priority));
  
  iconsToPreload.forEach(name => {
    if (!preloadCache.has(name)) {
      preloadCache.add(name);
      // 触发预加载
      import('lucide-react').catch(() => {
        // 忽略预加载错误
      });
    }
  });
};

// 智能缓存清理 - 基于使用频率
export const optimizeIconCache = () => {
  // 清理非关键图标
  Array.from(iconCache.keys()).forEach(iconName => {
    if (!criticalIcons.includes(iconName) && !commonIcons.includes(iconName)) {
      // 可以添加使用时间戳来决定是否清理
      iconCache.delete(iconName);
    }
  });
  
  // 清理预加载缓存
  preloadCache.clear();
};

// 页面性能优化 - 预加载当前页面图标
export const preloadPageIcons = (pageIcons: string[]) => {
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(() => {
      preloadIcons(pageIcons, 'high');
    });
  } else {
    // 降级处理
    setTimeout(() => {
      preloadIcons(pageIcons, 'high');
    }, 100);
  }
};