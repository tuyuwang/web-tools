'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Copy, RotateCcw, Check, Keyboard, Download, Upload, Eye, EyeOff, Zap } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';
import { useToolTranslations } from '@/components/tool-translations';
import { useLanguage } from '@/components/language-provider';

interface CaseType {
  id: string;
  name: string;
  description: string;
  shortcut: string;
  example: string;
}

export default function TextCaseConverterPage() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [selectedCaseType, setSelectedCaseType] = useState<string>('');
  const [previewMode, setPreviewMode] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [processingHistory, setProcessingHistory] = useState<Array<{text: string, type: string, timestamp: number}>>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
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
    
    if (!previewMode) {
      setOutputText(result);
      setSelectedCaseType(type);
      
      // Add to history
      setProcessingHistory(prev => [
        { text: text.substring(0, 50) + (text.length > 50 ? '...' : ''), type, timestamp: Date.now() },
        ...prev.slice(0, 9) // Keep only last 10 entries
      ]);
    }
    
    return result;
  }, [inputText, previewMode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            convertCase('uppercase');
            break;
          case '2':
            e.preventDefault();
            convertCase('lowercase');
            break;
          case '3':
            e.preventDefault();
            convertCase('capitalize');
            break;
          case '4':
            e.preventDefault();
            convertCase('titlecase');
            break;
          case '5':
            e.preventDefault();
            convertCase('camelcase');
            break;
          case '6':
            e.preventDefault();
            convertCase('pascalcase');
            break;
          case 'Enter':
            e.preventDefault();
            if (selectedCaseType) {
              convertCase(selectedCaseType);
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [convertCase, selectedCaseType]);

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

  const clearAll = () => {
    setInputText('');
    setOutputText('');
    setSelectedCaseType('');
    setProcessingHistory([]);
  };

  const downloadResult = () => {
    if (outputText) {
      const blob = new Blob([outputText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `converted-text-${selectedCaseType}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setInputText(text);
      };
      reader.readAsText(file);
    }
  };

  const caseTypes: CaseType[] = [
    { id: 'uppercase', shortcut: 'Ctrl+1', example: 'HELLO WORLD', ...pageTranslation.caseTypes.uppercase },
    { id: 'lowercase', shortcut: 'Ctrl+2', example: 'hello world', ...pageTranslation.caseTypes.lowercase },
    { id: 'capitalize', shortcut: 'Ctrl+3', example: 'Hello World', ...pageTranslation.caseTypes.capitalize },
    { id: 'titlecase', shortcut: 'Ctrl+4', example: 'Hello World', ...pageTranslation.caseTypes.titlecase },
    { id: 'camelcase', shortcut: 'Ctrl+5', example: 'helloWorld', name: '驼峰命名', description: '首字母小写的驼峰命名格式' },
    { id: 'pascalcase', shortcut: 'Ctrl+6', example: 'HelloWorld', name: '帕斯卡命名', description: '首字母大写的驼峰命名格式' },
    { id: 'snakecase', shortcut: '', example: 'hello_world', name: '下划线命名', description: '用下划线连接的小写格式' },
    { id: 'kebabcase', shortcut: '', example: 'hello-world', name: '短横线命名', description: '用短横线连接的小写格式' },
    { id: 'alternating', shortcut: '', example: 'HeLlO wOrLd', ...pageTranslation.caseTypes.alternating },
    { id: 'inverse', shortcut: '', example: 'hELLO wORLD', ...pageTranslation.caseTypes.inverse },
  ];

  const stats = {
    characters: inputText.length,
    charactersNoSpaces: inputText.replace(/\s/g, '').length,
    words: inputText.trim() ? inputText.trim().split(/\s+/).length : 0,
    lines: inputText.split('\n').length,
    paragraphs: inputText.split(/\n\s*\n/).filter(p => p.trim()).length
  };

  return (
    <ToolLayout>
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* 页面标题和快捷键提示 */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {toolTranslation.title}
            </h1>
            <button
              onClick={() => setShowShortcuts(!showShortcuts)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              title="键盘快捷键"
            >
              <Keyboard className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            {toolTranslation.description}
          </p>
        </div>

        {/* 快捷键说明 */}
        {showShortcuts && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">键盘快捷键</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-blue-700 dark:text-blue-300">
              {caseTypes.filter(type => type.shortcut).map(type => (
                <div key={type.id} className="flex justify-between">
                  <span>{type.name}</span>
                  <kbd className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded text-xs">{type.shortcut}</kbd>
                </div>
              ))}
              <div className="flex justify-between">
                <span>执行转换</span>
                <kbd className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded text-xs">Ctrl+Enter</kbd>
              </div>
            </div>
          </div>
        )}

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* 输入区域 */}
          <div className="lg:col-span-1 space-y-4">
            <div className="card p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {pageTranslation.inputText}
                </h2>
                <div className="flex gap-2">
                  <label className="btn bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    上传文件
                    <input
                      type="file"
                      accept=".txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={() => setPreviewMode(!previewMode)}
                    className={`btn ${previewMode ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'}`}
                    title="预览模式"
                  >
                    {previewMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={ui.placeholders.enterText}
                className="w-full h-48 sm:h-56 p-3 sm:p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
              
              <div className="flex items-center justify-between mt-4">
                <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <div>字符: {stats.characters}</div>
                  <div>单词: {stats.words}</div>
                  <div>行数: {stats.lines}</div>
                  <div>段落: {stats.paragraphs}</div>
                </div>
                <button
                  onClick={clearAll}
                  className="btn bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {ui.buttons.clear}
                </button>
              </div>
            </div>

            {/* 处理历史 */}
            {processingHistory.length > 0 && (
              <div className="card p-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">处理历史</h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {processingHistory.map((item, index) => (
                    <div key={index} className="text-xs text-gray-600 dark:text-gray-400 flex justify-between">
                      <span className="truncate">{item.text}</span>
                      <span className="text-blue-600 dark:text-blue-400 ml-2 flex-shrink-0">
                        {caseTypes.find(t => t.id === item.type)?.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 转换选项 */}
          <div className="lg:col-span-1 space-y-4">
            <div className="card p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {pageTranslation.conversionOptions}
              </h2>
              
              <div className="grid grid-cols-1 gap-3">
                {caseTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => {
                      if (previewMode) {
                        setSelectedCaseType(type.id);
                      } else {
                        convertCase(type.id);
                      }
                    }}
                    disabled={!inputText}
                    className={`p-3 border rounded-lg text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[100px] ${
                      selectedCaseType === type.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-medium text-gray-900 dark:text-white text-sm">
                        {type.name}
                      </div>
                      {type.shortcut && (
                        <kbd className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs text-gray-600 dark:text-gray-400">
                          {type.shortcut}
                        </kbd>
                      )}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      {type.description}
                    </div>
                    <div className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
                      {type.example}
                    </div>
                    {previewMode && inputText && (
                      <div className="mt-2 text-xs font-mono bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded text-blue-800 dark:text-blue-200">
                        预览: {convertCase(type.id, inputText).substring(0, 30)}...
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 输出区域 */}
          <div className="lg:col-span-1 space-y-4">
            <div className="card p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {pageTranslation.outputText}
                </h2>
                {outputText && (
                  <div className="flex gap-2">
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
                      title={ui.buttons.download}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-lg min-h-48 sm:min-h-56">
                {outputText ? (
                  <div className="text-gray-900 dark:text-white whitespace-pre-wrap text-sm sm:text-base font-mono">
                    {outputText}
                  </div>
                ) : (
                  <div className="text-gray-500 dark:text-gray-400 text-center py-8 text-sm sm:text-base">
                    {previewMode ? '选择转换类型查看预览' : ui.messages.processing}
                  </div>
                )}
              </div>

              {outputText && (
                <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                  输出统计: {outputText.length} 字符, {outputText.trim().split(/\s+/).length} 单词
                </div>
              )}
            </div>

            {/* 快速操作 */}
            {outputText && (
              <div className="card p-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">快速操作</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setInputText(outputText)}
                    className="btn-sm bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 text-blue-700 dark:text-blue-200"
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    用作输入
                  </button>
                  <button
                    onClick={() => copyToClipboard(outputText)}
                    className="btn-sm bg-green-100 hover:bg-green-200 dark:bg-green-800 dark:hover:bg-green-700 text-green-700 dark:text-green-200"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    复制结果
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 使用说明 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 sm:p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3 sm:mb-4">
            {pageTranslation.instructions}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ul className="space-y-2 text-blue-700 dark:text-blue-300 text-sm sm:text-base">
              {pageTranslation.instructionSteps.map((step: string, index: number) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-500 mr-2 flex-shrink-0">•</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
            <ul className="space-y-2 text-blue-700 dark:text-blue-300 text-sm sm:text-base">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2 flex-shrink-0">•</span>
                <span>支持键盘快捷键快速转换</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2 flex-shrink-0">•</span>
                <span>预览模式可在转换前查看效果</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2 flex-shrink-0">•</span>
                <span>支持上传文本文件批量处理</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2 flex-shrink-0">•</span>
                <span>提供详细的文本统计信息</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
