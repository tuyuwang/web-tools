'use client';

import Link from 'next/link';
import { useLanguage } from '@/components/language-provider';
import { DynamicIcon } from '@/components/dynamic-icon';

interface ToolCardProps {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: string; // 改为字符串类型
}

export function ToolCard({ id, name, description, href, icon }: ToolCardProps) {
  const { t } = useLanguage();
  
  // 获取翻译后的工具名称和描述
  const translatedName = t.toolNames[id as keyof typeof t.toolNames] || name;
  const translatedDescription = t.toolDescriptions[id as keyof typeof t.toolDescriptions] || description;

  return (
    <Link
      href={href}
      className="block p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg active:shadow-xl transition-all duration-300 group border border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-700 transform hover:-translate-y-1 active:translate-y-0"
    >
      <div className="flex items-start sm:items-center mb-3 sm:mb-4">
        <div className="flex-shrink-0">
          <DynamicIcon 
            name={icon}
            className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600 dark:text-primary-400 group-hover:scale-110 group-active:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="ml-3 sm:ml-4 min-w-0 flex-1">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors duration-300 line-clamp-2">
            {translatedName}
          </h2>
        </div>
      </div>
      <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed line-clamp-3">
        {translatedDescription}
      </p>
    </Link>
  );
}
