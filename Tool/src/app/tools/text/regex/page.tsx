'use client';

import { useState } from 'react';
import { Copy, RotateCcw, Play } from 'lucide-react';

export default function RegexPage() {
  const [pattern, setPattern] = useState('');
  const [testText, setTestText] = useState('');
  const [flags, setFlags] = useState('g');
  const [matches, setMatches] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState('');

  const testRegex = () => {
    if (!pattern || !testText) return;

    try {
      const regex = new RegExp(pattern, flags);
      const results = testText.match(regex);
      setMatches(results || []);
      setIsValid(true);
      setError('');
    } catch (err) {
      setIsValid(false);
      setError(err instanceof Error ? err.message : '正则表达式无效');
      setMatches([]);
    }
  };

  const handleCopy = async () => {
    if (matches.length > 0 && navigator.clipboard) {
      await navigator.clipboard.writeText(matches.join('\n'));
    }
  };

  const handleClear = () => {
    setPattern('');
    setTestText('');
    setMatches([]);
    setIsValid(true);
    setError('');
  };

  const flagOptions = [
    { value: 'g', label: '全局匹配 (g)' },
    { value: 'i', label: '忽略大小写 (i)' },
    { value: 'm', label: '多行匹配 (m)' },
    { value: 's', label: '点号匹配换行 (s)' },
    { value: 'u', label: 'Unicode (u)' },
    { value: 'y', label: '粘性匹配 (y)' },
  ];

  const commonPatterns = [
    { name: '邮箱', pattern: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$' },
    { name: '手机号', pattern: '^1[3-9]\\d{9}$' },
    { name: '身份证', pattern: '^[1-9]\\d{5}(18|19|20)\\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\\d{3}[0-9Xx]$' },
    { name: 'URL', pattern: '^https?:\\/\\/[\\w\\-]+(\\.[\\w\\-]+)+([\\w\\-\\.,@?^=%&:\\/~\\+#]*[\\w\\-\\@?^=%&\\/~\\+#])?$' },
    { name: 'IPv4', pattern: '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$' },
    { name: '日期', pattern: '^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          正则表达式测试器
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          在线测试和调试正则表达式
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 左侧：正则表达式输入 */}
        <div className="space-y-6">
          <div>
            <label htmlFor="pattern" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              正则表达式
            </label>
            <div className="flex gap-2">
              <input
                id="pattern"
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="输入正则表达式..."
                className={`input flex-1 ${!isValid ? 'border-red-500' : ''}`}
              />
              <button
                onClick={testRegex}
                disabled={!pattern || !testText}
                className="btn btn-primary flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                测试
              </button>
            </div>
            {!isValid && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              匹配标志
            </label>
            <div className="flex flex-wrap gap-2">
              {flagOptions.map((flag) => (
                <label key={flag.value} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={flags.includes(flag.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFlags(flags + flag.value);
                      } else {
                        setFlags(flags.replace(flag.value, ''));
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {flag.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="testText" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              测试文本
            </label>
            <textarea
              id="testText"
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="输入要测试的文本..."
              className="textarea w-full h-48"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleClear}
              className="btn btn-outline flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              清空
            </button>
          </div>
        </div>

        {/* 右侧：匹配结果 */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              匹配结果
            </label>
            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 min-h-[200px]">
              {matches.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    找到 {matches.length} 个匹配项：
                  </div>
                  <div className="space-y-1">
                    {matches.map((match, index) => (
                      <div
                        key={index}
                        className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-sm"
                      >
                        {match}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 dark:text-gray-400 text-center py-8">
                  暂无匹配结果
                </div>
              )}
            </div>
          </div>

          {matches.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="btn btn-primary flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                复制结果
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 常用正则表达式 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          常用正则表达式
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {commonPatterns.map((item) => (
            <button
              key={item.name}
              onClick={() => setPattern(item.pattern)}
              className="p-4 border rounded-lg text-left hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:hover:border-blue-600 transition-colors"
            >
              <div className="font-medium text-gray-900 dark:text-white">
                {item.name}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-mono">
                {item.pattern}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          使用说明
        </h3>
        <ul className="space-y-2 text-gray-600 dark:text-gray-400">
          <li>• 在正则表达式框中输入要测试的正则表达式</li>
          <li>• 选择匹配标志（g、i、m等）</li>
          <li>• 在测试文本框中输入要匹配的文本</li>
          <li>• 点击测试按钮查看匹配结果</li>
          <li>• 可以点击常用正则表达式快速填充</li>
        </ul>
      </div>
    </div>
  );
}
