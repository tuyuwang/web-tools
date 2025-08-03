'use client';

import { useState } from 'react';
import { Search, Filter, Calendar, User, Tag, X } from 'lucide-react';

interface Feedback {
  id: string;
  type: 'bug' | 'feature' | 'improvement' | 'other';
  title: string;
  description: string;
  email?: string;
  tool?: string;
  timestamp: string;
  status: 'new' | 'reviewed' | 'in-progress' | 'resolved';
}

interface FeedbackAdvancedSearchProps {
  feedbacks: Feedback[];
  onSearchResults: (results: Feedback[]) => void;
}

export default function FeedbackAdvancedSearch({
  feedbacks,
  onSearchResults
}: FeedbackAdvancedSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState({
    keyword: '',
    type: '',
    status: '',
    email: '',
    tool: ''
  });

  const handleSearch = () => {
    const results = feedbacks.filter(feedback => {
      if (searchCriteria.keyword) {
        const keyword = searchCriteria.keyword.toLowerCase();
        const matchesKeyword = 
          feedback.title.toLowerCase().includes(keyword) ||
          feedback.description.toLowerCase().includes(keyword);
        if (!matchesKeyword) return false;
      }

      if (searchCriteria.type && feedback.type !== searchCriteria.type) {
        return false;
      }

      if (searchCriteria.status && feedback.status !== searchCriteria.status) {
        return false;
      }

      if (searchCriteria.email && feedback.email) {
        if (!feedback.email.toLowerCase().includes(searchCriteria.email.toLowerCase())) {
          return false;
        }
      }

      if (searchCriteria.tool && feedback.tool) {
        if (!feedback.tool.toLowerCase().includes(searchCriteria.tool.toLowerCase())) {
          return false;
        }
      }

      return true;
    });

    onSearchResults(results);
  };

  const handleClear = () => {
    setSearchCriteria({
      keyword: '',
      type: '',
      status: '',
      email: '',
      tool: ''
    });
    onSearchResults(feedbacks);
  };

  const hasActiveCriteria = Object.values(searchCriteria).some(value => value !== '');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">高级搜索</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
          >
            <Filter className="w-4 h-4" />
            {isOpen ? '收起' : '展开'}
          </button>
          {hasActiveCriteria && (
            <button
              onClick={handleClear}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-md"
            >
              <X className="w-4 h-4" />
              清除
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Search className="w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="搜索关键词（标题、描述）..."
          value={searchCriteria.keyword}
          onChange={(e) => setSearchCriteria({ ...searchCriteria, keyword: e.target.value })}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
        >
          搜索
        </button>
      </div>

      {isOpen && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              类型
            </label>
            <select
              value={searchCriteria.type}
              onChange={(e) => setSearchCriteria({ ...searchCriteria, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">所有类型</option>
              <option value="bug">问题报告</option>
              <option value="feature">功能请求</option>
              <option value="improvement">改进建议</option>
              <option value="other">其他</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              状态
            </label>
            <select
              value={searchCriteria.status}
              onChange={(e) => setSearchCriteria({ ...searchCriteria, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">所有状态</option>
              <option value="new">新反馈</option>
              <option value="reviewed">已查看</option>
              <option value="in-progress">处理中</option>
              <option value="resolved">已解决</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              邮箱
            </label>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <input
                type="email"
                placeholder="搜索邮箱..."
                value={searchCriteria.email}
                onChange={(e) => setSearchCriteria({ ...searchCriteria, email: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>
      )}

      {hasActiveCriteria && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>当前搜索条件：</span>
            {searchCriteria.keyword && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                关键词: "{searchCriteria.keyword}"
              </span>
            )}
            {searchCriteria.type && (
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                类型: {searchCriteria.type}
              </span>
            )}
            {searchCriteria.status && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                状态: {searchCriteria.status}
              </span>
            )}
            {searchCriteria.email && (
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                邮箱: "{searchCriteria.email}"
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 