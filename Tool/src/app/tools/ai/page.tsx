import { Metadata } from 'next';
import Link from 'next/link';
import { Brain, Sparkles, MessageSquare, Hash, TrendingUp } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AI工具 - 智能与自动化工具集合',
  description: '提供文本生成、智能分析、语言处理等AI驱动的实用工具',
  keywords: 'AI工具,文本生成,智能分析,语言检测,关键词提取,情感分析',
};

const aiTools = [
  {
    id: 'text-generator',
    name: '文本生成器',
    description: '生成Lorem ipsum、假数据、随机文本等',
    icon: 'MessageSquare',
    href: '/tools/ai/text-generator',
    color: 'bg-blue-500',
  },
  {
    id: 'text-summary',
    name: '智能摘要',
    description: '提取文本关键信息，生成简洁摘要',
    icon: 'Sparkles',
    href: '/tools/ai/text-summary',
    color: 'bg-purple-500',
  },
  {
    id: 'language-detect',
    name: '语言检测',
    description: '自动识别文本的语言类型',
    icon: 'Brain',
    href: '/tools/ai/language-detect',
    color: 'bg-green-500',
  },
  {
    id: 'keyword-extract',
    name: '关键词提取',
    description: '从文本中智能提取关键词和短语',
    icon: 'Hash',
    href: '/tools/ai/keyword-extract',
    color: 'bg-orange-500',
  },
  {
    id: 'sentiment-analysis',
    name: '情感分析',
    description: '分析文本的情感倾向和语调',
    icon: 'TrendingUp',
    href: '/tools/ai/sentiment-analysis',
    color: 'bg-red-500',
  },
];

const iconMap = {
  MessageSquare,
  Sparkles,
  Brain,
  Hash,
  TrendingUp,
};

export default function AIToolsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <Brain className="h-12 w-12 text-blue-600 mr-3" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            AI工具
          </h1>
        </div>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          利用人工智能技术，提供智能文本处理、语言分析、内容生成等先进工具
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {aiTools.map((tool) => {
          const IconComponent = iconMap[tool.icon as keyof typeof iconMap];
          
          return (
            <Link
              key={tool.id}
              href={tool.href}
              className="group block p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
            >
              <div className="flex items-center mb-4">
                <div className={`p-3 rounded-lg ${tool.color} bg-opacity-10 group-hover:bg-opacity-20 transition-colors`}>
                  <IconComponent className={`h-6 w-6 ${tool.color.replace('bg-', 'text-')}`} />
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {tool.name}
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                {tool.description}
              </p>
            </Link>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            即将推出更多AI工具
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            我们正在开发更多基于AI的实用工具，包括图像识别、语音处理、智能翻译等功能
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm">
              图像识别
            </span>
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm">
              智能翻译
            </span>
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm">
              语音处理
            </span>
            <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded-full text-sm">
              智能推荐
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}