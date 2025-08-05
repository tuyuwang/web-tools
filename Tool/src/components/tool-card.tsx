'use client';

import Link from 'next/link';
import { useLanguage } from '@/components/language-provider';
import { DynamicIcon } from '@/components/dynamic-icon';
import { Clock, Star, Zap, User, Users, GraduationCap } from 'lucide-react';

interface ToolCardProps {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: string; // 改为字符串类型
  popular?: boolean;
  new?: boolean;
  tags?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime?: string;
}

export function ToolCard({ 
  id, 
  name, 
  description, 
  href, 
  icon, 
  popular, 
  new: isNew, 
  tags, 
  difficulty, 
  estimatedTime 
}: ToolCardProps) {
  const { t } = useLanguage();
  
  // 获取翻译后的工具名称和描述
  const translatedName = t.toolNames[id as keyof typeof t.toolNames] || name;
  const translatedDescription = t.toolDescriptions[id as keyof typeof t.toolDescriptions] || description;

  // 获取难度等级的显示信息
  const getDifficultyInfo = (level?: string) => {
    switch (level) {
      case 'beginner':
        return { 
          icon: User, 
          text: '初级', 
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900/20'
        };
      case 'intermediate':
        return { 
          icon: Users, 
          text: '中级', 
          color: 'text-yellow-600 dark:text-yellow-400',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
        };
      case 'advanced':
        return { 
          icon: GraduationCap, 
          text: '高级', 
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-50 dark:bg-red-900/20'
        };
      default:
        return null;
    }
  };

  const difficultyInfo = getDifficultyInfo(difficulty);

  return (
    <Link
      href={href}
      className="block p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl active:shadow-2xl transition-all duration-300 group border border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-700 transform hover:-translate-y-2 active:translate-y-0 hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden"
    >
      {/* 背景渐变效果 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* 标签区域 */}
      <div className="absolute top-3 right-3 flex flex-col gap-1 z-10">
        {isNew && (
          <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-1 rounded-full shadow-sm font-medium flex items-center gap-1">
            <Zap className="h-3 w-3" />
            新工具
          </span>
        )}
        {popular && (
          <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full shadow-sm font-medium flex items-center gap-1">
            <Star className="h-3 w-3" />
            热门
          </span>
        )}
      </div>

      {/* 主要内容 */}
      <div className="relative z-10">
        <div className="flex items-start sm:items-center mb-3 sm:mb-4">
          <div className="flex-shrink-0">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg group-hover:bg-primary-200 dark:group-hover:bg-primary-800/50 transition-colors duration-300">
              <DynamicIcon 
                name={icon}
                className="h-6 w-6 sm:h-7 sm:w-7 text-primary-600 dark:text-primary-400 group-hover:scale-110 group-active:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
          <div className="ml-3 sm:ml-4 min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors duration-300 line-clamp-2 mb-1">
              {translatedName}
            </h2>
            
            {/* 元数据行 */}
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              {difficultyInfo && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${difficultyInfo.bgColor}`}>
                  <difficultyInfo.icon className={`h-3 w-3 ${difficultyInfo.color}`} />
                  <span className={difficultyInfo.color}>{difficultyInfo.text}</span>
                </div>
              )}
              {estimatedTime && (
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <Clock className="h-3 w-3" />
                  <span>{estimatedTime}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed line-clamp-3 mb-3">
          {translatedDescription}
        </p>

        {/* 标签 */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-md">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* 悬停效果指示器 */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-xl" />
      </div>
    </Link>
  );
}
