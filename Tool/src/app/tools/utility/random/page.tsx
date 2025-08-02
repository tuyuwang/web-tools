'use client';

import { useState } from 'react';
import { RotateCcw, Copy, Dice1 } from 'lucide-react';

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
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Dice1 className="h-5 w-5" />
                <span>生成随机数</span>
              </button>
            </div>
          </div>

          {/* 快速预设 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              快速预设
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setMinValue('1');
                  setMaxValue('6');
                  setCount('1');
                }}
                className="p-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              >
                骰子 (1-6)
              </button>
              <button
                onClick={() => {
                  setMinValue('1');
                  setMaxValue('100');
                  setCount('1');
                }}
                className="p-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              >
                1-100
              </button>
              <button
                onClick={() => {
                  setMinValue('0');
                  setMaxValue('9');
                  setCount('4');
                }}
                className="p-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              >
                验证码 (4位)
              </button>
              <button
                onClick={() => {
                  setMinValue('1');
                  setMaxValue('10');
                  setCount('5');
                }}
                className="p-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              >
                1-10 (5个)
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
              <div className="flex space-x-2">
                <button
                  onClick={copyResults}
                  disabled={results.length === 0}
                  className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-md transition-colors disabled:opacity-50"
                >
                  复制
                </button>
                <button
                  onClick={clearResults}
                  disabled={results.length === 0}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-colors disabled:opacity-50"
                >
                  清空
                </button>
              </div>
            </div>

            {results.length > 0 ? (
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    生成结果 ({results.length} 个):
                  </div>
                  <div className="text-lg font-mono text-gray-900 dark:text-white">
                    {results.join(', ')}
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <div className="text-blue-800 dark:text-blue-200 font-medium mb-2">统计信息</div>
                  <div className="text-blue-700 dark:text-blue-300 text-sm">
                    <div>最小值: {Math.min(...results)}</div>
                    <div>最大值: {Math.max(...results)}</div>
                    <div>平均值: {(results.reduce((a, b) => a + b, 0) / results.length).toFixed(2)}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Dice1 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>点击生成按钮开始生成随机数</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 