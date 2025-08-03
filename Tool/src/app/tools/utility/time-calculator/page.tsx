'use client';

import { ToolLayout } from '@/components/tool-layout';
import { useState } from 'react';
import { Clock, Plus, Minus, Calendar } from 'lucide-react';

export default function TimeCalculatorPage() {
  const [operation, setOperation] = useState<'add' | 'subtract'>('add');
  const [date1, setDate1] = useState('');
  const [date2, setDate2] = useState('');
  const [result, setResult] = useState('');

  const calculateTime = () => {
    if (!date1 || !date2) {
      setResult('');
      return;
    }

    const d1 = new Date(date1);
    const d2 = new Date(date2);

    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
      setResult('请输入有效的日期');
      return;
    }

    let diffMs: number;
    if (operation === 'add') {
      diffMs = d1.getTime() + d2.getTime();
    } else {
      diffMs = Math.abs(d1.getTime() - d2.getTime());
    }

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    setResult(`${diffDays}天 ${diffHours}小时 ${diffMinutes}分钟 ${diffSeconds}秒`);
  };

  const reset = () => {
    setDate1('');
    setDate2('');
    setResult('');
  };

  return (
    <ToolLayout>
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          时间计算器
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          计算时间差或时间相加
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="space-y-6">
          {/* 操作选择 */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              选择操作
            </h2>
            <div className="flex gap-4">
              <button
                onClick={() => setOperation('add')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  operation === 'add'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <Plus className="w-4 h-4" />
                时间相加
              </button>
              <button
                onClick={() => setOperation('subtract')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  operation === 'subtract'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <Minus className="w-4 h-4" />
                时间差
              </button>
            </div>
          </div>

          {/* 日期输入 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                第一个日期
              </label>
              <input
                type="datetime-local"
                value={date1}
                onChange={(e) => setDate1(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                第二个日期
              </label>
              <input
                type="datetime-local"
                value={date2}
                onChange={(e) => setDate2(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* 计算按钮 */}
          <div className="flex gap-3">
            <button
              onClick={calculateTime}
              disabled={!date1 || !date2}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <Clock className="w-4 h-4" />
              计算
            </button>

            <button
              onClick={reset}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              重置
            </button>
          </div>

          {/* 结果显示 */}
          {result && (
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                计算结果
              </h3>
              <p className="text-gray-700 dark:text-gray-300">{result}</p>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
} 