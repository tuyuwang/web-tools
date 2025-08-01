'use client';

import { useState, useEffect } from 'react';

export default function TextAnalyzePage() {
  const [text, setText] = useState('');
  const [stats, setStats] = useState({
    characters: 0,
    words: 0,
    lines: 0,
    paragraphs: 0,
  });

  useEffect(() => {
    if (!text.trim()) {
      setStats({ characters: 0, words: 0, lines: 0, paragraphs: 0 });
      return;
    }

    const characters = text.length;
    const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
    const lines = text.split('\n').filter(line => line.trim().length > 0).length;
    const paragraphs = text.split(/\n\s*\n/).filter(para => para.trim().length > 0).length;

    setStats({ characters, words, lines, paragraphs });
  }, [text]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          文本分析工具
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          分析文本的字符数、词数、行数等统计信息
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            输入文本
          </h2>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="在此输入要分析的文本..."
            className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            分析结果
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                字符统计
              </h3>
              <div className="text-2xl font-bold text-blue-600">
                {stats.characters.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">总字符数</div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                单词数
              </h3>
              <div className="text-2xl font-bold text-green-600">
                {stats.words.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">单词数量</div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                行数
              </h3>
              <div className="text-2xl font-bold text-purple-600">
                {stats.lines.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">非空行数</div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                段落数
              </h3>
              <div className="text-2xl font-bold text-orange-600">
                {stats.paragraphs.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">段落数量</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 