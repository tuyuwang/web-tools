'use client';

import { useState, useCallback } from 'react';
import { Copy, RotateCcw, Check, Download, Upload } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';
import { useToolTranslations } from '@/components/tool-translations';
import { useLanguage } from '@/components/language-provider';

export default function TextCaseConverterPage() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeConversion, setActiveConversion] = useState<string | null>(null);
  const { getToolTranslation, getUITranslation, getToolPageTranslation } = useToolTranslations();
  const { t } = useLanguage();
  const toolTranslation = getToolTranslation('text-case');
  const ui = getUITranslation();
  const pageTranslation = getToolPageTranslation('text-case');

  const convertCase = useCallback((type: string) => {
    setActiveConversion(type);
    let result = '';
    
    switch (type) {
      case 'uppercase':
        result = inputText.toUpperCase();
        break;
      case 'lowercase':
        result = inputText.toLowerCase();
        break;
      case 'capitalize':
        result = inputText.replace(/\b\w/g, (char) => char.toUpperCase());
        break;
      case 'titlecase':
        result = inputText.replace(/\b\w+/g, (word) => 
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        );
        break;
      case 'camelcase':
        result = inputText.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
          return index === 0 ? word.toLowerCase() : word.toUpperCase();
        }).replace(/\s+/g, '');
        break;
      case 'snakecase':
        result = inputText.toLowerCase().replace(/\s+/g, '_').replace(/[^\w_]/g, '');
        break;
      case 'kebabcase':
        result = inputText.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        break;
      case 'alternating':
        result = inputText.split('').map((char, index) => 
          index % 2 === 0 ? char.toUpperCase() : char.toLowerCase()
        ).join('');
        break;
      case 'inverse':
        result = inputText.split('').map(char => 
          char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase()
        ).join('');
        break;
      default:
        result = inputText;
    }
    
    setOutputText(result);
    setTimeout(() => setActiveConversion(null), 300);
  }, [inputText]);

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
    setActiveConversion(null);
  };

  const downloadText = () => {
    if (outputText) {
      const blob = new Blob([outputText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'converted_text.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setInputText(text);
      };
      reader.readAsText(file);
    }
  };

  const caseTypes = [
    { id: 'uppercase', name: '全部大写', description: 'HELLO WORLD', example: 'HELLO WORLD' },
    { id: 'lowercase', name: '全部小写', description: 'hello world', example: 'hello world' },
    { id: 'capitalize', name: '首字母大写', description: 'Hello World', example: 'Hello World' },
    { id: 'titlecase', name: '标题格式', description: 'Hello World', example: 'Hello World' },
    { id: 'camelcase', name: '驼峰命名', description: 'helloWorld', example: 'helloWorld' },
    { id: 'snakecase', name: '下划线命名', description: 'hello_world', example: 'hello_world' },
    { id: 'kebabcase', name: '短横线命名', description: 'hello-world', example: 'hello-world' },
    { id: 'alternating', name: '交替大小写', description: 'HeLlO wOrLd', example: 'HeLlO wOrLd' },
    { id: 'inverse', name: '反转大小写', description: 'hELLO wORLD', example: 'hELLO wORLD' },
  ];

  const textStats = {
    characters: inputText.length,
    charactersNoSpaces: inputText.replace(/\s/g, '').length,
    words: inputText.trim() ? inputText.trim().split(/\s+/).length : 0,
    lines: inputText.split('\n').length,
    paragraphs: inputText.split(/\n\s*\n/).filter(p => p.trim()).length
  };

  return (
    <ToolLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 页面标题 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            文本格式转换工具
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            快速转换文本大小写、驼峰命名等格式，支持9种常用格式转换
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* 输入区域 */}
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  输入文本
                </h2>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="flex items-center px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-lg transition-colors">
                      <Upload className="w-4 h-4 mr-2" />
                      上传文件
                    </div>
                  </label>
                </div>
              </div>
              
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="请输入需要转换的文本..."
                className="w-full h-48 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono leading-relaxed"
              />
              
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={clearText}
                  className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  清空
                </button>
                
                {/* 文本统计 */}
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>{textStats.characters} 字符</span>
                  <span>{textStats.words} 单词</span>
                  <span>{textStats.lines} 行</span>
                </div>
              </div>
            </div>

            {/* 输出区域 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  转换结果
                </h2>
                {outputText && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(outputText)}
                      className="flex items-center px-3 py-2 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/40 text-green-700 dark:text-green-300 rounded-lg transition-colors"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      复制
                    </button>
                    <button
                      onClick={downloadText}
                      className="flex items-center px-3 py-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      下载
                    </button>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-h-48">
                {outputText ? (
                  <pre className="text-gray-900 dark:text-white whitespace-pre-wrap text-sm font-mono leading-relaxed">
                    {outputText}
                  </pre>
                ) : (
                  <div className="flex items-center justify-center h-40 text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📝</div>
                      <p>选择转换格式后，结果将显示在这里</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 转换选项和统计 */}
          <div className="space-y-6">
            {/* 转换选项 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                转换格式
              </h3>
              
              <div className="space-y-3">
                {caseTypes.map((type, index) => (
                  <button
                    key={type.id}
                    onClick={() => convertCase(type.id)}
                    disabled={!inputText}
                    className={`w-full p-4 text-left border rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                      activeConversion === type.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {type.name}
                      </span>
                      {activeConversion === type.id && (
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      )}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                      {type.example}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 文本统计 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                文本统计
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">字符数</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{textStats.characters}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">字符数（不含空格）</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{textStats.charactersNoSpaces}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">单词数</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{textStats.words}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">行数</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{textStats.lines}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">段落数</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{textStats.paragraphs}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4 flex items-center">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-sm">💡</span>
            </div>
            使用说明
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-700 dark:text-blue-300 text-sm">
            <div>
              <h4 className="font-medium mb-2">基本操作：</h4>
              <ul className="space-y-1">
                <li>• 在输入框中粘贴或输入文本</li>
                <li>• 选择需要的转换格式</li>
                <li>• 复制或下载转换结果</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">高级功能：</h4>
              <ul className="space-y-1">
                <li>• 支持上传txt文件</li>
                <li>• 实时显示文本统计信息</li>
                <li>• 支持批量文本处理</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
