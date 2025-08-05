'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Copy, RotateCcw, Check, History, Download, Upload, Keyboard, BookOpen } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';
import { useToolTranslations } from '@/components/tool-translations';
import { useLanguage } from '@/components/language-provider';

interface HistoryItem {
  id: string;
  input: string;
  output: string;
  type: string;
  timestamp: Date;
}

interface CaseType {
  id: string;
  name: string;
  description: string;
  shortcut: string;
}

export default function TextCaseConverterPage() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [selectedType, setSelectedType] = useState('uppercase');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isRealTimeMode, setIsRealTimeMode] = useState(true);
  const [batchMode, setBatchMode] = useState(false);
  const [batchTexts, setBatchTexts] = useState<string[]>(['']);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { getToolTranslation, getUITranslation, getToolPageTranslation } = useToolTranslations();
  const { t } = useLanguage();
  const toolTranslation = getToolTranslation('text-case');
  const ui = getUITranslation();
  const pageTranslation = getToolPageTranslation('text-case');

  const convertCase = useCallback((type: string, text: string = inputText) => {
    let result = '';
    switch (type) {
      case 'uppercase':
        result = text.toUpperCase();
        break;
      case 'lowercase':
        result = text.toLowerCase();
        break;
      case 'capitalize':
        result = text.replace(/\b\w/g, (char) => char.toUpperCase());
        break;
      case 'titlecase':
        result = text.replace(/\b\w+/g, (word) => 
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        );
        break;
      case 'alternating':
        result = text.split('').map((char, index) => 
          index % 2 === 0 ? char.toUpperCase() : char.toLowerCase()
        ).join('');
        break;
      case 'inverse':
        result = text.split('').map(char => 
          char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase()
        ).join('');
        break;
      case 'sentence':
        result = text.toLowerCase().replace(/(^\w|[.!?]\s*\w)/g, (char) => char.toUpperCase());
        break;
      case 'camelcase':
        result = text.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
          return index === 0 ? word.toLowerCase() : word.toUpperCase();
        }).replace(/\s+/g, '');
        break;
      case 'pascalcase':
        result = text.replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => {
          return word.toUpperCase();
        }).replace(/\s+/g, '');
        break;
      case 'snakecase':
        result = text.toLowerCase().replace(/\s+/g, '_');
        break;
      case 'kebabcase':
        result = text.toLowerCase().replace(/\s+/g, '-');
        break;
      default:
        result = text;
    }
    return result;
  }, [inputText]);

  // 实时转换
  useEffect(() => {
    if (isRealTimeMode && inputText && selectedType) {
      const result = convertCase(selectedType, inputText);
      setOutputText(result);
    }
  }, [inputText, selectedType, isRealTimeMode, convertCase]);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            handleConvert('uppercase');
            break;
          case '2':
            e.preventDefault();
            handleConvert('lowercase');
            break;
          case '3':
            e.preventDefault();
            handleConvert('titlecase');
            break;
          case '4':
            e.preventDefault();
            handleConvert('camelcase');
            break;
          case 'h':
            e.preventDefault();
            setShowHistory(!showHistory);
            break;
          case 'r':
            e.preventDefault();
            clearText();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showHistory]);

  const handleConvert = (type: string) => {
    setSelectedType(type);
    const result = convertCase(type, inputText);
    setOutputText(result);
    
    // 添加到历史记录
    if (inputText && result) {
      const historyItem: HistoryItem = {
        id: Date.now().toString(),
        input: inputText,
        output: result,
        type,
        timestamp: new Date()
      };
      setHistory(prev => [historyItem, ...prev.slice(0, 9)]); // 保留最近10条记录
    }
  };

  const copyToClipboard = async (text: string, index?: number) => {
    if (text && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        if (typeof index === 'number') {
          setCopiedIndex(index);
          setTimeout(() => setCopiedIndex(null), 2000);
        }
      } catch (error) {
        console.error('复制失败:', error);
      }
    }
  };

  const clearText = () => {
    setInputText('');
    setOutputText('');
    setBatchTexts(['']);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setInputText(content);
      };
      reader.readAsText(file);
    }
  };

  const downloadResult = () => {
    if (outputText) {
      const blob = new Blob([outputText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `converted-text-${selectedType}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleBatchAdd = () => {
    setBatchTexts([...batchTexts, '']);
  };

  const handleBatchRemove = (index: number) => {
    setBatchTexts(batchTexts.filter((_, i) => i !== index));
  };

  const handleBatchTextChange = (index: number, value: string) => {
    const newBatchTexts = [...batchTexts];
    newBatchTexts[index] = value;
    setBatchTexts(newBatchTexts);
  };

  const processBatch = () => {
    const results = batchTexts
      .filter(text => text.trim())
      .map(text => convertCase(selectedType, text))
      .join('\n');
    setOutputText(results);
  };

  const caseTypes: CaseType[] = [
    { id: 'uppercase', name: pageTranslation.caseTypes?.uppercase?.name || '大写', description: pageTranslation.caseTypes?.uppercase?.description || '转换为大写字母', shortcut: 'Ctrl+1' },
    { id: 'lowercase', name: pageTranslation.caseTypes?.lowercase?.name || '小写', description: pageTranslation.caseTypes?.lowercase?.description || '转换为小写字母', shortcut: 'Ctrl+2' },
    { id: 'capitalize', name: pageTranslation.caseTypes?.capitalize?.name || '首字母大写', description: pageTranslation.caseTypes?.capitalize?.description || '每个单词首字母大写', shortcut: '' },
    { id: 'titlecase', name: pageTranslation.caseTypes?.titlecase?.name || '标题格式', description: pageTranslation.caseTypes?.titlecase?.description || '标题格式大小写', shortcut: 'Ctrl+3' },
    { id: 'sentence', name: '句子格式', description: '句首字母大写', shortcut: '' },
    { id: 'camelcase', name: '驼峰格式', description: 'camelCase格式', shortcut: 'Ctrl+4' },
    { id: 'pascalcase', name: 'Pascal格式', description: 'PascalCase格式', shortcut: '' },
    { id: 'snakecase', name: '下划线格式', description: 'snake_case格式', shortcut: '' },
    { id: 'kebabcase', name: '短横线格式', description: 'kebab-case格式', shortcut: '' },
    { id: 'alternating', name: pageTranslation.caseTypes?.alternating?.name || '交替大小写', description: pageTranslation.caseTypes?.alternating?.description || '字母交替大小写', shortcut: '' },
    { id: 'inverse', name: pageTranslation.caseTypes?.inverse?.name || '反转大小写', description: pageTranslation.caseTypes?.inverse?.description || '大小写反转', shortcut: '' },
  ];

  return (
    <ToolLayout>
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* 页面标题 */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {toolTranslation.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            {toolTranslation.description}
          </p>
        </div>

        {/* 工具栏 */}
        <div className="flex flex-wrap gap-2 sm:gap-4 justify-center items-center">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="realtime"
              checked={isRealTimeMode}
              onChange={(e) => setIsRealTimeMode(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="realtime" className="text-sm text-gray-700 dark:text-gray-300">
              实时转换
            </label>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="batch"
              checked={batchMode}
              onChange={(e) => setBatchMode(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="batch" className="text-sm text-gray-700 dark:text-gray-300">
              批量模式
            </label>
          </div>

          <button
            onClick={() => setShowHistory(!showHistory)}
            className="btn bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm"
          >
            <History className="w-4 h-4 mr-1" />
            历史记录
          </button>

          <button
            onClick={() => setShowShortcuts(!showShortcuts)}
            className="btn bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm"
          >
            <Keyboard className="w-4 h-4 mr-1" />
            快捷键
          </button>
        </div>

        {/* 快捷键面板 */}
        {showShortcuts && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">
              键盘快捷键
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              <div className="text-blue-700 dark:text-blue-300">Ctrl+1: 大写</div>
              <div className="text-blue-700 dark:text-blue-300">Ctrl+2: 小写</div>
              <div className="text-blue-700 dark:text-blue-300">Ctrl+3: 标题格式</div>
              <div className="text-blue-700 dark:text-blue-300">Ctrl+4: 驼峰格式</div>
              <div className="text-blue-700 dark:text-blue-300">Ctrl+H: 历史记录</div>
              <div className="text-blue-700 dark:text-blue-300">Ctrl+R: 清空</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* 输入区域 */}
          <div className="space-y-4 sm:space-y-6">
            <div className="card p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {pageTranslation.inputText}
                </h2>
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="上传文件"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {!batchMode ? (
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={ui.placeholders.enterText}
                  className="w-full h-40 sm:h-48 p-3 sm:p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
              ) : (
                <div className="space-y-2">
                  {batchTexts.map((text, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={text}
                        onChange={(e) => handleBatchTextChange(index, e.target.value)}
                        placeholder={`文本 ${index + 1}`}
                        className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      />
                      {batchTexts.length > 1 && (
                        <button
                          onClick={() => handleBatchRemove(index)}
                          className="px-2 py-1 text-red-500 hover:text-red-700 text-sm"
                        >
                          删除
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={handleBatchAdd}
                    className="w-full p-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 text-sm"
                  >
                    + 添加文本
                  </button>
                </div>
              )}
              
              <div className="flex gap-2 mt-4">
                <button
                  onClick={clearText}
                  className="btn bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {ui.buttons.clear}
                </button>
                {batchMode && (
                  <button
                    onClick={processBatch}
                    className="btn bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    批量转换
                  </button>
                )}
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center ml-auto">
                  {batchMode ? `${batchTexts.filter(t => t.trim()).length} 项` : `${inputText.length} 字符`}
                </div>
              </div>
            </div>
          </div>

          {/* 输出区域 */}
          <div className="space-y-4 sm:space-y-6">
            <div className="card p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {pageTranslation.outputText}
                </h2>
                <div className="flex gap-2">
                  {outputText && (
                    <>
                      <button
                        onClick={() => copyToClipboard(outputText)}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        title={ui.buttons.copy}
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={downloadResult}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        title="下载结果"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-lg min-h-40 sm:min-h-48">
                {outputText ? (
                  <div className="text-gray-900 dark:text-white whitespace-pre-wrap text-sm sm:text-base">
                    {outputText}
                  </div>
                ) : (
                  <div className="text-gray-500 dark:text-gray-400 text-center py-8 text-sm sm:text-base">
                    {isRealTimeMode ? '输入文本后自动转换' : ui.messages.processing}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 历史记录 */}
          {showHistory && (
            <div className="space-y-4 sm:space-y-6">
              <div className="card p-4 sm:p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  历史记录
                </h2>
                
                {history.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {history.map((item, index) => (
                      <div key={item.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {caseTypes.find(t => t.id === item.type)?.name}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {item.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {item.input} → {item.output}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => {
                              setInputText(item.input);
                              setOutputText(item.output);
                              setSelectedType(item.type);
                            }}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            重用
                          </button>
                          <button
                            onClick={() => copyToClipboard(item.output)}
                            className="text-xs text-green-600 dark:text-green-400 hover:underline"
                          >
                            复制
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                    暂无历史记录
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 转换选项 */}
        <div className="card p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {pageTranslation.conversionOptions}
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {caseTypes.map((type, index) => (
              <button
                key={type.id}
                onClick={() => {
                  if (!isRealTimeMode) {
                    handleConvert(type.id);
                  } else {
                    setSelectedType(type.id);
                  }
                  setCopiedIndex(null);
                }}
                disabled={(!inputText && !batchMode) || (batchMode && !batchTexts.some(t => t.trim()))}
                className={`p-3 sm:p-4 border rounded-lg transition-all text-left touch-manipulation min-h-[90px] sm:min-h-[100px] ${
                  selectedType === type.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                  {type.name}
                  {type.shortcut && (
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      {type.shortcut}
                    </span>
                  )}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                  {type.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 使用说明 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 sm:p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3 sm:mb-4 flex items-center">
            <BookOpen className="w-5 h-5 mr-2" />
            {pageTranslation.instructions}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">基本功能</h4>
              <ul className="space-y-1 text-blue-700 dark:text-blue-300 text-sm">
                <li>• 输入文本后选择转换类型</li>
                <li>• 开启实时模式自动转换</li>
                <li>• 支持文件上传和结果下载</li>
                <li>• 批量模式处理多个文本</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">高级功能</h4>
              <ul className="space-y-1 text-blue-700 dark:text-blue-300 text-sm">
                <li>• 历史记录保存最近转换</li>
                <li>• 键盘快捷键快速操作</li>
                <li>• 支持多种编程格式转换</li>
                <li>• 一键复制和下载结果</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
