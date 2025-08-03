'use client';

import { ToolLayout } from '@/components/tool-layout';
import { useState, useEffect } from 'react';
import { FileText, BarChart3, TrendingUp } from 'lucide-react';

interface TextStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  lines: number;
  paragraphs: number;
  sentences: number;
  readingTime: number;
  speakingTime: number;
}

export default function TextStatsPage() {
  const [text, setText] = useState('');
  const [stats, setStats] = useState<TextStats>({
    characters: 0,
    charactersNoSpaces: 0,
    words: 0,
    lines: 0,
    paragraphs: 0,
    sentences: 0,
    readingTime: 0,
    speakingTime: 0,
  });

  useEffect(() => {
    calculateStats(text);
  }, [text]);

  const calculateStats = (inputText: string) => {
    if (!inputText.trim()) {
      setStats({
        characters: 0,
        charactersNoSpaces: 0,
        words: 0,
        lines: 0,
        paragraphs: 0,
        sentences: 0,
        readingTime: 0,
        speakingTime: 0,
      });
      return;
    }

    const characters = inputText.length;
    const charactersNoSpaces = inputText.replace(/\s/g, '').length;
    const words = inputText.trim().split(/\s+/).filter(word => word.length > 0).length;
    const lines = inputText.split('\n').filter(line => line.trim().length > 0).length;
    const paragraphs = inputText.split('\n\n').filter(para => para.trim().length > 0).length;
    const sentences = inputText.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length;
    
    // 阅读时间：平均每分钟200字
    const readingTime = Math.ceil(words / 200);
    // 说话时间：平均每分钟150字
    const speakingTime = Math.ceil(words / 150);

    setStats({
      characters,
      charactersNoSpaces,
      words,
      lines,
      paragraphs,
      sentences,
      readingTime,
      speakingTime,
    });
  };

  const clearText = () => {
    setText('');
  };

  const copyStats = async () => {
    const statsText = `文本统计结果：
字符数（含空格）：${stats.characters}
字符数（不含空格）：${stats.charactersNoSpaces}
词数：${stats.words}
行数：${stats.lines}
段落数：${stats.paragraphs}
句子数：${stats.sentences}
预计阅读时间：${stats.readingTime}分钟
预计说话时间：${stats.speakingTime}分钟`;

    try {
      await navigator.clipboard.writeText(statsText);
      alert('统计结果已复制到剪贴板');
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  return (
    <ToolLayout>
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          文本统计工具
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          分析文本的字符数、词数、行数等统计信息
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 文本输入区域 */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                输入文本
              </h2>
              <button
                onClick={clearText}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                清空
              </button>
            </div>
            
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="在此输入要分析的文本..."
              className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* 统计结果区域 */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                统计结果
              </h2>
              <button
                onClick={copyStats}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                复制结果
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">字符统计</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">总字符数：</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{stats.characters}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">不含空格：</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{stats.charactersNoSpaces}</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">内容统计</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">词数：</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{stats.words}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">句子数：</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{stats.sentences}</span>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300">结构统计</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">行数：</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{stats.lines}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">段落数：</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{stats.paragraphs}</span>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-orange-700 dark:text-orange-300">时间估算</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">阅读时间：</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{stats.readingTime}分钟</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">说话时间：</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{stats.speakingTime}分钟</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 详细统计 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              详细统计
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                <span className="text-gray-600 dark:text-gray-400">平均词长</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {stats.words > 0 ? (stats.charactersNoSpaces / stats.words).toFixed(1) : 0} 字符
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                <span className="text-gray-600 dark:text-gray-400">平均句长</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {stats.sentences > 0 ? (stats.words / stats.sentences).toFixed(1) : 0} 词
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                <span className="text-gray-600 dark:text-gray-400">平均段落长</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {stats.paragraphs > 0 ? (stats.words / stats.paragraphs).toFixed(1) : 0} 词
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 dark:text-gray-400">空格比例</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {stats.characters > 0 ? ((stats.characters - stats.charactersNoSpaces) / stats.characters * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
} 