'use client';

import { useState } from 'react';
import { Search, TextCursorInput, Code, Image, QrCode, FileText, Palette } from 'lucide-react';
import { ToolCard } from '@/components/tool-card';

interface Tool {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: React.ElementType;
  category: string;
  popular?: boolean;
}

const tools: Tool[] = [
  {
    id: 'text-case',
    name: '文本格式转换',
    description: '快速转换文本大小写、驼峰命名等格式，支持9种常用格式。',
    href: '/tools/text/case',
    icon: TextCursorInput,
    category: 'text',
    popular: true,
  },
  {
    id: 'text-encode',
    name: '编码解码工具',
    description: 'Base64、URL、HTML等编码解码工具，支持多种格式转换。',
    href: '/tools/text/encode',
    icon: Code,
    category: 'text',
    popular: false,
  },
  {
    id: 'text-regex',
    name: '正则表达式测试',
    description: '在线测试和调试正则表达式，实时查看匹配结果。',
    href: '/tools/text/regex',
    icon: FileText,
    category: 'text',
    popular: true,
  },
  {
    id: 'image-compress',
    name: '图片压缩工具',
    description: '在线压缩图片，优化图片大小，支持质量调节。',
    href: '/tools/image/compress',
    icon: Image,
    category: 'image',
    popular: true,
  },
  {
    id: 'dev-format',
    name: '代码格式化',
    description: '格式化JavaScript、JSON、CSS等代码，使其更易读。',
    href: '/tools/dev/format',
    icon: Code,
    category: 'dev',
    popular: true,
  },
  {
    id: 'utility-qr',
    name: '二维码生成器',
    description: '生成自定义二维码，支持文本和URL，可下载使用。',
    href: '/tools/utility/qr',
    icon: QrCode,
    category: 'utility',
    popular: true,
  },
];

const categories = [
  { id: 'all', name: '全部' },
  { id: 'text', name: '文本工具' },
  { id: 'image', name: '图片工具' },
  { id: 'dev', name: '开发工具' },
  { id: 'utility', name: '实用工具' },
];

export default function ToolsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredTools = tools.filter((tool) => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          工具集合
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          发现并使用各种实用工具
        </p>
      </div>

      {/* 搜索和筛选 */}
      <div className="space-y-4">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="搜索工具..."
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
              {category.name}
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
                  热门
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
            未找到相关工具
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            尝试使用不同的关键词或选择其他分类
          </p>
        </div>
      )}
    </div>
  );
}
