'use client';

import { ToolCard } from '@/components/tool-card';
import { ToolLayout } from '@/components/tool-layout';
import { tools } from '@/lib/tools-data';
import { useLanguage } from '@/components/language-provider';

export default function FinanceToolsPage() {
  const { t } = useLanguage();
  
  const financeTools = tools.filter(tool => tool.category === 'finance');

  return (
    <ToolLayout>
      <div className="space-y-6 sm:space-y-8">
        {/* 页面标题 */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            金融理财工具
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            专业的金融计算和理财规划工具，帮助您做出明智的财务决策
          </p>
        </div>

        {/* 工具网格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {financeTools.map((tool) => (
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

        {/* 使用提示 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            💡 使用提示
          </h3>
          <ul className="text-blue-800 dark:text-blue-200 space-y-1 text-sm">
            <li>• 所有计算结果仅供参考，实际投资需谨慎</li>
            <li>• 建议结合专业理财顾问意见制定投资计划</li>
            <li>• 定期更新计算参数以获得更准确的结果</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}