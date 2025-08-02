'use client';

import { useState } from 'react';
import { Search, TextCursorInput, Code, Image, QrCode, FileText, Palette, Send, Clock, Calculator, BookOpen } from 'lucide-react';
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
    id: 'text-analyze',
    name: '文本分析工具',
    description: '分析文本的字符数、词数、行数等统计信息。',
    href: '/tools/text/analyze',
    icon: FileText,
    category: 'text',
    popular: false,
  },
  {
    id: 'text-compare',
    name: '文本比较工具',
    description: '比较两段文本的差异，支持忽略大小写和空白字符。',
    href: '/tools/text/compare',
    icon: FileText,
    category: 'text',
    popular: false,
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
    id: 'image-convert',
    name: '图片格式转换',
    description: '将图片转换为不同格式，支持JPEG、PNG、WebP等。',
    href: '/tools/image/convert',
    icon: Image,
    category: 'image',
    popular: false,
  },
  {
    id: 'image-watermark',
    name: '水印添加工具',
    description: '为图片添加文字水印，支持自定义位置、颜色、透明度等。',
    href: '/tools/image/watermark',
    icon: Image,
    category: 'image',
    popular: false,
  },
  {
    id: 'image-resize',
    name: '图片尺寸调整',
    description: '调整图片尺寸，支持保持比例、批量处理等功能。',
    href: '/tools/image/resize',
    icon: Image,
    category: 'image',
    popular: false,
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
    id: 'dev-json',
    name: 'JSON工具',
    description: '格式化、验证、压缩JSON数据，支持自定义缩进。',
    href: '/tools/dev/json',
    icon: Code,
    category: 'dev',
    popular: false,
  },
  {
    id: 'dev-color',
    name: '颜色选择器',
    description: '选择颜色并获取多种格式的颜色值，支持RGB、HSL、HEX等格式。',
    href: '/tools/dev/color',
    icon: Palette,
    category: 'dev',
    popular: true,
  },
  {
    id: 'dev-api',
    name: 'API测试工具',
    description: '测试API接口，发送HTTP请求并查看响应结果。',
    href: '/tools/dev/api',
    icon: Send,
    category: 'dev',
    popular: true,
  },
  {
    id: 'dev-timestamp',
    name: '时间戳转换',
    description: '时间戳与日期时间相互转换，支持多种格式。',
    href: '/tools/dev/timestamp',
    icon: Clock,
    category: 'dev',
    popular: false,
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
  {
    id: 'utility-password',
    name: '密码生成器',
    description: '生成安全、随机的密码，支持自定义长度和字符类型。',
    href: '/tools/utility/password',
    icon: Palette,
    category: 'utility',
    popular: false,
  },
  {
    id: 'learn-calculator',
    name: '数学公式计算器',
    description: '支持复杂数学计算、科学计算、三角函数等。',
    href: '/tools/learn/calculator',
    icon: Calculator,
    category: 'learn',
    popular: true,
  },
  {
    id: 'learn-cheatsheet',
    name: '速查表工具',
    description: '提供CSS、正则表达式、常用命令等速查功能。',
    href: '/tools/learn/cheatsheet',
    icon: BookOpen,
    category: 'learn',
    popular: false,
  },
];

const categories = [
  { id: 'all', name: '全部' },
  { id: 'text', name: '文本工具' },
  { id: 'image', name: '图片工具' },
  { id: 'dev', name: '开发工具' },
  { id: 'utility', name: '实用工具' },
  { id: 'learn', name: '学习工具' },
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
