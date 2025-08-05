'use client';

import { useState } from 'react';
import { Hash, Tag, TrendingUp, Copy, Download } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';

interface Keyword {
  word: string;
  frequency: number;
  score: number;
  type: 'single' | 'phrase';
}

const stopWords = new Set([
  // 中文停用词
  '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这', '那', '来', '过', '时候', '现在', '可以', '什么', '知道', '那么', '这样', '不是', '怎么', '或者', '因为', '所以', '但是', '如果', '这个', '那个', '他们', '我们', '她们',
  // 英文停用词
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'can', 'may', 'might', 'must', 'shall', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their'
]);

export default function KeywordExtractPage() {
  const [inputText, setInputText] = useState('');
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [minLength, setMinLength] = useState(2);
  const [maxResults, setMaxResults] = useState(20);
  const [includePhrase, setIncludePhrase] = useState(true);

  const extractKeywords = (text: string): Keyword[] => {
    if (!text.trim()) return [];

    const cleanText = text.toLowerCase()
      .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, ' ') // 保留中文、英文、数字和空格
      .replace(/\s+/g, ' ')
      .trim();

    const words = cleanText.split(' ').filter(word => 
      word.length >= minLength && !stopWords.has(word)
    );

    // 统计单词频率
    const wordFreq = new Map<string, number>();
    words.forEach(word => {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    });

    // 提取单个关键词
    const singleKeywords: Keyword[] = Array.from(wordFreq.entries())
      .map(([word, frequency]) => ({
        word,
        frequency,
        score: frequency * word.length, // 简单的评分算法
        type: 'single' as const
      }));

    let allKeywords = [...singleKeywords];

    // 提取短语（如果启用）
    if (includePhrase) {
      const phrases = extractPhrases(words);
      allKeywords = [...allKeywords, ...phrases];
    }

    // 按评分排序并限制结果数量
    return allKeywords
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);
  };

  const extractPhrases = (words: string[]): Keyword[] => {
    const phrases = new Map<string, number>();
    
    // 提取2-3个词的短语
    for (let len = 2; len <= 3; len++) {
      for (let i = 0; i <= words.length - len; i++) {
        const phrase = words.slice(i, i + len).join(' ');
        if (phrase.length >= minLength * len) {
          phrases.set(phrase, (phrases.get(phrase) || 0) + 1);
        }
      }
    }

    return Array.from(phrases.entries())
      .filter(([_, frequency]) => frequency >= 2) // 至少出现2次
      .map(([phrase, frequency]) => ({
        word: phrase,
        frequency,
        score: frequency * phrase.length * 1.5, // 短语权重更高
        type: 'phrase' as const
      }));
  };

  const handleExtract = async () => {
    if (!inputText.trim()) return;

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 800)); // 模拟处理延迟

    const extractedKeywords = extractKeywords(inputText);
    setKeywords(extractedKeywords);
    setIsProcessing(false);
  };

  const handleClear = () => {
    setInputText('');
    setKeywords([]);
  };

  const handleCopyKeywords = async () => {
    const keywordText = keywords.map(k => k.word).join(', ');
    await navigator.clipboard.writeText(keywordText);
  };

  const handleDownloadKeywords = () => {
    const content = keywords.map(k => 
      `${k.word}\t${k.frequency}\t${k.score.toFixed(1)}\t${k.type}`
    ).join('\n');
    const header = '关键词\t频率\t评分\t类型\n';
    
    const blob = new Blob([header + content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'keywords.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getKeywordColor = (type: string) => {
    return type === 'phrase' 
      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' 
      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const ratio = score / maxScore;
    if (ratio >= 0.8) return 'text-green-600 dark:text-green-400';
    if (ratio >= 0.6) return 'text-yellow-600 dark:text-yellow-400';
    if (ratio >= 0.4) return 'text-orange-600 dark:text-orange-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const maxScore = keywords.length > 0 ? Math.max(...keywords.map(k => k.score)) : 1;

  return (
    <ToolLayout>
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* 页面标题 */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            关键词提取
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            从文本中智能提取关键词和短语，支持中英文混合文本，提供频率统计和重要性评分
          </p>
        </div>
        
        <div className="space-y-6">
        {/* 输入区域 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            输入要分析的文本
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="请输入要提取关键词的文本内容..."
            className="w-full h-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white resize-none"
          />
          <div className="text-sm text-gray-500 dark:text-gray-400">
            字符数: {inputText.length} | 词数: {inputText.trim().split(/\s+/).filter(w => w).length}
          </div>
        </div>

        {/* 设置选项 */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
          <h3 className="font-medium text-gray-900 dark:text-white">提取设置</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                最小长度: {minLength}
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={minLength}
                onChange={(e) => setMinLength(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                最大结果数: {maxResults}
              </label>
              <input
                type="range"
                min="10"
                max="50"
                value={maxResults}
                onChange={(e) => setMaxResults(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includePhrase"
                checked={includePhrase}
                onChange={(e) => setIncludePhrase(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="includePhrase" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                包含短语
              </label>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex space-x-4">
          <button
            onClick={handleExtract}
            disabled={!inputText.trim() || isProcessing}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <Hash className={`h-4 w-4 ${isProcessing ? 'animate-pulse' : ''}`} />
            <span>{isProcessing ? '提取中...' : '提取关键词'}</span>
          </button>
          <button
            onClick={handleClear}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
          >
            清除
          </button>
        </div>

        {/* 提取结果 */}
        {keywords.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                <Tag className="h-5 w-5" />
                <span>关键词结果 ({keywords.length})</span>
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={handleCopyKeywords}
                  className="flex items-center space-x-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                  <Copy className="h-4 w-4" />
                  <span>复制</span>
                </button>
                <button
                  onClick={handleDownloadKeywords}
                  className="flex items-center space-x-1 px-3 py-2 text-sm bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/40 text-green-700 dark:text-green-300 rounded-lg transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>下载</span>
                </button>
              </div>
            </div>

            {/* 关键词云 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getKeywordColor(keyword.type)}`}
                    style={{ 
                      fontSize: `${Math.max(0.75, Math.min(1.25, keyword.score / maxScore + 0.5))}rem`
                    }}
                  >
                    {keyword.word}
                    <span className="ml-1 text-xs opacity-75">
                      {keyword.frequency}
                    </span>
                  </span>
                ))}
              </div>
            </div>

            {/* 详细列表 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-900 dark:text-white">详细统计</h4>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {keywords.slice(0, 10).map((keyword, index) => (
                  <div key={index} className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-medium text-gray-600 dark:text-gray-400">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {keyword.word}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {keyword.type === 'phrase' ? '短语' : '单词'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          频率: {keyword.frequency}
                        </div>
                        <div className={`text-sm ${getScoreColor(keyword.score, maxScore)}`}>
                          评分: {keyword.score.toFixed(1)}
                        </div>
                      </div>
                      <div className="w-16">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="h-2 bg-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${(keyword.score / maxScore) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 统计信息 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {keywords.filter(k => k.type === 'single').length}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">单词</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {keywords.filter(k => k.type === 'phrase').length}
                </div>
                <div className="text-sm text-purple-600 dark:text-purple-400">短语</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {Math.max(...keywords.map(k => k.frequency))}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">最高频率</div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {maxScore.toFixed(1)}
                </div>
                <div className="text-sm text-orange-600 dark:text-orange-400">最高评分</div>
              </div>
            </div>
          </div>
        )}

        {/* 示例文本 */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            试试这些示例文本
          </h3>
          <div className="space-y-3">
            {[
              {
                title: '技术文档',
                text: '人工智能和机器学习技术正在快速发展，深度学习算法在计算机视觉、自然语言处理等领域取得了突破性进展。神经网络模型的训练需要大量的数据和计算资源。'
              },
              {
                title: '商业报告',
                text: 'The company achieved significant growth in revenue and market share this quarter. Digital transformation initiatives have improved operational efficiency and customer satisfaction. Strategic partnerships and innovative products continue to drive business success.'
              }
            ].map((example, index) => (
              <button
                key={index}
                onClick={() => setInputText(example.text)}
                className="w-full text-left p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white mb-2">
                  {example.title}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
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