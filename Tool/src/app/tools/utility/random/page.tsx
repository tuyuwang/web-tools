'use client';

import { useState } from 'react';
import { RotateCcw, Copy, Dice1 } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';

export default function RandomGeneratorPage() {
  const [minValue, setMinValue] = useState('1');
  const [maxValue, setMaxValue] = useState('100');
  const [count, setCount] = useState('1');
  const [results, setResults] = useState<number[]>([]);

  const generateRandomNumbers = () => {
    const min = parseInt(minValue);
    const max = parseInt(maxValue);
    const numCount = parseInt(count);

    if (isNaN(min) || isNaN(max) || isNaN(numCount)) return;
    if (min > max) return;
    if (numCount < 1) return;

    const newResults: number[] = [];
    for (let i = 0; i < numCount; i++) {
      newResults.push(Math.floor(Math.random() * (max - min + 1)) + min);
    }

    setResults(newResults);
  };

  const copyResults = async () => {
    if (results.length > 0 && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(results.join(', '));
      } catch (error) {
        console.error('复制失败:', error);
      }
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <ToolLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            随机数生成器
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            生成随机数字，支持自定义范围和数量
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 设置区域 */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                生成设置
              </h2>

              <div className="space-y-4">
                {/* 范围设置 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      最小值
                    </label>
                    <input
                      type="number"
                      value={minValue}
                      onChange={(e) => setMinValue(e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      最大值
                    </label>
                    <input
                      type="number"
                      value={maxValue}
                      onChange={(e) => setMaxValue(e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* 数量设置 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    生成数量
                  </label>
                  <input
                    type="number"
                    value={count}
                    onChange={(e) => setCount(e.target.value)}
                    min="1"
                    max="100"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* 生成按钮 */}
                <button
                  onClick={generateRandomNumbers}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Dice1 className="w-5 h-5" />
                  生成随机数
                </button>
              </div>
            </div>
          </div>

          {/* 结果区域 */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  生成结果
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={copyResults}
                    disabled={results.length === 0}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="复制结果"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={clearResults}
                    disabled={results.length === 0}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="清空结果"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {results.length > 0 ? (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    生成了 {results.length} 个随机数
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="text-lg font-mono text-gray-900 dark:text-white break-all">
                      {results.join(', ')}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    范围: {minValue} - {maxValue}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Dice1 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>点击"生成随机数"按钮开始生成</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
} 