'use client';

import { useState } from 'react';
import { Copy, RotateCcw, CheckCircle, XCircle, Minus, Plus } from 'lucide-react';
import { useToolTranslations } from '@/components/tool-translations';
import { useLanguage } from '@/components/language-provider';

export default function JsonToolPage() {
  const { getToolTranslation, getUITranslation, getToolPageTranslation } = useToolTranslations();
  const { t } = useLanguage();
  const toolTranslation = getToolTranslation('dev-json');
  const ui = getUITranslation();
  const pageTranslation = getToolPageTranslation('dev-json');
  
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
    setInput(JSON.stringify(sampleJson, null, 2));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          JSON工具
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          JSON格式化、压缩、验证和美化工具
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 输入区域 */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {ui.labels.input}
              </h2>
              <button
                onClick={handleSampleClick}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                加载示例
              </button>
            </div>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="请输入JSON数据..."
              className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            />

            {/* 缩进设置 */}
            <div className="mt-4 flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                缩进大小:
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIndentSize(Math.max(1, indentSize - 1))}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center text-sm font-medium text-gray-900 dark:text-white">
                  {indentSize}
                </span>
                <button
                  onClick={() => setIndentSize(indentSize + 1)}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={formatJson}
                disabled={!input.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                格式化
              </button>
              <button
                onClick={compressJson}
                disabled={!input.trim()}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                压缩
              </button>
              <button
                onClick={clearAll}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors duration-200"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* 验证状态 */}
            {isValid !== null && (
              <div className="mt-4 flex items-center gap-2">
                {isValid ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm ${isValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {isValid ? 'JSON格式有效' : 'JSON格式无效'}
                </span>
              </div>
            )}

            {/* 错误信息 */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 输出区域 */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {ui.labels.output}
              </h2>
              {output && (
                <button
                  onClick={copyOutput}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  title={ui.buttons.copy}
                >
                  <Copy className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg min-h-64">
              {output ? (
                <pre className="text-sm text-gray-900 dark:text-white overflow-auto whitespace-pre-wrap">
                  {output}
                </pre>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  处理后的JSON将显示在这里
                </div>
              )}
            </div>
          </div>

          {/* 功能说明 */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">
              功能说明
            </h3>
            <ul className="space-y-2 text-blue-700 dark:text-blue-300 text-sm">
              <li>• <strong>格式化</strong>: 美化JSON格式，提高可读性</li>
              <li>• <strong>压缩</strong>: 移除所有空格和换行，减小文件大小</li>
              <li>• <strong>验证</strong>: 检查JSON语法是否正确</li>
              <li>• <strong>缩进</strong>: 自定义缩进空格数量</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 