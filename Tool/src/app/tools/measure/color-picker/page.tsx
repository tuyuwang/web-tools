'use client';

import { ToolLayout } from '@/components/tool-layout';

export default function MeasureColorPickerPage() {
  return (
    <ToolLayout title="屏幕取色器" description="从屏幕任意位置获取颜色值。">
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">功能开发中</h2>
          <p className="text-gray-600 dark:text-gray-400">该工具正在建设中，敬请期待。</p>
        </div>
      </div>
    </ToolLayout>
  );
}