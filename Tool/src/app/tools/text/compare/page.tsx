'use client';

import { useState } from 'react';
import { Copy, RotateCcw, Diff } from 'lucide-react';

interface DiffResult {
  type: 'added' | 'removed' | 'unchanged';
  text: string;
  lineNumber?: number;
}

export default function TextComparePage() {
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [diffResult, setDiffResult] = useState<DiffResult[]>([]);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);

  const computeDiff = () => {
    if (!text1 && !text2) {
      setDiffResult([]);
      return;
    }

    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');
    
    const result: DiffResult[] = [];
    let i = 0, j = 0;
    let lineNumber = 1;

    while (i < lines1.length || j < lines2.length) {
      const line1 = i < lines1.length ? lines1[i] : '';
      const line2 = j < lines2.length ? lines2[j] : '';
      
      let line1Compare = line1;
      let line2Compare = line2;
      
      if (ignoreWhitespace) {
        line1Compare = line1.trim();
        line2Compare = line2.trim();
      }
      
      if (ignoreCase) {
        line1Compare = line1Compare.toLowerCase();
        line2Compare = line2Compare.toLowerCase();
      }

      if (line1Compare === line2Compare) {
        // 相同的行
        result.push({
          type: 'unchanged',
          text: line1,
          lineNumber: lineNumber
        });
        i++;
        j++;
        lineNumber++;
      } else {
        // 不同的行，需要进一步比较
        const nextLine1 = i + 1 < lines1.length ? lines1[i + 1] : '';
        const nextLine2 = j + 1 < lines2.length ? lines2[j + 1] : '';
        
        let nextLine1Compare = nextLine1;
        let nextLine2Compare = nextLine2;
        
        if (ignoreWhitespace) {
          nextLine1Compare = nextLine1.trim();
          nextLine2Compare = nextLine2.trim();
        }
        
        if (ignoreCase) {
          nextLine1Compare = nextLine1Compare.toLowerCase();
          nextLine2Compare = nextLine2Compare.toLowerCase();
        }

        if (nextLine1Compare === line2Compare) {
          // 第一段文本多了一行
          result.push({
            type: 'removed',
            text: line1,
            lineNumber: lineNumber
          });
          i++;
          lineNumber++;
        } else if (line1Compare === nextLine2Compare) {
          // 第二段文本多了一行
          result.push({
            type: 'added',
            text: line2,
            lineNumber: lineNumber
          });
          j++;
          lineNumber++;
        } else {
          // 两行都不同
          result.push({
            type: 'removed',
            text: line1,
            lineNumber: lineNumber
          });
          result.push({
            type: 'added',
            text: line2,
            lineNumber: lineNumber
          });
          i++;
          j++;
          lineNumber++;
        }
      }
    }

    setDiffResult(result);
  };

  const handleCopy = async () => {
    const diffText = diffResult.map(item => {
      const prefix = item.type === 'added' ? '+' : item.type === 'removed' ? '-' : ' ';
      const lineNum = showLineNumbers ? `${item.lineNumber}: ` : '';
      return `${prefix}${lineNum}${item.text}`;
    }).join('\n');
    
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(diffText);
    }
  };

  const handleClear = () => {
    setText1('');
    setText2('');
    setDiffResult([]);
  };

  const getDiffStats = () => {
    const added = diffResult.filter(item => item.type === 'added').length;
    const removed = diffResult.filter(item => item.type === 'removed').length;
    const unchanged = diffResult.filter(item => item.type === 'unchanged').length;
    return { added, removed, unchanged };
  };

  const stats = getDiffStats();

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          文本比较工具
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          比较两段文本的差异，支持忽略大小写和空白字符
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            原始文本
          </h2>
          <textarea
            value={text1}
            onChange={(e) => setText1(e.target.value)}
            placeholder="输入第一段文本..."
            className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            比较文本
          </h2>
          <textarea
            value={text2}
            onChange={(e) => setText2(e.target.value)}
            placeholder="输入第二段文本..."
            className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          <button
            onClick={computeDiff}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Diff className="w-4 h-4" />
            比较差异
          </button>
          
          <button
            onClick={handleCopy}
            disabled={diffResult.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Copy className="w-4 h-4" />
            复制结果
          </button>
          
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            清空
          </button>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showLineNumbers}
              onChange={(e) => setShowLineNumbers(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">显示行号</span>
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={ignoreWhitespace}
              onChange={(e) => setIgnoreWhitespace(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">忽略空白字符</span>
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={ignoreCase}
              onChange={(e) => setIgnoreCase(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">忽略大小写</span>
          </label>
        </div>
      </div>

      {diffResult.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              差异结果
            </h2>
            <div className="flex gap-4 text-sm">
              <span className="text-green-600">+{stats.added} 新增</span>
              <span className="text-red-600">-{stats.removed} 删除</span>
              <span className="text-gray-600">{stats.unchanged} 相同</span>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
            <pre className="text-sm font-mono">
              {diffResult.map((item, index) => (
                <div
                  key={index}
                  className={`py-1 ${
                    item.type === 'added'
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      : item.type === 'removed'
                      ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                      : 'text-gray-800 dark:text-gray-200'
                  }`}
                >
                  <span className="mr-2">
                    {item.type === 'added' ? '+' : item.type === 'removed' ? '-' : ' '}
                  </span>
                  {showLineNumbers && item.lineNumber && (
                    <span className="text-gray-500 mr-2">{item.lineNumber}:</span>
                  )}
                  <span>{item.text}</span>
                </div>
              ))}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
} 