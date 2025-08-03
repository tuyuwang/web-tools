'use client';

import Link from 'next/link';
import { ElementType } from 'react';
import { useLanguage } from '@/components/language-provider';

interface ToolCardProps {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: ElementType;
}

export function ToolCard({ id, name, description, href, icon: Icon }: ToolCardProps) {
  const { t } = useLanguage();
  
  // 获取翻译后的工具名称和描述
  const translatedName = t.toolNames[id as keyof typeof t.toolNames] || name;
  const translatedDescription = t.toolDescriptions[id as keyof typeof t.toolDescriptions] || description;

  return (
    <Link
      href={href}
      className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 group border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center mb-4">
        <Icon className="h-8 w-8 text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform duration-300" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white ml-4 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors duration-300">
          {translatedName}
        </h2>
      </div>
      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
        {translatedDescription}
      </p>
    </Link>
  );
}
