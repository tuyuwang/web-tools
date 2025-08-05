'use client';

import { useState, useEffect } from 'react';
import { Copy, RotateCcw, Upload, Download, FileText, Zap, Eye, AlertCircle, CheckCircle } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';
import { useToolTranslations } from '@/components/tool-translations';
import { useLanguage } from '@/components/language-provider';

interface EncodingFormat {
  id: string;
  name: string;
  description: string;
  category: string;
  encode: (text: string) => string;
  decode: (text: string) => string;
  validate?: (text: string) => boolean;
}

interface BatchItem {
  id: string;
  input: string;
  output: string;
  format: string;
  mode: 'encode' | 'decode';
  status: 'pending' | 'completed' | 'error';
  error?: string;
}

export default function TextEncodePage() {
  const { getToolTranslation, getUITranslation } = useToolTranslations();
  const toolTranslation = getToolTranslation('text-encode');
  const ui = getUITranslation();
  const { t } = useLanguage();
  
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [selectedFormat, setSelectedFormat] = useState<string>('base64');
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [detectedFormat, setDetectedFormat] = useState<string>('');
  const [autoDetect, setAutoDetect] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 编码格式定义
  const encodingFormats: EncodingFormat[] = [
    {
      id: 'base64',
      name: 'Base64',
      description: '用于在文本协议中传输二进制数据',
      category: '通用',
      encode: (text: string) => btoa(unescape(encodeURIComponent(text))),
      decode: (text: string) => decodeURIComponent(escape(atob(text))),
      validate: (text: string) => /^[A-Za-z0-9+/]*={0,2}$/.test(text)
    },
    {
      id: 'url',
      name: 'URL编码',
      description: 'URL安全的字符编码',
      category: 'Web',
      encode: (text: string) => encodeURIComponent(text),
      decode: (text: string) => decodeURIComponent(text),
      validate: (text: string) => /^[A-Za-z0-9\-_.~%]*$/.test(text)
    },
    {
      id: 'html',
      name: 'HTML实体',
      description: 'HTML特殊字符转义',
      category: 'Web',
      encode: (text: string) => text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/\n/g, '<br>')
        .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;'),
      decode: (text: string) => text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/<br>/g, '\n')
        .replace(/&nbsp;/g, ' '),
      validate: (text: string) => /^[^<>&"']*$/.test(text) || /&[a-zA-Z]+;/.test(text)
    },
    {
      id: 'unicode',
      name: 'Unicode转义',
      description: 'Unicode字符转义序列',
      category: '编程',
      encode: (text: string) => text.split('').map(char => 
        char.charCodeAt(0) > 127 ? '\\u' + char.charCodeAt(0).toString(16).padStart(4, '0') : char
      ).join(''),
      decode: (text: string) => text.replace(/\\u([0-9a-fA-F]{4})/g, (match, code) => 
        String.fromCharCode(parseInt(code, 16))
      ),
      validate: (text: string) => /^[\\u0-9a-fA-F]*$/.test(text.replace(/[^\\\u]/g, ''))
    },
    {
      id: 'hex',
      name: '十六进制',
      description: '字符的十六进制表示',
      category: '编程',
      encode: (text: string) => text.split('').map(char => 
        char.charCodeAt(0).toString(16).padStart(2, '0')
      ).join(' '),
      decode: (text: string) => text.split(' ').map(hex => 
        String.fromCharCode(parseInt(hex, 16))
      ).join(''),
      validate: (text: string) => /^[0-9a-fA-F\s]*$/.test(text)
    },
    {
      id: 'binary',
      name: '二进制',
      description: '字符的二进制表示',
      category: '编程',
      encode: (text: string) => text.split('').map(char => 
        char.charCodeAt(0).toString(2).padStart(8, '0')
      ).join(' '),
      decode: (text: string) => text.split(' ').map(bin => 
        String.fromCharCode(parseInt(bin, 2))
      ).join(''),
      validate: (text: string) => /^[01\s]*$/.test(text)
    },
    {
      id: 'morse',
      name: '摩尔斯电码',
      description: '经典的摩尔斯电码',
      category: '通信',
      encode: (text: string) => {
        const morseMap: { [key: string]: string } = {
          'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
          'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
          'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
          'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
          'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
          '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
          '8': '---..', '9': '----.', ' ': '/'
        };
        return text.toUpperCase().split('').map(char => morseMap[char] || char).join(' ');
      },
      decode: (text: string) => {
        const morseMap: { [key: string]: string } = {
          '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E', '..-.': 'F',
          '--.': 'G', '....': 'H', '..': 'I', '.---': 'J', '-.-': 'K', '.-..': 'L',
          '--': 'M', '-.': 'N', '---': 'O', '.--.': 'P', '--.-': 'Q', '.-.': 'R',
          '...': 'S', '-': 'T', '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X',
          '-.--': 'Y', '--..': 'Z', '-----': '0', '.----': '1', '..---': '2',
          '...--': '3', '....-': '4', '.....': '5', '-....': '6', '--...': '7',
          '---..': '8', '----.': '9', '/': ' '
        };
        return text.split(' ').map(code => morseMap[code] || code).join('');
      },
      validate: (text: string) => /^[\.\-\s\/]*$/.test(text)
    },
    {
      id: 'jwt',
      name: 'JWT解码',
      description: 'JSON Web Token解码（仅解码Header和Payload）',
      category: '安全',
      encode: (text: string) => text, // JWT编码需要密钥，这里不实现
      decode: (text: string) => {
        try {
          const parts = text.split('.');
          if (parts.length !== 3) throw new Error('Invalid JWT format');
          
          const header = JSON.parse(atob(parts[0]));
          const payload = JSON.parse(atob(parts[1]));
          
          return JSON.stringify({ header, payload }, null, 2);
        } catch (error) {
          throw new Error('Invalid JWT token');
        }
      },
      validate: (text: string) => {
        const parts = text.split('.');
        return parts.length === 3 && parts.every(part => /^[A-Za-z0-9_-]+$/.test(part));
      }
    }
  ];

  // 格式检测
  const detectFormat = useCallback((text: string): string => {
    if (!text.trim()) return '';
    
    for (const format of encodingFormats) {
      if (format.validate && format.validate(text)) {
        return format.id;
      }
    }
    return '';
  }, []);

  // 自动检测格式
  useEffect(() => {
    if (autoDetect && inputText && mode === 'decode') {
      const detected = detectFormat(inputText);
      setDetectedFormat(detected);
    } else {
      setDetectedFormat('');
    }
  }, [inputText, mode, autoDetect, detectFormat]);

  const getFormat = (id: string) => encodingFormats.find(f => f.id === id);

  const transformText = () => {
    if (!inputText) return;

    const format = getFormat(selectedFormat);
    if (!format) return;

    let result = '';
    try {
      if (mode === 'encode') {
        result = format.encode(inputText);
      } else {
        result = format.decode(inputText);
      }
      setOutputText(result);
    } catch (error) {
      setOutputText(`转换失败：${error instanceof Error ? error.message : '输入格式不正确'}`);
    }
  };

  const handleCopy = async () => {
    if (outputText && navigator.clipboard) {
      await navigator.clipboard.writeText(outputText);
    }
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setBatchItems([]);
    setDetectedFormat('');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setInputText(content);
      };
      reader.readAsText(file);
    }
  };

  const downloadResult = () => {
    if (!outputText) return;
    
    const blob = new Blob([outputText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${mode}-${selectedFormat}-result.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 批量处理
  const processBatch = () => {
    const items = inputText.split('\n').filter(line => line.trim());
    const format = getFormat(selectedFormat);
    if (!format || items.length === 0) return;

    const newBatchItems: BatchItem[] = items.map((item, index) => {
      try {
        const result = mode === 'encode' ? format.encode(item) : format.decode(item);
        return {
          id: `${Date.now()}-${index}`,
          input: item,
          output: result,
          format: selectedFormat,
          mode,
          status: 'completed'
        };
      } catch (error) {
        return {
          id: `${Date.now()}-${index}`,
          input: item,
          output: '',
          format: selectedFormat,
          mode,
          status: 'error',
          error: error instanceof Error ? error.message : '转换失败'
        };
      }
    });

    setBatchItems(newBatchItems);
    
    // 设置输出为成功转换的结果
    const successResults = newBatchItems
      .filter(item => item.status === 'completed')
      .map(item => item.output);
    setOutputText(successResults.join('\n'));
  };

  const downloadBatchResults = () => {
    const successItems = batchItems.filter(item => item.status === 'completed');
    const content = successItems.map(item => item.output).join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch-${mode}-${selectedFormat}-results.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 按类别分组格式
  const formatsByCategory = encodingFormats.reduce((acc, format) => {
    if (!acc[format.category]) {
      acc[format.category] = [];
    }
    acc[format.category].push(format);
    return acc;
  }, {} as Record<string, EncodingFormat[]>);

  const currentFormat = getFormat(selectedFormat);

  return (
    <ToolLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {toolTranslation.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            支持多种编码格式、批量处理、文件导入导出等功能
          </p>
        </div>

        {/* 工具栏 */}
        <div className="flex flex-wrap gap-4 justify-center items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setMode('encode')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === 'encode'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              编码
            </button>
            <button
              onClick={() => setMode('decode')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === 'decode'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              解码
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="batchMode"
              checked={isBatchMode}
              onChange={(e) => setIsBatchMode(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="batchMode" className="text-sm text-gray-700 dark:text-gray-300">
              批量模式
            </label>
          </div>

          {mode === 'decode' && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoDetect"
                checked={autoDetect}
                onChange={(e) => setAutoDetect(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="autoDetect" className="text-sm text-gray-700 dark:text-gray-300">
                自动检测格式
              </label>
            </div>
          )}
        </div>

        {/* 格式检测提示 */}
        {detectedFormat && mode === 'decode' && (
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-green-800 dark:text-green-200">
                检测到格式: <strong>{getFormat(detectedFormat)?.name}</strong>
              </span>
              <button
                onClick={() => setSelectedFormat(detectedFormat)}
                className="ml-auto btn bg-green-600 hover:bg-green-700 text-white text-sm"
              >
                使用此格式
              </button>
            </div>
          </div>
        )}

        {/* 格式选择 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            选择编码格式
          </h2>
          
          <div className="space-y-4">
            {Object.entries(formatsByCategory).map(([category, formats]) => (
              <div key={category}>
                <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {category}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {formats.map((format) => (
                    <button
                      key={format.id}
                      onClick={() => setSelectedFormat(format.id)}
                      className={`p-3 border rounded-lg text-left transition-colors ${
                        selectedFormat === format.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600'
                      }`}
                    >
                      <div className="font-medium text-gray-900 dark:text-white text-sm">
                        {format.name}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {format.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 输入输出区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                输入文本
              </h3>
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.json,.xml,.html,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn bg-gray-600 hover:bg-gray-700 text-white text-sm"
                >
                  <Upload className="w-4 h-4 mr-1" />
                  上传文件
                </button>
              </div>
            </div>
            
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isBatchMode ? "每行一个要转换的文本..." : "在此输入要转换的文本..."}
              className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>
                {isBatchMode ? `${inputText.split('\n').filter(line => line.trim()).length} 行` : `${inputText.length} 字符`}
              </span>
              {currentFormat && (
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {currentFormat.name}
                </span>
              )}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={isBatchMode ? processBatch : transformText}
                disabled={!inputText}
                className="btn bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Zap className="w-4 h-4 mr-1" />
                {isBatchMode ? '批量转换' : (mode === 'encode' ? '编码' : '解码')}
              </button>
              <button
                onClick={handleClear}
                className="btn bg-gray-600 hover:bg-gray-700 text-white"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                清空
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                转换结果
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  disabled={!outputText}
                  className="btn bg-green-600 hover:bg-green-700 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  复制
                </button>
                <button
                  onClick={downloadResult}
                  disabled={!outputText}
                  className="btn bg-purple-600 hover:bg-purple-700 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4 mr-1" />
                  下载
                </button>
              </div>
            </div>
            
            <textarea
              value={outputText}
              readOnly
              placeholder="转换结果将显示在这里..."
              className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            />
            
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {outputText.length} 字符
            </div>
          </div>
        </div>

        {/* 批量处理结果 */}
        {isBatchMode && batchItems.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                批量处理结果 ({batchItems.length})
              </h2>
              <div className="flex gap-2">
                {batchItems.some(item => item.status === 'completed') && (
                  <button
                    onClick={downloadBatchResults}
                    className="btn bg-green-600 hover:bg-green-700 text-white text-sm"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    下载成功结果
                  </button>
                )}
                <button
                  onClick={() => setBatchItems([])}
                  className="btn bg-gray-600 hover:bg-gray-700 text-white text-sm"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  清空结果
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {batchItems.map((item) => (
                <div key={item.id} className={`p-3 rounded-lg border ${
                  item.status === 'completed' 
                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                    : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        输入: {item.input}
                      </div>
                      {item.status === 'completed' ? (
                        <div className="text-sm text-gray-900 dark:text-white font-mono truncate">
                          输出: {item.output}
                        </div>
                      ) : (
                        <div className="text-sm text-red-600 dark:text-red-400">
                          错误: {item.error}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      {item.status === 'completed' ? (
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                      )}
                      {item.status === 'completed' && (
                        <button
                          onClick={() => navigator.clipboard?.writeText(item.output)}
                          className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              成功: {batchItems.filter(item => item.status === 'completed').length} / 
              失败: {batchItems.filter(item => item.status === 'error').length} / 
              总计: {batchItems.length}
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
                <li>• 支持多种常用编码格式</li>
                <li>• 自动检测输入格式</li>
                <li>• 文件导入和结果导出</li>
                <li>• 批量处理多行文本</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">支持格式</h4>
              <ul className="space-y-1 text-blue-700 dark:text-blue-300 text-sm">
                <li>• Base64、URL编码、HTML实体</li>
                <li>• Unicode转义、十六进制</li>
                <li>• 二进制、摩尔斯电码</li>
                <li>• JWT解码（仅Header和Payload）</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
