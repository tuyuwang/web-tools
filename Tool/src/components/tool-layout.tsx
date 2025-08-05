'use client';

import { FeedbackButton } from './feedback-button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface ToolLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  showBackButton?: boolean;
}

export function ToolLayout({ children, title, description, showBackButton = true }: ToolLayoutProps) {
  const pathname = usePathname();
  const isToolPage = pathname?.startsWith('/tools/') && pathname !== '/tools';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* 导航栏 */}
        {isToolPage && showBackButton && (
          <div className="mb-6 sm:mb-8">
            <Link
              href="/tools"
              className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm sm:text-base">返回工具列表</span>
            </Link>
          </div>
        )}

        {title && (
          <div className="text-center mb-8 sm:mb-12">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                {title}
              </h1>
              {description && (
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed px-4">
                  {description}
                </p>
              )}
            </div>
          </div>
        )}

        {/* 主要内容区域 */}
        <div className="max-w-7xl mx-auto">
          {children}
        </div>

        {/* 反馈按钮 */}
        <FeedbackButton />
      </div>
    </div>
  );
}

export default ToolLayout; 