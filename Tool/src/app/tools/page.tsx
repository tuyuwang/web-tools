'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, X, SortAsc, SortDesc, Sparkles, Star } from 'lucide-react';
import { ToolCard } from '@/components/tool-card';
import { ToolLayout } from '@/components/tool-layout';
import { tools, categories } from '@/lib/tools-data';
import { useLanguage } from '@/components/language-provider';

type SortOption = 'name' | 'popular' | 'new' | 'difficulty';
type SortOrder = 'asc' | 'desc';

export default function ToolsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showOnlyNew, setShowOnlyNew] = useState(false);
  const [showOnlyPopular, setShowOnlyPopular] = useState(false);
  const { t } = useLanguage();

  const filteredAndSortedTools = useMemo(() => {
    let filtered = tools.filter((tool) => {
      // 获取翻译后的工具名称和描述
      const translatedName = t.toolNames[tool.id as keyof typeof t.toolNames] || tool.name;
      const translatedDescription = t.toolDescriptions[tool.id as keyof typeof t.toolDescriptions] || tool.description;
      
      const matchesSearch = translatedName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           translatedDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (tool.tags && tool.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
      
      const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'all' || tool.difficulty === selectedDifficulty;
      const matchesNew = !showOnlyNew || tool.new;
      const matchesPopular = !showOnlyPopular || tool.popular;
      
      return matchesSearch && matchesCategory && matchesDifficulty && matchesNew && matchesPopular;
    });

    // 排序
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          const nameA = t.toolNames[a.id as keyof typeof t.toolNames] || a.name;
          const nameB = t.toolNames[b.id as keyof typeof t.toolNames] || b.name;
          comparison = nameA.localeCompare(nameB);
          break;
        case 'popular':
          comparison = (b.popular ? 1 : 0) - (a.popular ? 1 : 0);
          break;
        case 'new':
          comparison = (b.new ? 1 : 0) - (a.new ? 1 : 0);
          break;
        case 'difficulty':
          const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
          const diffA = difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 0;
          const diffB = difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 0;
          comparison = diffA - diffB;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [searchTerm, selectedCategory, selectedDifficulty, showOnlyNew, showOnlyPopular, sortBy, sortOrder, t]);

  // 获取分类名称的翻译
  const getCategoryName = (categoryId: string) => {
    const categoryMap: Record<string, string> = {
      all: t.tools.categories.all,
      ai: t.tools.categories.ai || 'AI工具',
      text: t.tools.categories.text,
      image: t.tools.categories.image,
      dev: t.tools.categories.dev,
      utility: t.tools.categories.utility,
      learn: t.tools.categories.learn,
      health: t.tools.categories.health,
      media: t.tools.categories.media,
      office: t.tools.categories.office,
      security: t.tools.categories.security,
      data: t.tools.categories.data || '数据分析',
    };
    return categoryMap[categoryId] || categoryId;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedDifficulty('all');
    setShowOnlyNew(false);
    setShowOnlyPopular(false);
    setShowFilters(false);
  };

  const toggleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(option);
      setSortOrder('desc');
    }
  };

  const activeFiltersCount = [
    selectedCategory !== 'all',
    selectedDifficulty !== 'all',
    showOnlyNew,
    showOnlyPopular
  ].filter(Boolean).length;

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
              <span>筛选</span>
              {activeFiltersCount > 0 && (
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            
            {(searchTerm || activeFiltersCount > 0) && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                清除筛选
              </button>
            )}
          </div>
          
          {/* 筛选和排序选项 - 桌面端始终显示，移动端可切换 */}
          <div className={`${showFilters ? 'block' : 'hidden'} sm:block space-y-4`}>
            {/* 分类筛选 */}
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

            {/* 附加筛选选项 */}
            <div className="flex flex-wrap justify-center gap-2">
              {/* 难度筛选 */}
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                <option value="all">所有难度</option>
                <option value="beginner">初级</option>
                <option value="intermediate">中级</option>
                <option value="advanced">高级</option>
              </select>

              {/* 特殊筛选 */}
              <button
                onClick={() => setShowOnlyNew(!showOnlyNew)}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showOnlyNew
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                <Sparkles className="h-4 w-4" />
                新工具
              </button>

              <button
                onClick={() => setShowOnlyPopular(!showOnlyPopular)}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showOnlyPopular
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                <Star className="h-4 w-4" />
                热门
              </button>
            </div>

            {/* 排序选项 */}
            <div className="flex flex-wrap justify-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400 self-center">排序:</span>
              {[
                { key: 'popular', label: '热门度' },
                { key: 'name', label: '名称' },
                { key: 'new', label: '最新' },
                { key: 'difficulty', label: '难度' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => toggleSort(key as SortOption)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    sortBy === key
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {label}
                  {sortBy === key && (
                    sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 结果统计 */}
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          找到 {filteredAndSortedTools.length} 个工具
          {selectedCategory !== 'all' && ` · ${getCategoryName(selectedCategory)}`}
          {selectedDifficulty !== 'all' && ` · ${selectedDifficulty === 'beginner' ? '初级' : selectedDifficulty === 'intermediate' ? '中级' : '高级'}`}
        </div>

        {/* 工具网格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredAndSortedTools.map((tool) => (
            <ToolCard
              key={tool.id}
              id={tool.id}
              name={tool.name}
              description={tool.description}
              href={tool.href}
              icon={tool.icon}
              popular={tool.popular}
              new={tool.new}
              tags={tool.tags}
              difficulty={tool.difficulty}
              estimatedTime={tool.estimatedTime}
            />
          ))}
        </div>

        {/* 无结果状态 */}
        {filteredAndSortedTools.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl sm:text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t.tools.noResults.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t.tools.noResults.description}
            </p>
            {(searchTerm || activeFiltersCount > 0) && (
              <button
                onClick={clearFilters}
                className="btn btn-primary"
              >
                清除所有筛选
              </button>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
