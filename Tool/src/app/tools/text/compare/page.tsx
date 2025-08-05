'use client';

import { useState, useRef, useCallback } from 'react';
import { Copy, RotateCcw, Diff, Upload, Download, Settings, Eye, FileText, BarChart3, Filter, Split, Merge } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';

interface DiffResult {
  type: 'added' | 'removed' | 'unchanged' | 'modified';
  text: string;
  originalText?: string;
  lineNumber?: number;
  charIndex?: number;
  similarity?: number;
}

interface ComparisonOptions {
  ignoreWhitespace: boolean;
  ignoreCase: boolean;
  ignoreEmptyLines: boolean;
  ignorePunctuation: boolean;
  compareWords: boolean;
  compareCharacters: boolean;
  similarityThreshold: number;
}

interface ComparisonStats {
  totalLines: number;
  added: number;
  removed: number;
  unchanged: number;
  modified: number;
  similarity: number;
}

interface ComparisonHistory {
  id: string;
  name: string;
  text1: string;
  text2: string;
  options: ComparisonOptions;
  stats: ComparisonStats;
  timestamp: Date;
}

export default function TextComparePage() {
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [diffResult, setDiffResult] = useState<DiffResult[]>([]);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [viewMode, setViewMode] = useState<'unified' | 'split' | 'inline'>('unified');
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [history, setHistory] = useState<ComparisonHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [fileName1, setFileName1] = useState('文本1');
  const [fileName2, setFileName2] = useState('文本2');
  const file1InputRef = useRef<HTMLInputElement>(null);
  const file2InputRef = useRef<HTMLInputElement>(null);

  const [options, setOptions] = useState<ComparisonOptions>({
    ignoreWhitespace: false,
    ignoreCase: false,
    ignoreEmptyLines: false,
    ignorePunctuation: false,
    compareWords: false,
    compareCharacters: false,
    similarityThreshold: 0.8
  });

  // 计算字符串相似度
  const calculateSimilarity = useCallback((str1: string, str2: string): number => {
    if (str1 === str2) return 1;
    if (str1.length === 0 || str2.length === 0) return 0;

    const matrix: number[][] = [];
    const len1 = str1.length;
    const len2 = str2.length;

    // 初始化矩阵
    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    // 计算编辑距离
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    const maxLen = Math.max(len1, len2);
    return (maxLen - matrix[len1][len2]) / maxLen;
  }, []);

  // 预处理文本
  const preprocessText = useCallback((text: string): string => {
    let processed = text;
    
    if (options.ignoreCase) {
      processed = processed.toLowerCase();
    }
    
    if (options.ignoreWhitespace) {
      processed = processed.replace(/\s+/g, ' ').trim();
    }
    
    if (options.ignorePunctuation) {
      processed = processed.replace(/[^\w\s]/g, '');
    }
    
    return processed;
  }, [options]);

  // 高级差异计算
  const computeAdvancedDiff = useCallback(() => {
    if (!text1 && !text2) {
      setDiffResult([]);
      return;
    }

    let lines1 = text1.split('\n');
    let lines2 = text2.split('\n');

    if (options.ignoreEmptyLines) {
      lines1 = lines1.filter(line => line.trim() !== '');
      lines2 = lines2.filter(line => line.trim() !== '');
    }

    const result: DiffResult[] = [];
    let i = 0, j = 0;
    let lineNumber = 1;

    while (i < lines1.length || j < lines2.length) {
      const line1 = i < lines1.length ? lines1[i] : '';
      const line2 = j < lines2.length ? lines2[j] : '';
      
      const processedLine1 = preprocessText(line1);
      const processedLine2 = preprocessText(line2);

      if (processedLine1 === processedLine2) {
        // 完全相同的行
        result.push({
          type: 'unchanged',
          text: line1,
          lineNumber: lineNumber
        });
        i++;
        j++;
        lineNumber++;
      } else {
        // 计算相似度
        const similarity = calculateSimilarity(processedLine1, processedLine2);
        
        if (similarity >= options.similarityThreshold && line1 && line2) {
          // 相似但有修改的行
          result.push({
            type: 'modified',
            text: line2,
            originalText: line1,
            lineNumber: lineNumber,
            similarity: similarity
          });
          i++;
          j++;
          lineNumber++;
        } else {
          // 检查是否是插入或删除
          const nextLine1 = i + 1 < lines1.length ? preprocessText(lines1[i + 1]) : '';
          const nextLine2 = j + 1 < lines2.length ? preprocessText(lines2[j + 1]) : '';

          if (nextLine1 === processedLine2) {
            // 第一段文本多了一行（删除）
            result.push({
              type: 'removed',
              text: line1,
              lineNumber: lineNumber
            });
            i++;
            lineNumber++;
          } else if (processedLine1 === nextLine2) {
            // 第二段文本多了一行（添加）
            result.push({
              type: 'added',
              text: line2,
              lineNumber: lineNumber
            });
            j++;
            lineNumber++;
          } else {
            // 两行都不同
            if (line1) {
              result.push({
                type: 'removed',
                text: line1,
                lineNumber: lineNumber
              });
            }
            if (line2) {
              result.push({
                type: 'added',
                text: line2,
                lineNumber: lineNumber
              });
            }
            i++;
            j++;
            lineNumber++;
          }
        }
      }
    }

    setDiffResult(result);

    // 添加到历史记录
    const stats = calculateStats(result);
    const historyItem: ComparisonHistory = {
      id: Date.now().toString(),
      name: `${fileName1} vs ${fileName2}`,
      text1,
      text2,
      options: { ...options },
      stats,
      timestamp: new Date()
    };
    
    setHistory(prev => [historyItem, ...prev.slice(0, 19)]); // 保留最近20条记录
  }, [text1, text2, options, preprocessText, calculateSimilarity, fileName1, fileName2]);

  // 计算统计信息
  const calculateStats = useCallback((results: DiffResult[]): ComparisonStats => {
    const added = results.filter(item => item.type === 'added').length;
    const removed = results.filter(item => item.type === 'removed').length;
    const unchanged = results.filter(item => item.type === 'unchanged').length;
    const modified = results.filter(item => item.type === 'modified').length;
    const total = results.length;
    
    const similarity = total > 0 ? (unchanged + modified * 0.5) / total : 0;
    
    return {
      totalLines: total,
      added,
      removed,
      unchanged,
      modified,
      similarity
    };
  }, []);

  const handleFileUpload = (fileInputRef: React.RefObject<HTMLInputElement>, setText: (text: string) => void, setFileName: (name: string) => void) => {
    const file = fileInputRef.current?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setText(content);
        setFileName(file.name);
      };
      reader.readAsText(file);
    }
  };

  const handleCopy = async () => {
    const diffText = diffResult.map(item => {
      let prefix = ' ';
      if (item.type === 'added') prefix = '+';
      else if (item.type === 'removed') prefix = '-';
      else if (item.type === 'modified') prefix = '~';
      
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
    setFileName1('文本1');
    setFileName2('文本2');
  };

  const exportReport = () => {
    const stats = calculateStats(diffResult);
    const report = {
      comparison: {
        file1: fileName1,
        file2: fileName2,
        timestamp: new Date().toISOString(),
        options
      },
      statistics: stats,
      differences: diffResult.map(item => ({
        type: item.type,
        lineNumber: item.lineNumber,
        text: item.text,
        originalText: item.originalText,
        similarity: item.similarity
      }))
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comparison-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportHTML = () => {
    const stats = calculateStats(diffResult);
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>文本比较报告</title>
    <style>
        body { font-family: 'Courier New', monospace; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .stats { display: flex; gap: 20px; margin-bottom: 20px; }
        .stat { padding: 10px; border-radius: 4px; text-align: center; }
        .added { background: #d4edda; color: #155724; }
        .removed { background: #f8d7da; color: #721c24; }
        .modified { background: #fff3cd; color: #856404; }
        .unchanged { background: #e2e3e5; color: #383d41; }
        .diff-line { padding: 2px 5px; margin: 1px 0; }
        .line-added { background: #d4edda; }
        .line-removed { background: #f8d7da; }
        .line-modified { background: #fff3cd; }
        .line-number { color: #6c757d; margin-right: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>文本比较报告</h1>
        <p><strong>文件1:</strong> ${fileName1}</p>
        <p><strong>文件2:</strong> ${fileName2}</p>
        <p><strong>生成时间:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>相似度:</strong> ${(stats.similarity * 100).toFixed(2)}%</p>
    </div>
    
    <div class="stats">
        <div class="stat added">新增: ${stats.added}</div>
        <div class="stat removed">删除: ${stats.removed}</div>
        <div class="stat modified">修改: ${stats.modified}</div>
        <div class="stat unchanged">相同: ${stats.unchanged}</div>
    </div>
    
    <div class="diff-content">
        ${diffResult.map(item => `
            <div class="diff-line line-${item.type}">
                ${showLineNumbers ? `<span class="line-number">${item.lineNumber}:</span>` : ''}
                <span>${item.type === 'added' ? '+' : item.type === 'removed' ? '-' : item.type === 'modified' ? '~' : ' '}</span>
                <span>${item.text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>
                ${item.type === 'modified' && item.similarity ? `<span style="color: #6c757d;"> (相似度: ${(item.similarity * 100).toFixed(1)}%)</span>` : ''}
            </div>
        `).join('')}
    </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comparison-report-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadFromHistory = (historyItem: ComparisonHistory) => {
    setText1(historyItem.text1);
    setText2(historyItem.text2);
    setOptions(historyItem.options);
    setShowHistory(false);
    // 重新计算差异
    setTimeout(() => computeAdvancedDiff(), 100);
  };

  const stats = calculateStats(diffResult);

  return (
    <ToolLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            文本比较工具
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            强大的文本比较工具，支持文件比较、高级选项、可视化差异和报告导出
          </p>
        </div>

        {/* 工具栏 */}
        <div className="flex flex-wrap gap-4 justify-center items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('unified')}
              className={`btn text-sm ${viewMode === 'unified' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}
            >
              <Merge className="w-4 h-4 mr-1" />
              统一视图
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`btn text-sm ${viewMode === 'split' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}
            >
              <Split className="w-4 h-4 mr-1" />
              分屏视图
            </button>
            <button
              onClick={() => setViewMode('inline')}
              className={`btn text-sm ${viewMode === 'inline' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}
            >
              <Eye className="w-4 h-4 mr-1" />
              内联视图
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowStats(!showStats)}
              className={`btn text-sm ${showStats ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}
            >
              <BarChart3 className="w-4 h-4 mr-1" />
              统计信息
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`btn text-sm ${showHistory ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}
            >
              <FileText className="w-4 h-4 mr-1" />
              历史记录
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`btn text-sm ${showSettings ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}
            >
              <Settings className="w-4 h-4 mr-1" />
              高级选项
            </button>
          </div>
        </div>

        {/* 统计信息面板 */}
        {showStats && diffResult.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">比较统计</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.added}</div>
                <div className="text-sm text-green-800 dark:text-green-200">新增行</div>
              </div>
              <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.removed}</div>
                <div className="text-sm text-red-800 dark:text-red-200">删除行</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.modified}</div>
                <div className="text-sm text-yellow-800 dark:text-yellow-200">修改行</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.unchanged}</div>
                <div className="text-sm text-gray-800 dark:text-gray-200">相同行</div>
              </div>
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{(stats.similarity * 100).toFixed(1)}%</div>
                <div className="text-sm text-blue-800 dark:text-blue-200">相似度</div>
              </div>
            </div>
          </div>
        )}

        {/* 高级选项面板 */}
        {showSettings && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">高级比较选项</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.ignoreWhitespace}
                  onChange={(e) => setOptions(prev => ({ ...prev, ignoreWhitespace: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">忽略空白字符</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.ignoreCase}
                  onChange={(e) => setOptions(prev => ({ ...prev, ignoreCase: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">忽略大小写</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.ignoreEmptyLines}
                  onChange={(e) => setOptions(prev => ({ ...prev, ignoreEmptyLines: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">忽略空行</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.ignorePunctuation}
                  onChange={(e) => setOptions(prev => ({ ...prev, ignorePunctuation: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">忽略标点符号</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.compareWords}
                  onChange={(e) => setOptions(prev => ({ ...prev, compareWords: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">按词比较</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.compareCharacters}
                  onChange={(e) => setOptions(prev => ({ ...prev, compareCharacters: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">按字符比较</span>
              </label>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                相似度阈值: {(options.similarityThreshold * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={options.similarityThreshold}
                onChange={(e) => setOptions(prev => ({ ...prev, similarityThreshold: parseFloat(e.target.value) }))}
                className="w-full"
              />
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                设置识别为相似行的最低相似度
              </div>
            </div>
          </div>
        )}

        {/* 文本输入区域 */}
        <div className={`grid gap-8 ${viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {fileName1}
              </h2>
              <div className="flex gap-2">
                <input
                  ref={file1InputRef}
                  type="file"
                  accept=".txt,.md,.js,.ts,.jsx,.tsx,.html,.css,.json,.xml,.csv"
                  onChange={() => handleFileUpload(file1InputRef, setText1, setFileName1)}
                  className="hidden"
                />
                <button
                  onClick={() => file1InputRef.current?.click()}
                  className="btn bg-gray-600 hover:bg-gray-700 text-white text-sm"
                >
                  <Upload className="w-4 h-4 mr-1" />
                  上传文件
                </button>
              </div>
            </div>
            <textarea
              value={text1}
              onChange={(e) => setText1(e.target.value)}
              placeholder="输入第一段文本或上传文件..."
              className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            />
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {text1.length} 字符, {text1.split('\n').length} 行
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {fileName2}
              </h2>
              <div className="flex gap-2">
                <input
                  ref={file2InputRef}
                  type="file"
                  accept=".txt,.md,.js,.ts,.jsx,.tsx,.html,.css,.json,.xml,.csv"
                  onChange={() => handleFileUpload(file2InputRef, setText2, setFileName2)}
                  className="hidden"
                />
                <button
                  onClick={() => file2InputRef.current?.click()}
                  className="btn bg-gray-600 hover:bg-gray-700 text-white text-sm"
                >
                  <Upload className="w-4 h-4 mr-1" />
                  上传文件
                </button>
              </div>
            </div>
            <textarea
              value={text2}
              onChange={(e) => setText2(e.target.value)}
              placeholder="输入第二段文本或上传文件..."
              className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            />
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {text2.length} 字符, {text2.split('\n').length} 行
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            <button
              onClick={computeAdvancedDiff}
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

            {diffResult.length > 0 && (
              <>
                <button
                  onClick={exportReport}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  导出JSON
                </button>
                
                <button
                  onClick={exportHTML}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  导出HTML
                </button>
              </>
            )}
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
          </div>
        </div>

        {/* 历史记录面板 */}
        {showHistory && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">比较历史</h3>
              <button
                onClick={() => setHistory([])}
                className="btn bg-red-600 hover:bg-red-700 text-white text-sm"
              >
                清空历史
              </button>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {history.length > 0 ? (
                history.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => loadFromHistory(item)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {item.timestamp.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      相似度: {(item.stats.similarity * 100).toFixed(1)}% • 
                      新增: {item.stats.added} • 
                      删除: {item.stats.removed} • 
                      修改: {item.stats.modified}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  暂无比较历史
                </div>
              )}
            </div>
          </div>
        )}

        {/* 差异结果显示 */}
        {diffResult.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                差异结果
              </h2>
              <div className="flex gap-4 text-sm">
                <span className="text-green-600">+{stats.added} 新增</span>
                <span className="text-red-600">-{stats.removed} 删除</span>
                <span className="text-yellow-600">~{stats.modified} 修改</span>
                <span className="text-gray-600">{stats.unchanged} 相同</span>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="text-sm font-mono">
                {diffResult.map((item, index) => (
                  <div
                    key={index}
                    className={`py-1 px-2 rounded ${
                      item.type === 'added'
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : item.type === 'removed'
                        ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                        : item.type === 'modified'
                        ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                        : 'text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    <span className="mr-2 font-bold">
                      {item.type === 'added' ? '+' : item.type === 'removed' ? '-' : item.type === 'modified' ? '~' : ' '}
                    </span>
                    {showLineNumbers && item.lineNumber && (
                      <span className="text-gray-500 mr-2 text-xs">{item.lineNumber}:</span>
                    )}
                    <span>{item.text}</span>
                    {item.type === 'modified' && item.similarity && (
                      <span className="text-gray-500 text-xs ml-2">
                        (相似度: {(item.similarity * 100).toFixed(1)}%)
                      </span>
                    )}
                    {item.type === 'modified' && item.originalText && viewMode === 'inline' && (
                      <div className="ml-6 mt-1 text-xs text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 p-1 rounded">
                        原文: {item.originalText}
                      </div>
                    )}
                  </div>
                ))}
              </pre>
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">
            使用说明
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">基本功能</h4>
              <ul className="space-y-1 text-blue-700 dark:text-blue-300 text-sm">
                <li>• 支持文本和文件比较</li>
                <li>• 多种视图模式切换</li>
                <li>• 详细的统计信息</li>
                <li>• 智能相似度分析</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">高级功能</h4>
              <ul className="space-y-1 text-blue-700 dark:text-blue-300 text-sm">
                <li>• 高级比较选项配置</li>
                <li>• 比较历史记录</li>
                <li>• 多格式报告导出</li>
                <li>• 可视化差异显示</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
} 