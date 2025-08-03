'use client';

import { useState } from 'react';
import { Copy, RotateCcw } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';

export default function TextCaseConverterPage() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');

  const convertCase = (type: string) => {
    switch (type) {
      case 'uppercase':
        setOutputText(inputText.toUpperCase());
        break;
      case 'lowercase':
        setOutputText(inputText.toLowerCase());
        break;
      case 'capitalize':
        setOutputText(inputText.replace(/\b\w/g, (char) => char.toUpperCase()));
        break;
      case 'titlecase':
        setOutputText(inputText.replace(/\b\w+/g, (word) => 
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ));
        break;
      case 'alternating':
        setOutputText(inputText.split('').map((char, index) => 
          index % 2 === 0 ? char.toUpperCase() : char.toLowerCase()
        ).join(''));
        break;
      case 'inverse':
        setOutputText(inputText.split('').map(char => 
          char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase()
        ).join(''));
        break;
      default:
        setOutputText(inputText);
    }
  };

  const copyToClipboard = async (text: string) => {
    if (text && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
      } catch (error) {
        console.error('复制失败:', error);
      }
    }
  };

  const clearText = () => {
    setInputText('');
    setOutputText('');
  };

  const caseTypes = [
    { id: 'uppercase', name: '全部大写', description: '将所有字母转换为大写' },
    { id: 'lowercase', name: '全部小写', description: '将所有字母转换为小写' },
    { id: 'capitalize', name: '首字母大写', description: '每个单词的首字母大写' },
    { id: 'titlecase', name: '标题格式', description: '每个单词首字母大写，其余小写' },
    { id: 'alternating', name: '交替大小写', description: '字母交替大小写' },
    { id: 'inverse', name: '大小写反转', description: '反转当前的大小写状态' },
  ];

  return (
    <ToolLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            文本大小写转换
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            快速转换文本的大小写格式
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 输入区域 */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                输入文本
              </h2>
              
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="在此输入要转换的文本..."
                className="w-full h-48 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              <div className="flex gap-2 mt-4">
                <button
                  onClick={clearText}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  清空
                </button>
              </div>
            </div>
          </div>

          {/* 输出区域 */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  转换结果
                </h2>
                {outputText && (
                  <button
                    onClick={() => copyToClipboard(outputText)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    title="复制结果"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg min-h-48">
                {outputText ? (
                  <div className="text-gray-900 dark:text-white whitespace-pre-wrap">
                    {outputText}
                  </div>
                ) : (
                  <div className="text-gray-500 dark:text-gray-400 text-center py-8">
                    转换后的文本将显示在这里
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 转换选项 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            转换选项
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {caseTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => convertCase(type.id)}
                disabled={!inputText}
                className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-left"
              >
                <div className="font-medium text-gray-900 dark:text-white">
                  {type.name}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {type.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 使用说明 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">
            使用说明
          </h3>
          <ul className="space-y-2 text-blue-700 dark:text-blue-300">
            <li>• 在左侧输入框中输入要转换的文本</li>
            <li>• 点击右侧的转换选项进行大小写转换</li>
            <li>• 转换结果会实时显示在右侧区域</li>
            <li>• 可以点击复制按钮复制转换后的文本</li>
            <li>• 支持多种大小写转换格式</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}
