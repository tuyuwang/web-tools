'use client';

import { useState } from 'react';
import { Copy, RotateCcw, CheckCircle, XCircle, Minus, Plus } from 'lucide-react';

export default function JsonToolPage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const [indentSize, setIndentSize] = useState(2);

  const validateJson = (jsonString: string) => {
    try {
      JSON.parse(jsonString);
      return { valid: true, error: '' };
    } catch (err) {
      return { valid: false, error: (err as Error).message };
    }
  };

  const formatJson = () => {
    if (!input.trim()) {
      setOutput('');
      setIsValid(null);
      setError('');
      return;
    }

    const result = validateJson(input);
    setIsValid(result.valid);
    setError(result.error);

    if (result.valid) {
      try {
        const parsed = JSON.parse(input);
        const formatted = JSON.stringify(parsed, null, indentSize);
        setOutput(formatted);
      } catch (err) {
        setOutput('');
        setError((err as Error).message);
      }
    } else {
      setOutput('');
    }
  };

  const compressJson = () => {
    if (!input.trim()) {
      setOutput('');
      setIsValid(null);
      setError('');
      return;
    }

    const result = validateJson(input);
    setIsValid(result.valid);
    setError(result.error);

    if (result.valid) {
      try {
        const parsed = JSON.parse(input);
        const compressed = JSON.stringify(parsed);
        setOutput(compressed);
      } catch (err) {
        setOutput('');
        setError((err as Error).message);
      }
    } else {
      setOutput('');
    }
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setIsValid(null);
    setError('');
  };

  const copyOutput = async () => {
    if (output && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(output);
      } catch (err) {
        console.error('复制失败:', err);
      }
    }
  };

  const sampleJson = {
    name: '示例JSON',
    data: {
      users: [
        { id: 1, name: '张三', email: 'zhangsan@example.com' },
        { id: 2, name: '李四', email: 'lisi@example.com' }
      ],
      settings: {
        theme: 'dark',
        language: 'zh-CN',
        notifications: true
      }
    },
    metadata: {
      version: '1.0.0',
      createdAt: '2024-01-01T00:00:00Z'
    }
  };

  const handleSampleClick = () => {
    const sample = JSON.stringify(sampleJson, null, 2);
    setInput(sample);
    setOutput(sample);
    setIsValid(true);
    setError('');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          JSON工具
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          格式化、验证、压缩JSON数据，支持自定义缩进
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 输入区域 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              输入JSON
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={handleSampleClick}
                className="px-3 py-1 text-sm bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-700 dark:text-green-300 rounded-md transition-colors"
              >
                示例
              </button>
              <button
                onClick={clearAll}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-colors"
              >
                清空
              </button>
            </div>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="在此输入JSON数据..."
            className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          {/* 验证状态 */}
          {isValid !== null && (
            <div className={`flex items-center space-x-2 p-3 rounded-lg ${
              isValid 
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}>
              {isValid ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span className={`text-sm font-medium ${
                isValid ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
              }`}>
                {isValid ? 'JSON格式有效' : 'JSON格式无效'}
              </span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
              <div className="text-sm text-red-800 dark:text-red-200">
                <strong>错误信息:</strong> {error}
              </div>
            </div>
          )}
        </div>

        {/* 输出区域 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              处理结果
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={copyOutput}
                disabled={!output}
                className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                复制
              </button>
            </div>
          </div>

          <textarea
            value={output}
            readOnly
            placeholder="处理后的JSON将显示在这里..."
            className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm resize-none"
          />
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            操作选项
          </h3>
          
          {/* 缩进设置 */}
          <div className="flex items-center space-x-4">
            <label className="text-sm text-gray-600 dark:text-gray-400">
              缩进大小:
            </label>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIndentSize(Math.max(1, indentSize - 1))}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-sm font-medium text-gray-900 dark:text-white">
                {indentSize}
              </span>
              <button
                onClick={() => setIndentSize(Math.min(8, indentSize + 1))}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={formatJson}
            className="py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <CheckCircle className="h-5 w-5" />
            <span>格式化JSON</span>
          </button>

          <button
            onClick={compressJson}
            className="py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <RotateCcw className="h-5 w-5" />
            <span>压缩JSON</span>
          </button>
        </div>
      </div>

      {/* 使用说明 */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">
          使用说明
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700 dark:text-blue-300">
          <div>
            <h4 className="font-medium mb-2">格式化功能</h4>
            <ul className="space-y-1">
              <li>• 自动验证JSON格式</li>
              <li>• 添加适当的缩进</li>
              <li>• 提高可读性</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">压缩功能</h4>
            <ul className="space-y-1">
              <li>• 移除所有空白字符</li>
              <li>• 减少文件大小</li>
              <li>• 适合网络传输</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 