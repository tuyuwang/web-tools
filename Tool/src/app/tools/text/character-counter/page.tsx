'use client';

import { ToolLayout } from '@/components/tool-layout';
import { useState, useMemo } from 'react';
import { 
  Type, Hash, BarChart3, Clock, Eye, FileText, 
  Copy, Download, RotateCcw, TrendingUp 
} from 'lucide-react';

interface TextStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  paragraphs: number;
  sentences: number;
  lines: number;
  pages: number;
  readingTime: number;
  speakingTime: number;
  avgWordsPerSentence: number;
  avgCharsPerWord: number;
  readabilityScore: number;
  wordFrequency: Array<{ word: string; count: number }>;
  commonWords: Array<{ word: string; count: number }>;
  longestWord: string;
  shortestWord: string;
}

export default function CharacterCounterPage() {
  const [text, setText] = useState(`欢迎使用高级文本分析工具！

这个工具可以为您提供详细的文本统计信息，包括：
- 字符数统计（包含和不包含空格）
- 单词数和句子数统计
- 段落数和行数统计
- 阅读时间和演讲时间估算
- 文本可读性分析
- 词频统计和关键词提取

请在这里输入您的文本，系统会自动进行分析并显示详细的统计结果。这对于写作、编辑、SEO优化等工作非常有用。

立即开始分析您的文本内容吧！`);
  
  const [copied, setCopied] = useState<string | null>(null);

  const textStats: TextStats = useMemo(() => {
    if (!text.trim()) {
      return {
        characters: 0,
        charactersNoSpaces: 0,
        words: 0,
        paragraphs: 0,
        sentences: 0,
        lines: 0,
        pages: 0,
        readingTime: 0,
        speakingTime: 0,
        avgWordsPerSentence: 0,
        avgCharsPerWord: 0,
        readabilityScore: 0,
        wordFrequency: [],
        commonWords: [],
        longestWord: '',
        shortestWord: '',
      };
    }

    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    
    // 计算单词数（支持中英文）
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    
    // 计算段落数
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
    
    // 计算句子数
    const sentences = text.split(/[.!?。！？]+/).filter(s => s.trim().length > 0).length;
    
    // 计算行数
    const lines = text.split('\n').length;
    
    // 估算页数（假设每页250词）
    const pages = Math.ceil(wordCount / 250);
    
    // 估算阅读时间（每分钟200词）
    const readingTime = Math.ceil(wordCount / 200);
    
    // 估算演讲时间（每分钟150词）
    const speakingTime = Math.ceil(wordCount / 150);
    
    // 计算平均值
    const avgWordsPerSentence = sentences > 0 ? Math.round((wordCount / sentences) * 10) / 10 : 0;
    const avgCharsPerWord = wordCount > 0 ? Math.round((charactersNoSpaces / wordCount) * 10) / 10 : 0;
    
    // 简单的可读性评分（基于句子长度和单词长度）
    const readabilityScore = calculateReadabilityScore(avgWordsPerSentence, avgCharsPerWord);
    
    // 词频统计
    const wordFrequency = calculateWordFrequency(words);
    
    // 常用词（排除停用词）
    const commonWords = getCommonWords(wordFrequency);
    
    // 最长和最短单词
    const wordLengths = words.map(word => word.replace(/[^\w\u4e00-\u9fa5]/g, ''));
    const longestWord = wordLengths.reduce((a, b) => a.length > b.length ? a : b, '');
    const shortestWord = wordLengths.reduce((a, b) => a.length < b.length && a.length > 0 ? a : b, wordLengths[0] || '');

    return {
      characters,
      charactersNoSpaces,
      words: wordCount,
      paragraphs,
      sentences,
      lines,
      pages,
      readingTime,
      speakingTime,
      avgWordsPerSentence,
      avgCharsPerWord,
      readabilityScore,
      wordFrequency: wordFrequency.slice(0, 10),
      commonWords: commonWords.slice(0, 10),
      longestWord,
      shortestWord,
    };
  }, [text]);

  function calculateReadabilityScore(avgWordsPerSentence: number, avgCharsPerWord: number): number {
    // 简化的可读性评分算法
    let score = 100;
    
    // 句子越长，可读性越低
    if (avgWordsPerSentence > 20) score -= (avgWordsPerSentence - 20) * 2;
    else if (avgWordsPerSentence < 8) score -= (8 - avgWordsPerSentence) * 1;
    
    // 单词越长，可读性越低
    if (avgCharsPerWord > 6) score -= (avgCharsPerWord - 6) * 3;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  function calculateWordFrequency(words: string[]): Array<{ word: string; count: number }> {
    const frequency: { [key: string]: number } = {};
    
    words.forEach(word => {
      const cleanWord = word.toLowerCase().replace(/[^\w\u4e00-\u9fa5]/g, '');
      if (cleanWord.length > 0) {
        frequency[cleanWord] = (frequency[cleanWord] || 0) + 1;
      }
    });
    
    return Object.entries(frequency)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count);
  }

  function getCommonWords(wordFrequency: Array<{ word: string; count: number }>): Array<{ word: string; count: number }> {
    // 常见停用词
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'should', 'could', 'can', 'may', 'might', 'must', 'shall',
      'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
      'my', 'your', 'his', 'her', 'its', 'our', 'their', 'this', 'that', 'these', 'those',
      '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这', '那'
    ]);
    
    return wordFrequency.filter(item => 
      !stopWords.has(item.word.toLowerCase()) && 
      item.word.length > 1
    );
  }

  const copyToClipboard = async (content: string, type: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const downloadReport = () => {
    const report = generateReport();
    const element = document.createElement('a');
    const file = new Blob([report], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'text-analysis-report.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const generateReport = (): string => {
    return `文本分析报告
===================

基本统计
---------
字符数（含空格）：${textStats.characters}
字符数（不含空格）：${textStats.charactersNoSpaces}
单词数：${textStats.words}
句子数：${textStats.sentences}
段落数：${textStats.paragraphs}
行数：${textStats.lines}
预估页数：${textStats.pages}

时间估算
---------
阅读时间：${textStats.readingTime} 分钟
演讲时间：${textStats.speakingTime} 分钟

质量分析
---------
平均每句单词数：${textStats.avgWordsPerSentence}
平均每词字符数：${textStats.avgCharsPerWord}
可读性评分：${textStats.readabilityScore}/100

词频统计（前10）
-----------------
${textStats.wordFrequency.map(item => `${item.word}: ${item.count}`).join('\n')}

关键词（前10）
--------------
${textStats.commonWords.map(item => `${item.word}: ${item.count}`).join('\n')}

其他信息
---------
最长单词：${textStats.longestWord}
最短单词：${textStats.shortestWord}

生成时间：${new Date().toLocaleString()}
`;
  };

  const clearText = () => {
    setText('');
  };

  const getReadabilityLevel = (score: number): { level: string; color: string; description: string } => {
    if (score >= 90) return { level: '非常易读', color: 'text-green-600 dark:text-green-400', description: '5年级水平' };
    if (score >= 80) return { level: '易读', color: 'text-green-500 dark:text-green-400', description: '6年级水平' };
    if (score >= 70) return { level: '较易读', color: 'text-blue-600 dark:text-blue-400', description: '7年级水平' };
    if (score >= 60) return { level: '标准', color: 'text-yellow-600 dark:text-yellow-400', description: '8-9年级水平' };
    if (score >= 50) return { level: '较难读', color: 'text-orange-600 dark:text-orange-400', description: '10-12年级水平' };
    if (score >= 30) return { level: '难读', color: 'text-red-600 dark:text-red-400', description: '大学水平' };
    return { level: '极难读', color: 'text-red-700 dark:text-red-400', description: '研究生水平' };
  };

  const readabilityInfo = getReadabilityLevel(textStats.readabilityScore);

  return (
    <ToolLayout>
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          高级文本分析工具
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          获取详细的文本统计信息、可读性分析和关键词提取
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* 文本输入区域 */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                文本输入
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(generateReport(), 'report')}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  复制报告
                </button>
                <button
                  onClick={downloadReport}
                  className="flex items-center gap-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
                >
                  <Download className="w-3 h-3" />
                  下载报告
                </button>
                <button
                  onClick={clearText}
                  className="flex items-center gap-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  清空
                </button>
              </div>
            </div>
            
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="在这里输入您要分析的文本..."
              className="w-full h-80 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* 词频分析 */}
          {textStats.wordFrequency.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  词频统计（前10）
                </h3>
                <div className="space-y-2">
                  {textStats.wordFrequency.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-700 dark:text-gray-300">{item.word}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                              width: `${(item.count / textStats.wordFrequency[0].count) * 100}%`
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400 w-8 text-right">
                          {item.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  关键词（前10）
                </h3>
                <div className="space-y-2">
                  {textStats.commonWords.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-700 dark:text-gray-300">{item.word}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{
                              width: `${textStats.commonWords.length > 0 ? (item.count / textStats.commonWords[0].count) * 100 : 0}%`
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400 w-8 text-right">
                          {item.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 统计面板 */}
        <div className="space-y-6">
          {/* 基本统计 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Type className="w-5 h-5" />
              基本统计
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">字符数（含空格）</span>
                <span className="font-semibold text-gray-900 dark:text-white">{textStats.characters.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">字符数（不含空格）</span>
                <span className="font-semibold text-gray-900 dark:text-white">{textStats.charactersNoSpaces.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">单词数</span>
                <span className="font-semibold text-gray-900 dark:text-white">{textStats.words.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">句子数</span>
                <span className="font-semibold text-gray-900 dark:text-white">{textStats.sentences.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">段落数</span>
                <span className="font-semibold text-gray-900 dark:text-white">{textStats.paragraphs.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">行数</span>
                <span className="font-semibold text-gray-900 dark:text-white">{textStats.lines.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* 时间估算 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              时间估算
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">阅读时间</span>
                <span className="font-semibold text-gray-900 dark:text-white">{textStats.readingTime} 分钟</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">演讲时间</span>
                <span className="font-semibold text-gray-900 dark:text-white">{textStats.speakingTime} 分钟</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">预估页数</span>
                <span className="font-semibold text-gray-900 dark:text-white">{textStats.pages} 页</span>
              </div>
            </div>
          </div>

          {/* 可读性分析 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              可读性分析
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">可读性评分</span>
                <span className={`font-semibold ${readabilityInfo.color}`}>
                  {textStats.readabilityScore}/100
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">可读性等级</span>
                <span className={`font-semibold ${readabilityInfo.color}`}>
                  {readabilityInfo.level}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">适读水平</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {readabilityInfo.description}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mt-3">
                <div
                  className={`h-3 rounded-full transition-all duration-300 ${
                    textStats.readabilityScore >= 70 ? 'bg-green-500' :
                    textStats.readabilityScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${textStats.readabilityScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* 质量指标 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Hash className="w-5 h-5" />
              质量指标
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">平均每句单词数</span>
                <span className="font-semibold text-gray-900 dark:text-white">{textStats.avgWordsPerSentence}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">平均每词字符数</span>
                <span className="font-semibold text-gray-900 dark:text-white">{textStats.avgCharsPerWord}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">最长单词</span>
                <span className="font-semibold text-gray-900 dark:text-white text-right truncate max-w-24" title={textStats.longestWord}>
                  {textStats.longestWord}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">最短单词</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {textStats.shortestWord}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 复制成功提示 */}
      {copied && (
        <div className="fixed bottom-4 right-4 p-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg text-sm">
          {copied === 'report' ? '分析报告' : '内容'}已复制到剪贴板
        </div>
      )}
    </ToolLayout>
  );
}