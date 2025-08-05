'use client';

import { useState } from 'react';
import { Brain, Globe, Check, AlertCircle } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';

interface LanguageResult {
  language: string;
  name: string;
  confidence: number;
  flag: string;
}

export default function LanguageDetectPage() {
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState<LanguageResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const detectLanguage = (text: string): LanguageResult[] => {
    const results: LanguageResult[] = [];
    
    // 简单的语言检测逻辑
    if (/[\u4e00-\u9fff]/.test(text)) {
      results.push({ language: 'chinese', name: '中文', confidence: 85, flag: '🇨🇳' });
    }
    if (/[a-zA-Z]/.test(text)) {
      results.push({ language: 'english', name: '英语', confidence: 80, flag: '🇺🇸' });
    }
    if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) {
      results.push({ language: 'japanese', name: '日语', confidence: 90, flag: '🇯🇵' });
    }
    if (/[\uac00-\ud7af]/.test(text)) {
      results.push({ language: 'korean', name: '韩语', confidence: 88, flag: '🇰🇷' });
    }
    
    return results.sort((a, b) => b.confidence - a.confidence);
  };

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    
    setIsAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const detectionResults = detectLanguage(inputText);
    setResults(detectionResults);
    setIsAnalyzing(false);
  };

  const handleClear = () => {
    setInputText('');
    setResults([]);
  };

  return (
    <ToolLayout>
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            语言检测
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            自动识别文本的语言类型，支持中文、英语、日语、韩语等多种语言
          </p>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              输入要检测的文本
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="请输入要检测语言的文本内容..."
              className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white resize-none"
            />
            <div className="text-sm text-gray-500 dark:text-gray-400">
              字符数: {inputText.length}
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleAnalyze}
              disabled={!inputText.trim() || isAnalyzing}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Brain className={`h-4 w-4 ${isAnalyzing ? 'animate-pulse' : ''}`} />
              <span>{isAnalyzing ? '检测中...' : '检测语言'}</span>
            </button>
            <button
              onClick={handleClear}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            >
              清除
            </button>
          </div>

          {results.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>检测结果</span>
              </h3>
              
              <div className="space-y-3">
                {results.map((result, index) => (
                  <div
                    key={result.language}
                    className={`p-4 rounded-lg border-2 ${
                      index === 0 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{result.flag}</span>
                        <div>
                          <div className={`font-semibold ${
                            index === 0 ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'
                          }`}>
                            {result.name}
                            {index === 0 && (
                              <span className="ml-2 text-sm bg-blue-500 text-white px-2 py-1 rounded-full">
                                最可能
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            语言代码: {result.language}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          <Check className="h-4 w-4" />
                          <span>{result.confidence}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              试试这些示例文本
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { lang: '中文', text: '这是一个中文文本示例，用于测试语言检测功能。' },
                { lang: 'English', text: 'This is an English text sample for testing language detection.' },
                { lang: '日本語', text: 'これは言語検出をテストするための日本語のサンプルテキストです。' },
                { lang: '한국어', text: '이것은 언어 감지를 테스트하기 위한 한국어 샘플 텍스트입니다.' }
              ].map((example) => (
                <button
                  key={example.lang}
                  onClick={() => setInputText(example.text)}
                  className="text-left p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                >
                  <div className="font-medium text-gray-900 dark:text-white mb-1">
                    {example.lang}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {example.text}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}