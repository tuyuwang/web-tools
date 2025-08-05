'use client';

import { useState } from 'react';
import { Copy, FileText, Sparkles, RefreshCw, Download } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';

export default function TextSummaryPage() {
  const [inputText, setInputText] = useState('');
  const [summaryText, setSummaryText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [summaryLength, setSummaryLength] = useState('medium');

  const handleSummarize = async () => {
    if (!inputText.trim()) return;
    
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟AI处理延迟
    
    // 简单的摘要生成逻辑（实际应用中应该调用AI API）
    const sentences = inputText.split(/[。！？.!?]+/).filter(s => s.trim().length > 0);
    let summaryLength_num = 1;
    
    switch (summaryLength) {
      case 'short':
        summaryLength_num = Math.max(1, Math.floor(sentences.length * 0.2));
        break;
      case 'medium':
        summaryLength_num = Math.max(1, Math.floor(sentences.length * 0.4));
        break;
      case 'long':
        summaryLength_num = Math.max(1, Math.floor(sentences.length * 0.6));
        break;
    }
    
    const selectedSentences = sentences
      .slice(0, summaryLength_num)
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    const summary = selectedSentences.join('。') + (selectedSentences.length > 0 ? '。' : '');
    setSummaryText(summary || '无法生成摘要，请检查输入文本。');
    setIsGenerating(false);
  };

  const handleCopy = async () => {
    if (summaryText) {
      await navigator.clipboard.writeText(summaryText);
    }
  };

  const handleDownload = () => {
    if (summaryText) {
      const blob = new Blob([summaryText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'text-summary.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleClear = () => {
    setInputText('');
    setSummaryText('');
  };

  return (
    <ToolLayout>
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* 页面标题 */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center space-x-2">
            <Sparkles className="h-8 w-8 text-blue-600" />
            <span>智能摘要</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            提取文本关键信息，生成简洁摘要，支持多种摘要长度选择
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 输入区域 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                输入文本
              </h3>
            </div>
            
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="请输入需要生成摘要的文本内容..."
              className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            />
            
            <div className="text-sm text-gray-500 dark:text-gray-400">
              字符数: {inputText.length}
            </div>
          </div>

          {/* 设置和结果区域 */}
          <div className="space-y-4">
            {/* 摘要长度设置 */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                摘要长度
              </h3>
              <div className="flex space-x-2">
                {[
                  { key: 'short', label: '简短', desc: '约20%' },
                  { key: 'medium', label: '中等', desc: '约40%' },
                  { key: 'long', label: '详细', desc: '约60%' }
                ].map((option) => (
                  <button
                    key={option.key}
                    onClick={() => setSummaryLength(option.key)}
                    className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                      summaryLength === option.key
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className={`font-medium ${
                      summaryLength === option.key ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'
                    }`}>
                      {option.label}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {option.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex space-x-3">
              <button
                onClick={handleSummarize}
                disabled={!inputText.trim() || isGenerating}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? '生成中...' : '生成摘要'}</span>
              </button>
              
              <button
                onClick={handleClear}
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              >
                清空
              </button>
            </div>

            {/* 摘要结果 */}
            {summaryText && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    摘要结果
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCopy}
                      className="flex items-center space-x-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                      <span>复制</span>
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex items-center space-x-1 px-3 py-2 text-sm bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/40 text-green-700 dark:text-green-300 rounded-lg transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      <span>下载</span>
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <p className="text-gray-900 dark:text-gray-100 leading-relaxed">
                    {summaryText}
                  </p>
                </div>
                
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  摘要长度: {summaryText.length} 个字符
                  {inputText && ` (压缩率: ${Math.round((1 - summaryText.length / inputText.length) * 100)}%)`}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 使用说明 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">使用说明</h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• 输入需要摘要的文本内容</li>
            <li>• 选择合适的摘要长度</li>
            <li>• 点击"生成摘要"按钮</li>
            <li>• 支持复制和下载摘要结果</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}