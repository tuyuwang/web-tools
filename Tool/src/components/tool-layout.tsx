'use client';

import { ReactNode, Suspense, ErrorBoundary as ReactErrorBoundary } from 'react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { PWAInstaller } from '@/components/pwa-installer';
import { Analytics } from '@/components/analytics';
import { Toaster } from 'react-hot-toast';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ToolLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  showBreadcrumb?: boolean;
}

// 错误边界组件
function ErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ReactErrorBoundary
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="text-center p-8">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              工具加载出错
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              抱歉，工具加载时遇到了问题。请刷新页面重试。
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              刷新页面
            </button>
          </div>
        </div>
      }
      onError={(error) => {
        console.error('Tool Error:', error);
        // 这里可以添加错误上报逻辑
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}

// 加载状态组件
function LoadingFallback() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">工具加载中...</p>
      </div>
    </div>
  );
}

// 面包屑组件
function Breadcrumb({ title }: { title?: string }) {
  if (!title) return null;
  
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
      <a href="/" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
        首页
      </a>
      <span>/</span>
      <a href="/tools" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
        工具
      </a>
      <span>/</span>
      <span className="text-gray-900 dark:text-white font-medium">{title}</span>
    </nav>
  );
}

export function ToolLayout({ 
  children, 
  title, 
  description,
  showBreadcrumb = false 
}: ToolLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* 导航栏 */}
      <Navigation />
      
      {/* 主要内容区域 */}
      <main className="flex-1 container mx-auto px-4 py-6 sm:py-8">
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback />}>
            {/* 面包屑导航 */}
            {showBreadcrumb && <Breadcrumb title={title} />}
            
            {/* 页面标题和描述 */}
            {(title || description) && (
              <div className="text-center mb-8">
                {title && (
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">
                    {description}
                  </p>
                )}
              </div>
            )}
            
            {/* 工具内容 */}
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </Suspense>
        </ErrorBoundary>
      </main>
      
      {/* 页脚 */}
      <Footer />
      
      {/* PWA 安装器 */}
      <PWAInstaller />
      
      {/* 分析工具 */}
      <Analytics />
      
      {/* 消息提示 */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--toast-bg)',
            color: 'var(--toast-color)',
            border: '1px solid var(--toast-border)',
          },
        }}
      />
    </div>
  );
} 