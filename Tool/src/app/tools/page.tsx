'use client';

import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { ToolCard } from '@/components/tool-card';
import { ToolLayout } from '@/components/tool-layout';
import { tools, categories } from '@/lib/tools-data';
import { useLanguage } from '@/components/language-provider';

export default function ToolsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const { t } = useLanguage();

  const filteredTools = tools.filter((tool) => {
    // 获取翻译后的工具名称和描述
    const translatedName = t.toolNames[tool.id as keyof typeof t.toolNames] || tool.name;
    const translatedDescription = t.toolDescriptions[tool.id as keyof typeof t.toolDescriptions] || tool.description;
    
    const matchesSearch = translatedName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         translatedDescription.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // 获取分类名称的翻译
  const getCategoryName = (categoryId: string) => {
    const categoryMap: Record<string, string> = {
      all: t.tools.categories.all,
      ai: t.tools.categories.ai,
      pdf: t.tools.categories.pdf || 'PDF工具',
      text: t.tools.categories.text,
      image: t.tools.categories.image,
      dev: t.tools.categories.dev,
      utility: t.tools.categories.utility,
      learn: t.tools.categories.learn,
      health: t.tools.categories.health,
      media: t.tools.categories.media,
      office: t.tools.categories.office,
      security: t.tools.categories.security,
    };
    return categoryMap[categoryId] || categoryId;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setShowFilters(false);
  };

  return (
    <ToolLayout>
      <div className="space-y-6 sm:space-y-8">
        {/* 页面标题 */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t.tools.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            {t.tools.subtitle}
          </p>
        </div>

        {/* 搜索和筛选 */}
        <div className="space-y-4">
          {/* 搜索栏 */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder={t.tools.search.placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white text-base"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          
          {/* 移动端筛选按钮 */}
          <div className="flex items-center justify-between sm:hidden">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300"
            >
              <Filter className="h-4 w-4" />
              <span>{t.tools.search.filter || '筛选'}</span>
              {selectedCategory !== 'all' && (
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  1
                </span>
              )}
            </button>
            
            {(searchTerm || selectedCategory !== 'all') && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
{t.tools.search.clearFilter || '清除筛选'}
              </button>
            )}
          </div>
          
          {/* 分类筛选 - 桌面端始终显示，移动端可切换 */}
          <div className={`${showFilters ? 'block' : 'hidden'} sm:block`}>
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setShowFilters(false);
                  }}
                  className={`px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-colors touch-manipulation ${
                    selectedCategory === category.id
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {getCategoryName(category.id)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 结果统计 */}
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
{t.tools.search.found || '找到'} {filteredTools.length} {t.tools.search.toolsCount || '个工具'}
          {selectedCategory !== 'all' && ` · ${getCategoryName(selectedCategory)}`}
        </div>

        {/* 工具网格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredTools.map((tool) => (
            <div key={tool.id} className="relative">
              {tool.popular && (
                <div className="absolute top-2 right-2 z-10">
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full shadow-sm">
                    {t.tools.popular}
                  </span>
                </div>
              )}
              <ToolCard
                id={tool.id}
                name={tool.name}
                description={tool.description}
                href={tool.href}
                icon={tool.icon}
              />
            </div>
          ))}
        </div>

        {/* 无结果状态 */}
        {filteredTools.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl sm:text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t.tools.noResults.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t.tools.noResults.description}
            </p>
            {(searchTerm || selectedCategory !== 'all') && (
              <button
                onClick={clearFilters}
                className="btn btn-primary"
              >
{t.tools.search.clearAllFilters || '清除所有筛选'}
              </button>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
