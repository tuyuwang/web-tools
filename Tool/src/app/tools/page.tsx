'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { ToolCard } from '@/components/tool-card';
import { ToolLayout } from '@/components/tool-layout';
import { tools, categories } from '@/lib/tools-data';
import { useLanguage } from '@/components/language-provider';

export default function ToolsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
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

  return (
    <ToolLayout>
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t.tools.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t.tools.subtitle}
        </p>
      </div>

      {/* 搜索和筛选 */}
      <div className="space-y-4">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder={t.tools.search.placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>
        
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {getCategoryName(category.id)}
            </button>
          ))}
        </div>
      </div>

      {/* 工具网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool) => (
          <div key={tool.id} className="relative">
            {tool.popular && (
              <div className="absolute top-2 right-2 z-10">
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
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

      {filteredTools.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t.tools.noResults.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {t.tools.noResults.description}
          </p>
        </div>
      )}
    </ToolLayout>
  );
}
