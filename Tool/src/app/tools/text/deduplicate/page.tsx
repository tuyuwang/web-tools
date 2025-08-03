'use client';

import { ToolLayout } from '@/components/tool-layout';
import { useState } from 'react';
import { FileText, Copy, RotateCcw } from 'lucide-react';

export default function TextDeduplicatePage() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');

  const deduplicateText = () => {
    if (!inputText.trim()) {
      setOutputText('');
      return;
    }

    const lines = inputText.split('\n').filter(line => line.trim() !== '');
    const uniqueLines = Array.from(new Set(lines));
    setOutputText(uniqueLines.join('\n'));
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(outputText);
      alert('文本已复制到剪贴板');
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const clearAll = () => {
    setInputText('');
    setOutputText('');
  };

  return (
    <ToolLayout>
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          文本去重工具
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          去除重复的文本行
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              输入文本
            </h2>
            
            <div className="space-y-4">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="在此输入要去重的文本，每行一个条目..."
                className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <button
                onClick={deduplicateText}
                disabled={!inputText.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <FileText className="w-4 h-4" />
                开始去重
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                去重结果
              </h2>
              {outputText && (
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  复制
                </button>
              )}
            </div>
            
            {outputText ? (
              <div className="space-y-4">
                <textarea
                  value={outputText}
                  readOnly
                  className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white resize-none"
                />
                
                <button
                  onClick={clearAll}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  清空所有
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                <FileText className="h-16 w-16 mb-4 text-gray-300" />
                <p>去重结果将显示在这里</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
} 