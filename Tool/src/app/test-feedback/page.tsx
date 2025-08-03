'use client';

import { FeedbackButton } from '@/components/feedback-button';
import { getToolByPath } from '@/lib/tools-data';
import { useState, useEffect } from 'react';

export default function TestFeedbackPage() {
  const [currentPath, setCurrentPath] = useState<string>('');
  const [detectedTool, setDetectedTool] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      setCurrentPath(path);
      const tool = getToolByPath(path);
      setDetectedTool(tool);
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        反馈功能测试页面
      </h1>
      
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            路径检测测试
          </h2>
          <div className="space-y-2 text-gray-600 dark:text-gray-400">
            <p><strong>当前路径:</strong> {currentPath}</p>
            <p><strong>检测到的工具:</strong> {detectedTool ? `${detectedTool.name} (${detectedTool.id})` : '未检测到'}</p>
            <p><strong>工具href:</strong> {detectedTool?.href || 'N/A'}</p>
            <p><strong>工具名称:</strong> {detectedTool?.name || 'N/A'}</p>
            <p><strong>工具ID:</strong> {detectedTool?.id || 'N/A'}</p>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
            修复说明
          </h3>
          <ul className="space-y-1 text-green-800 dark:text-green-200">
            <li>✓ 反馈提交时tool字段现在存储工具名称而不是工具ID</li>
            <li>✓ 工具选择下拉框使用工具名称作为值</li>
            <li>✓ 自动检测当前工具时使用工具名称</li>
            <li>✓ 表单重置时保持工具名称选择</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            测试说明
          </h2>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400">
            <li>• 点击右下角的反馈按钮打开反馈弹窗</li>
            <li>• 在工具列表页面，可以选择相关工具</li>
            <li>• 在工具详情页面，会自动选择当前工具</li>
            <li>• 填写反馈信息并提交</li>
            <li>• 检查提交的数据中tool字段是否为工具名称</li>
          </ul>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            功能特性
          </h3>
          <ul className="space-y-1 text-blue-800 dark:text-blue-200">
            <li>✓ 自动检测当前页面并选择工具</li>
            <li>✓ 支持手动选择工具</li>
            <li>✓ 显示当前页面工具信息</li>
            <li>✓ 完整的反馈表单</li>
            <li>✓ 响应式设计</li>
            <li>✓ 工具名称存储（而不是ID）</li>
          </ul>
        </div>
      </div>

      <FeedbackButton />
    </div>
  );
} 