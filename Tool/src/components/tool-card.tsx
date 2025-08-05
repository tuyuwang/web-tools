'use client';

import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';
import { useLanguage } from '@/components/language-provider';
import { DynamicIcon } from '@/components/dynamic-icon';

interface ToolCardProps {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: string;
  popular?: boolean;
}

export function ToolCard({ id, name, description, href, icon, popular }: ToolCardProps) {
  const { t } = useLanguage();
  
  // 获取翻译后的工具名称和描述
  const translatedName = t.toolNames[id as keyof typeof t.toolNames] || name;
  const translatedDescription = t.toolDescriptions[id as keyof typeof t.toolDescriptions] || description;

  return (
    <Link
      href={href}
      className="group relative block overflow-hidden"
    >
      <div className="relative p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-600 transform hover:-translate-y-2 active:translate-y-0">
        {/* 热门标签 */}
        {popular && (
          <div className="absolute top-4 right-4 z-10">
            <div className="flex items-center bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full shadow-sm">
              <Star className="w-3 h-3 mr-1 fill-current" />
              <span className="font-medium">热门</span>
            </div>
          </div>
        )}

        {/* 图标和标题 */}
        <div className="flex items-start mb-4">
          <div className="flex-shrink-0 mr-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <DynamicIcon 
                name={icon}
                className="h-6 w-6 text-blue-600 dark:text-blue-400"
              />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 line-clamp-2 mb-2">
              {translatedName}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
              {translatedDescription}
            </p>
          </div>
        </div>

        {/* 底部操作区域 */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            立即使用
          </span>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-300" />
        </div>

        {/* 悬浮效果背景 */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-900/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none" />
      </div>
    </Link>
  );
}
