'use client';

import { useState } from 'react';
import { Filter, Search, Calendar, User, Tag, X } from 'lucide-react';

interface FeedbackFiltersProps {
  filter: string;
  search: string;
  sortBy: 'timestamp' | 'type' | 'status';
  sortOrder: 'asc' | 'desc';
  onFilterChange: (filter: string) => void;
  onSearchChange: (search: string) => void;
  onSortChange: (sortBy: 'timestamp' | 'type' | 'status') => void;
  onSortOrderChange: (sortOrder: 'asc' | 'desc') => void;
  onClearFilters: () => void;
}

export default function FeedbackFilters({
  filter,
  search,
  sortBy,
  sortOrder,
  onFilterChange,
  onSearchChange,
  onSortChange,
  onSortOrderChange,
  onClearFilters
}: FeedbackFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const hasActiveFilters = filter !== 'all' || search || sortBy !== 'timestamp' || sortOrder !== 'desc';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* 基本过滤 */}
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={filter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">所有类型</option>
            <option value="bug">问题报告</option>
            <option value="feature">功能请求</option>
            <option value="improvement">改进建议</option>
            <option value="other">其他</option>
          </select>
        </div>
        
        {/* 搜索 */}
        <div className="flex items-center gap-2 flex-1">
          <Search className="w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="搜索反馈标题或内容..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* 高级选项按钮 */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-colors"
        >
          <Filter className="w-4 h-4" />
          高级
        </button>

        {/* 清除过滤器 */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
            清除
          </button>
        )}
      </div>

      {/* 高级过滤选项 */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 排序字段 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                排序字段
              </label>
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="timestamp">时间</option>
                <option value="type">类型</option>
                <option value="status">状态</option>
              </select>
            </div>

            {/* 排序顺序 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                排序顺序
              </label>
              <select
                value={sortOrder}
                onChange={(e) => onSortOrderChange(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="desc">降序（最新/最优先）</option>
                <option value="asc">升序（最早/最低优先级）</option>
              </select>
            </div>

            {/* 快速过滤器 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                快速过滤
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => onFilterChange('bug')}
                  className="px-3 py-1 text-xs bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full transition-colors"
                >
                  问题
                </button>
                <button
                  onClick={() => onFilterChange('feature')}
                  className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full transition-colors"
                >
                  功能
                </button>
                <button
                  onClick={() => onFilterChange('improvement')}
                  className="px-3 py-1 text-xs bg-green-100 hover:bg-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full transition-colors"
                >
                  改进
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 当前过滤器显示 */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>当前过滤器：</span>
            {filter !== 'all' && (
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                类型: {filter === 'bug' ? '问题' : filter === 'feature' ? '功能' : filter === 'improvement' ? '改进' : '其他'}
              </span>
            )}
            {search && (
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-xs">
                搜索: "{search}"
              </span>
            )}
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs">
              排序: {sortBy === 'timestamp' ? '时间' : sortBy === 'type' ? '类型' : '状态'} ({sortOrder === 'desc' ? '降序' : '升序'})
            </span>
          </div>
        </div>
      )}
    </div>
  );
} 