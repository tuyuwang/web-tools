'use client';

import { ToolCard } from '@/components/tool-card';
import { ToolLayout } from '@/components/tool-layout';
import { tools } from '@/lib/tools-data';
import { useLanguage } from '@/components/language-provider';

export default function ProductivityToolsPage() {
  const { t } = useLanguage();
  
  const productivityTools = tools.filter(tool => tool.category === 'productivity');

  return (
    <ToolLayout>
      <div className="space-y-6 sm:space-y-8">
        {/* 页面标题 */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            生产力工具
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            提高工作效率，优化时间管理，建立良好习惯的实用工具
          </p>
        </div>

        {/* 工具网格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {productivityTools.map((tool) => (
            <div key={tool.id} className="relative">
              {tool.popular && (
                <div className="absolute top-2 right-2 z-10">
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full shadow-sm">
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

        {/* 生产力提示 */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
            🚀 生产力提升技巧
          </h3>
          <ul className="text-green-800 dark:text-green-200 space-y-1 text-sm">
            <li>• <strong>番茄工作法：</strong>25分钟专注工作，5分钟休息，提高专注力</li>
            <li>• <strong>习惯养成：</strong>从小习惯开始，每天坚持，逐步建立良好习惯</li>
            <li>• <strong>任务管理：</strong>使用优先级排序，先处理重要紧急的任务</li>
            <li>• <strong>时间记录：</strong>了解时间分配，识别时间浪费点并优化</li>
            <li>• <strong>定期回顾：</strong>每周回顾目标完成情况，调整工作策略</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}