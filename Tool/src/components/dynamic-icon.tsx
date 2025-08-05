'use client';

import { lazy, Suspense } from 'react';
import { LucideProps } from 'lucide-react';

// 动态导入图标
const iconComponents: Record<string, React.LazyExoticComponent<React.ComponentType<LucideProps>>> = {
  TextCursorInput: lazy(() => import('lucide-react').then(mod => ({ default: mod.TextCursorInput }))),
  Code: lazy(() => import('lucide-react').then(mod => ({ default: mod.Code }))),
  Image: lazy(() => import('lucide-react').then(mod => ({ default: mod.Image }))),
  QrCode: lazy(() => import('lucide-react').then(mod => ({ default: mod.QrCode }))),
  FileText: lazy(() => import('lucide-react').then(mod => ({ default: mod.FileText }))),
  Palette: lazy(() => import('lucide-react').then(mod => ({ default: mod.Palette }))),
  Send: lazy(() => import('lucide-react').then(mod => ({ default: mod.Send }))),
  Clock: lazy(() => import('lucide-react').then(mod => ({ default: mod.Clock }))),
  Calculator: lazy(() => import('lucide-react').then(mod => ({ default: mod.Calculator }))),
  BookOpen: lazy(() => import('lucide-react').then(mod => ({ default: mod.BookOpen }))),
  Shield: lazy(() => import('lucide-react').then(mod => ({ default: mod.Shield }))),
  Home: lazy(() => import('lucide-react').then(mod => ({ default: mod.Home }))),
  Wrench: lazy(() => import('lucide-react').then(mod => ({ default: mod.Wrench }))),
  Menu: lazy(() => import('lucide-react').then(mod => ({ default: mod.Menu }))),
  X: lazy(() => import('lucide-react').then(mod => ({ default: mod.X }))),
  Search: lazy(() => import('lucide-react').then(mod => ({ default: mod.Search }))),
  Filter: lazy(() => import('lucide-react').then(mod => ({ default: mod.Filter }))),
  Copy: lazy(() => import('lucide-react').then(mod => ({ default: mod.Copy }))),
  RotateCcw: lazy(() => import('lucide-react').then(mod => ({ default: mod.RotateCcw }))),
  Check: lazy(() => import('lucide-react').then(mod => ({ default: mod.Check }))),
};

interface DynamicIconProps extends Omit<LucideProps, 'ref'> {
  name: string;
  fallback?: React.ComponentType<LucideProps>;
}

// 默认的占位符图标
const DefaultIcon = ({ className, size, ...props }: LucideProps) => (
  <div 
    className={`inline-block bg-gray-200 dark:bg-gray-600 rounded ${className}`}
    style={{ 
      width: size || '1em', 
      height: size || '1em',
      minWidth: size || '1em',
      minHeight: size || '1em'
    }}
    {...(props as any)}
  />
);

export function DynamicIcon({ name, fallback: Fallback = DefaultIcon, ...props }: DynamicIconProps) {
  const IconComponent = iconComponents[name];
  
  if (!IconComponent) {
    return <Fallback {...props} />;
  }
  
  return (
    <Suspense fallback={<Fallback {...props} />}>
      <IconComponent {...props} />
    </Suspense>
  );
}