'use client';

import { useState } from 'react';
import { Copy, FileText, TrendingUp, RefreshCw, Download, Heart, Frown, Meh } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';

interface SentimentResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  score: number;
  keywords: string[];
}

export default function SentimentAnalysisPage() {
  const [inputText, setInputText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<SentimentResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeSentiment = (text: string): SentimentResult => {
    // 简单的情感分析逻辑（实际应用中应该调用AI API）
    const positiveWords = ['好', '棒', '优秀', '喜欢', '满意', '开心', '快乐', '美好', '成功', '赞', '爱', '完美', 'excellent', 'good', 'great', 'love', 'happy', 'amazing', 'wonderful', 'perfect', 'awesome'];
    const negativeWords = ['差', '坏', '糟糕', '讨厌', '失望', '难过', '痛苦', '失败', '错误', '问题', 'bad', 'terrible', 'awful', 'hate', 'sad', 'disappointed', 'angry', 'horrible', 'worst', 'disgusting'];
    
    const words = text.toLowerCase().split(/\s+/);
    let positiveScore = 0;
    let negativeScore = 0;
    const foundKeywords: string[] = [];
    
    words.forEach(word => {
      if (positiveWords.some(pw => word.includes(pw))) {
        positiveScore++;
        foundKeywords.push(word);
      }
      if (negativeWords.some(nw => word.includes(nw))) {
        negativeScore++;
        foundKeywords.push(word);
      }
    });
    
    const totalScore = positiveScore - negativeScore;
    const confidence = Math.min(Math.abs(totalScore) / words.length * 10, 1);
    
    let sentiment: 'positive' | 'negative' | 'neutral';
    if (totalScore > 0) {
      sentiment = 'positive';
    } else if (totalScore < 0) {
      sentiment = 'negative';
    } else {
      sentiment = 'neutral';
    }
    
    return {
      sentiment,
      confidence: Math.max(0.3, confidence), // 最小置信度30%
      score: totalScore,
      keywords: Array.from(new Set(foundKeywords)).slice(0, 10)
    };
  };

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    
    setIsAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 800)); // 模拟AI处理延迟
    
    const result = analyzeSentiment(inputText);
    setAnalysisResult(result);
    setIsAnalyzing(false);
  };

  const handleCopy = async () => {
    if (analysisResult) {
      const result = `情感分析结果：
情感倾向: ${getSentimentLabel(analysisResult.sentiment)}
置信度: ${Math.round(analysisResult.confidence * 100)}%
情感得分: ${analysisResult.score}
关键词: ${analysisResult.keywords.join(', ')}`;
      await navigator.clipboard.writeText(result);
    }
  };

  const handleDownload = () => {
    if (analysisResult) {
      const result = `情感分析结果

原文本:
${inputText}

分析结果:
情感倾向: ${getSentimentLabel(analysisResult.sentiment)}
置信度: ${Math.round(analysisResult.confidence * 100)}%
情感得分: ${analysisResult.score}
关键词: ${analysisResult.keywords.join(', ')}

分析时间: ${new Date().toLocaleString()}`;
      
      const blob = new Blob([result], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sentiment-analysis.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleClear = () => {
    setInputText('');
    setAnalysisResult(null);
  };

  const getSentimentLabel = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '积极';
      case 'negative': return '消极';
      case 'neutral': return '中性';
      default: return '未知';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return Heart;
      case 'negative': return Frown;
      case 'neutral': return Meh;
      default: return Meh;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'negative': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'neutral': return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <ToolLayout>
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* 页面标题 */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center space-x-2">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <span>情感分析</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            分析文本的情感倾向和语调，识别积极、消极或中性情感
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
              placeholder="请输入需要分析情感的文本内容..."
              className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            />
            
            <div className="text-sm text-gray-500 dark:text-gray-400">
              字符数: {inputText.length}
            </div>

            {/* 操作按钮 */}
            <div className="flex space-x-3">
              <button
                onClick={handleAnalyze}
                disabled={!inputText.trim() || isAnalyzing}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                <span>{isAnalyzing ? '分析中...' : '开始分析'}</span>
              </button>
              
              <button
                onClick={handleClear}
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              >
                清空
              </button>
            </div>
          </div>

          {/* 分析结果区域 */}
          <div className="space-y-4">
            {analysisResult ? (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    分析结果
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

                {/* 情感倾向 */}
                <div className={`p-4 rounded-lg ${getSentimentColor(analysisResult.sentiment)}`}>
                  <div className="flex items-center space-x-3">
                    {(() => {
                      const IconComponent = getSentimentIcon(analysisResult.sentiment);
                      return <IconComponent className="h-8 w-8" />;
                    })()}
                    <div>
                      <div className="text-lg font-semibold">
                        {getSentimentLabel(analysisResult.sentiment)}情感
                      </div>
                      <div className="text-sm opacity-80">
                        置信度: {Math.round(analysisResult.confidence * 100)}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* 详细指标 */}
                <div className="space-y-3">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">情感得分</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{analysisResult.score}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          analysisResult.score > 0 ? 'bg-green-500' : 
                          analysisResult.score < 0 ? 'bg-red-500' : 'bg-gray-400'
                        }`}
                        style={{ width: `${Math.min(Math.abs(analysisResult.score) * 20, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">置信度</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{Math.round(analysisResult.confidence * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${analysisResult.confidence * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* 关键词 */}
                {analysisResult.keywords.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">关键词</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.keywords.map((keyword, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-400 dark:text-gray-600">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>输入文本后点击"开始分析"查看结果</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 使用说明 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">使用说明</h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• 输入需要分析的文本内容</li>
            <li>• 点击"开始分析"按钮进行情感分析</li>
            <li>• 查看情感倾向、置信度和关键词</li>
            <li>• 支持复制和下载分析结果</li>
            <li>• 支持中英文文本分析</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}