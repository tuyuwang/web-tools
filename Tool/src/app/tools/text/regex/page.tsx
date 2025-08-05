'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Copy, RotateCcw, Play, Save, History, Download, Upload, Clock, Target, Bookmark, Settings, Info, AlertCircle, CheckCircle } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';

interface RegexMatch {
  match: string;
  groups: string[];
  index: number;
  input: string;
}

interface SavedPattern {
  id: string;
  name: string;
  pattern: string;
  flags: string;
  description: string;
  createdAt: Date;
}

interface HistoryItem {
  id: string;
  pattern: string;
  flags: string;
  testText: string;
  matches: RegexMatch[];
  timestamp: Date;
  executionTime: number;
}

interface PerformanceMetrics {
  executionTime: number;
  matchCount: number;
  complexity: 'low' | 'medium' | 'high';
  warning?: string;
}

export default function RegexPage() {
  const [pattern, setPattern] = useState('');
  const [testText, setTestText] = useState('');
  const [flags, setFlags] = useState('g');
  const [matches, setMatches] = useState<RegexMatch[]>([]);
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [savedPatterns, setSavedPatterns] = useState<SavedPattern[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
  const [highlightedText, setHighlightedText] = useState('');
  const [realTimeMode, setRealTimeMode] = useState(false);
  const [showGroups, setShowGroups] = useState(true);
  const [maxMatches, setMaxMatches] = useState(100);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 实时模式下的自动测试
  useEffect(() => {
    if (realTimeMode && pattern && testText) {
      const timer = setTimeout(() => {
        testRegex();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [pattern, testText, flags, realTimeMode]);

  // 性能分析
  const analyzeComplexity = useCallback((pattern: string): 'low' | 'medium' | 'high' => {
    let score = 0;
    
    // 检查复杂的模式
    if (pattern.includes('*') || pattern.includes('+')) score += 1;
    if (pattern.includes('(?:') || pattern.includes('(?=') || pattern.includes('(?!')) score += 2;
    if (pattern.includes('\\b') || pattern.includes('\\B')) score += 1;
    if (pattern.match(/\{.*,.*\}/)) score += 1;
    if (pattern.includes('|')) score += 1;
    if (pattern.length > 50) score += 1;
    
    if (score >= 4) return 'high';
    if (score >= 2) return 'medium';
    return 'low';
  }, []);

  const testRegex = useCallback(() => {
    if (!pattern || !testText) return;

    const startTime = performance.now();
    
    try {
      const regex = new RegExp(pattern, flags);
      const allMatches: RegexMatch[] = [];
      let match;
      let matchCount = 0;
      
      if (flags.includes('g')) {
        while ((match = regex.exec(testText)) !== null && matchCount < maxMatches) {
          allMatches.push({
            match: match[0],
            groups: match.slice(1),
            index: match.index,
            input: match.input || ''
          });
          matchCount++;
          
          // 防止无限循环
          if (match[0].length === 0) {
            regex.lastIndex++;
          }
        }
      } else {
        match = regex.exec(testText);
        if (match) {
          allMatches.push({
            match: match[0],
            groups: match.slice(1),
            index: match.index,
            input: match.input || ''
          });
        }
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      setMatches(allMatches);
      setIsValid(true);
      setError('');
      
      // 性能分析
      const complexity = analyzeComplexity(pattern);
      let warning;
      
      if (executionTime > 100) {
        warning = '执行时间较长，考虑优化正则表达式';
      } else if (complexity === 'high') {
        warning = '复杂的正则表达式，可能影响性能';
      } else if (matchCount >= maxMatches) {
        warning = `匹配数量达到上限 (${maxMatches})，可能有更多匹配`;
      }
      
      setPerformance({
        executionTime,
        matchCount: allMatches.length,
        complexity,
        warning
      });
      
      // 高亮显示匹配的文本
      highlightMatches(testText, allMatches);
      
      // 添加到历史记录
      const historyItem: HistoryItem = {
        id: Date.now().toString(),
        pattern,
        flags,
        testText,
        matches: allMatches,
        timestamp: new Date(),
        executionTime
      };
      
      setHistory(prev => [historyItem, ...prev.slice(0, 49)]); // 保留最近50条记录
      
    } catch (err) {
      setIsValid(false);
      setError(err instanceof Error ? err.message : '正则表达式无效');
      setMatches([]);
      setPerformance(null);
      setHighlightedText(testText);
    }
  }, [pattern, testText, flags, maxMatches, analyzeComplexity]);

  // 高亮显示匹配文本
  const highlightMatches = (text: string, matchResults: RegexMatch[]) => {
    if (matchResults.length === 0) {
      setHighlightedText(text);
      return;
    }
    
    let highlighted = '';
    let lastIndex = 0;
    
    matchResults.forEach((match, index) => {
      // 添加匹配前的文本
      highlighted += text.slice(lastIndex, match.index);
      
      // 添加高亮的匹配文本
      highlighted += `<mark class="bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100 px-1 rounded" data-match="${index}">${match.match}</mark>`;
      
      lastIndex = match.index + match.match.length;
    });
    
    // 添加剩余文本
    highlighted += text.slice(lastIndex);
    
    setHighlightedText(highlighted);
  };

  const handleCopy = async () => {
    if (matches.length > 0 && navigator.clipboard) {
      const result = matches.map(match => match.match).join('\n');
      await navigator.clipboard.writeText(result);
    }
  };

  const handleClear = () => {
    setPattern('');
    setTestText('');
    setMatches([]);
    setIsValid(true);
    setError('');
    setPerformance(null);
    setHighlightedText('');
  };

  const savePattern = () => {
    if (!pattern) return;
    
    const name = prompt('请输入正则表达式名称:');
    if (!name) return;
    
    const description = prompt('请输入描述（可选）:') || '';
    
    const savedPattern: SavedPattern = {
      id: Date.now().toString(),
      name,
      pattern,
      flags,
      description,
      createdAt: new Date()
    };
    
    setSavedPatterns(prev => [savedPattern, ...prev]);
  };

  const loadPattern = (savedPattern: SavedPattern) => {
    setPattern(savedPattern.pattern);
    setFlags(savedPattern.flags);
    setShowSaved(false);
  };

  const loadFromHistory = (historyItem: HistoryItem) => {
    setPattern(historyItem.pattern);
    setFlags(historyItem.flags);
    setTestText(historyItem.testText);
    setShowHistory(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setTestText(content);
      };
      reader.readAsText(file);
    }
  };

  const downloadResults = () => {
    if (matches.length === 0) return;
    
    const results = {
      pattern,
      flags,
      testText,
      matches: matches.map(match => ({
        match: match.match,
        groups: match.groups,
        index: match.index
      })),
      performance,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `regex-results-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const flagOptions = [
    { value: 'g', label: '全局匹配 (g)', description: '查找所有匹配项，而不是第一个' },
    { value: 'i', label: '忽略大小写 (i)', description: '不区分大小写匹配' },
    { value: 'm', label: '多行匹配 (m)', description: '^和$匹配每行的开始和结束' },
    { value: 's', label: '点号匹配换行 (s)', description: '.匹配包括换行符在内的任何字符' },
    { value: 'u', label: 'Unicode (u)', description: '启用Unicode模式' },
    { value: 'y', label: '粘性匹配 (y)', description: '从lastIndex位置开始匹配' },
  ];

  const commonPatterns = [
    { 
      name: '邮箱', 
      pattern: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$',
      description: '匹配标准邮箱地址格式'
    },
    { 
      name: '手机号', 
      pattern: '^1[3-9]\\d{9}$',
      description: '匹配中国大陆手机号码'
    },
    { 
      name: '身份证', 
      pattern: '^[1-9]\\d{5}(18|19|20)\\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\\d{3}[0-9Xx]$',
      description: '匹配18位身份证号码'
    },
    { 
      name: 'URL', 
      pattern: '^https?:\\/\\/[\\w\\-]+(\\.[\\w\\-]+)+([\\w\\-\\.,@?^=%&:\\/~\\+#]*[\\w\\-\\@?^=%&\\/~\\+#])?$',
      description: '匹配HTTP/HTTPS网址'
    },
    { 
      name: 'IPv4', 
      pattern: '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$',
      description: '匹配IPv4地址'
    },
    { 
      name: '日期 (YYYY-MM-DD)', 
      pattern: '^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$',
      description: '匹配YYYY-MM-DD格式日期'
    },
    {
      name: '中文字符',
      pattern: '[\\u4e00-\\u9fa5]+',
      description: '匹配中文字符'
    },
    {
      name: '数字（整数）',
      pattern: '^-?\\d+$',
      description: '匹配正负整数'
    }
  ];

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'text-green-600 dark:text-green-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'high': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <ToolLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            正则表达式测试器
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            强大的正则表达式测试工具，支持语法高亮、性能分析、历史记录等功能
          </p>
        </div>

        {/* 工具栏 */}
        <div className="flex flex-wrap gap-4 justify-center items-center">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="realTimeMode"
              checked={realTimeMode}
              onChange={(e) => setRealTimeMode(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="realTimeMode" className="text-sm text-gray-700 dark:text-gray-300">
              实时模式
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showGroups"
              checked={showGroups}
              onChange={(e) => setShowGroups(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="showGroups" className="text-sm text-gray-700 dark:text-gray-300">
              显示捕获组
            </label>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`btn text-sm ${showHistory ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}
            >
              <History className="w-4 h-4 mr-1" />
              历史记录
            </button>
            <button
              onClick={() => setShowSaved(!showSaved)}
              className={`btn text-sm ${showSaved ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}
            >
              <Bookmark className="w-4 h-4 mr-1" />
              保存的模式
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`btn text-sm ${showSettings ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}
            >
              <Settings className="w-4 h-4 mr-1" />
              设置
            </button>
          </div>
        </div>

        {/* 设置面板 */}
        {showSettings && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">设置</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  最大匹配数量: {maxMatches}
                </label>
                <input
                  type="range"
                  min="10"
                  max="1000"
                  step="10"
                  value={maxMatches}
                  onChange={(e) => setMaxMatches(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  限制匹配结果数量以提高性能
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* 左侧：正则表达式输入 */}
          <div className="xl:col-span-1 space-y-6">
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
                  className={`flex-1 p-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono ${
                    !isValid ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
                <button
                  onClick={testRegex}
                  disabled={!pattern || !testText}
                  className="btn bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="w-4 h-4 mr-1" />
                  测试
                </button>
              </div>
              {!isValid && (
                <div className="flex items-center gap-2 mt-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                匹配标志
              </label>
              <div className="space-y-2">
                {flagOptions.map((flag) => (
                  <label key={flag.value} className="flex items-start gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
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
                      className="rounded border-gray-300 mt-1"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {flag.label}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {flag.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={savePattern}
                disabled={!pattern}
                className="btn bg-green-600 hover:bg-green-700 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 mr-1" />
                保存模式
              </button>
              <button
                onClick={handleClear}
                className="btn bg-gray-600 hover:bg-gray-700 text-white text-sm"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                清空
              </button>
            </div>
          </div>

          {/* 中间：测试文本 */}
          <div className="xl:col-span-1 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="testText" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  测试文本
                </label>
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.log,.json,.xml,.html,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="btn bg-gray-600 hover:bg-gray-700 text-white text-xs"
                  >
                    <Upload className="w-3 h-3 mr-1" />
                    上传文件
                  </button>
                </div>
              </div>
              
              <textarea
                id="testText"
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder="输入要测试的文本..."
                className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
              
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {testText.length} 字符, {testText.split('\n').length} 行
              </div>
            </div>

            {/* 高亮显示的文本 */}
            {highlightedText && matches.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  高亮显示
                </label>
                <div 
                  className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white overflow-auto font-mono text-sm"
                  dangerouslySetInnerHTML={{ __html: highlightedText }}
                />
              </div>
            )}
          </div>

          {/* 右侧：匹配结果 */}
          <div className="xl:col-span-1 space-y-6">
            {/* 性能指标 */}
            {performance && (
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">性能分析</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">执行时间:</span>
                    <span className="font-mono">{performance.executionTime.toFixed(2)}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">匹配数量:</span>
                    <span className="font-mono">{performance.matchCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">复杂度:</span>
                    <span className={`font-medium ${getComplexityColor(performance.complexity)}`}>
                      {performance.complexity.toUpperCase()}
                    </span>
                  </div>
                  {performance.warning && (
                    <div className="flex items-start gap-2 mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                      <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                      <span className="text-yellow-800 dark:text-yellow-200 text-xs">
                        {performance.warning}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  匹配结果
                </label>
                <div className="flex gap-2">
                  {matches.length > 0 && (
                    <>
                      <button
                        onClick={handleCopy}
                        className="btn bg-green-600 hover:bg-green-700 text-white text-xs"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        复制
                      </button>
                      <button
                        onClick={downloadResults}
                        className="btn bg-purple-600 hover:bg-purple-700 text-white text-xs"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        导出
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 min-h-[300px] max-h-96 overflow-y-auto">
                {matches.length > 0 ? (
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                      找到 {matches.length} 个匹配项
                    </div>
                    
                    <div className="space-y-2">
                      {matches.map((match, index) => (
                        <div
                          key={index}
                          className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              匹配 #{index + 1} (位置: {match.index})
                            </span>
                            <button
                              onClick={() => navigator.clipboard?.writeText(match.match)}
                              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                          
                          <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-sm font-mono mb-2">
                            {match.match}
                          </div>
                          
                          {showGroups && match.groups.length > 0 && (
                            <div className="space-y-1">
                              <div className="text-xs text-gray-600 dark:text-gray-400">捕获组:</div>
                              {match.groups.map((group, groupIndex) => (
                                <div
                                  key={groupIndex}
                                  className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs font-mono ml-4"
                                >
                                  组 {groupIndex + 1}: {group || '(空)'}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500 dark:text-gray-400 text-center py-8">
                    <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    暂无匹配结果
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 历史记录面板 */}
        {showHistory && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">历史记录</h3>
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
                      <span className="font-mono text-sm text-blue-600 dark:text-blue-400">
                        {item.pattern}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {item.timestamp.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {item.matches.length} 个匹配 • {item.executionTime.toFixed(2)}ms • 标志: {item.flags}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                  暂无历史记录
                </div>
              )}
            </div>
          </div>
        )}

        {/* 保存的模式面板 */}
        {showSaved && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">保存的模式</h3>
              <button
                onClick={() => setSavedPatterns([])}
                className="btn bg-red-600 hover:bg-red-700 text-white text-sm"
              >
                清空保存
              </button>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {savedPatterns.length > 0 ? (
                savedPatterns.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => loadPattern(item)}
                          className="btn bg-blue-600 hover:bg-blue-700 text-white text-xs"
                        >
                          加载
                        </button>
                        <button
                          onClick={() => setSavedPatterns(prev => prev.filter(p => p.id !== item.id))}
                          className="btn bg-red-600 hover:bg-red-700 text-white text-xs"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                    <div className="font-mono text-sm text-blue-600 dark:text-blue-400 mb-1">
                      {item.pattern}
                    </div>
                    {item.description && (
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {item.description}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      标志: {item.flags} • 保存于: {item.createdAt.toLocaleString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                  暂无保存的模式
                </div>
              )}
            </div>
          </div>
        )}

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
                <div className="font-medium text-gray-900 dark:text-white mb-2">
                  {item.name}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {item.description}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500 font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded">
                  {item.pattern}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 使用说明 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">
            使用说明
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">基本功能</h4>
              <ul className="space-y-1 text-blue-700 dark:text-blue-300 text-sm">
                <li>• 实时测试正则表达式</li>
                <li>• 语法高亮显示匹配结果</li>
                <li>• 显示捕获组详细信息</li>
                <li>• 性能分析和优化建议</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">高级功能</h4>
              <ul className="space-y-1 text-blue-700 dark:text-blue-300 text-sm">
                <li>• 保存常用正则表达式</li>
                <li>• 历史记录管理</li>
                <li>• 文件导入测试文本</li>
                <li>• 导出匹配结果</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
