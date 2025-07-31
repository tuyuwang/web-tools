'use client';

import { useState, ChangeEvent } from 'react';

export default function TextCaseConverterPage() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  const convertText = (type: string) => {
    let converted = '';
    switch (type) {
      case 'uppercase':
        converted = inputText.toUpperCase();
        break;
      case 'lowercase':
        converted = inputText.toLowerCase();
        break;
      case 'capitalize':
        converted = inputText.replace(/\b\w/g, (char) => char.toUpperCase());
        break;
      case 'titlecase':
        converted = inputText.replace(/\b\w/g, (char) => char.toUpperCase()).replace(/\s+/g, ' ');
        break;
      case 'camelcase':
        converted = inputText.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
          return index === 0 ? word.toLowerCase() : word.toUpperCase();
        }).replace(/\s+/g, '');
        break;
      case 'pascalcase':
        converted = inputText.replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase()).replace(/\s+/g, '');
        break;
      case 'snakecase':
        converted = inputText.replace(/\s+/g, '_').toLowerCase();
        break;
      case 'kebabcase':
        converted = inputText.replace(/\s+/g, '-').toLowerCase();
        break;
      case 'sentencecase':
        converted = inputText.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
        break;
      default:
        converted = inputText;
    }
    setOutputText(converted);
  };

  const clearAll = () => {
    setInputText('');
    setOutputText('');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">文本格式转换</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8 text-center">
        快速转换文本的大小写、驼峰命名、蛇形命名等多种格式。
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="inputText" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            输入文本
          </label>
          <textarea
            id="inputText"
            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-primary-500 focus:border-primary-500 h-48 resize-y"
            value={inputText}
            onChange={handleInputChange}
            placeholder="在此输入您的文本..."
          ></textarea>
        </div>
        <div>
          <label htmlFor="outputText" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            输出文本
          </label>
          <textarea
            id="outputText"
            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 h-48 resize-y"
            value={outputText}
            readOnly
            placeholder="转换结果将显示在此..."
          ></textarea>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          onClick={() => convertText('uppercase')}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors duration-200 text-sm"
        >
          大写
        </button>
        <button
          onClick={() => convertText('lowercase')}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors duration-200 text-sm"
        >
          小写
        </button>
        <button
          onClick={() => convertText('capitalize')}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors duration-200 text-sm"
        >
          首字母大写
        </button>
        <button
          onClick={() => convertText('titlecase')}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors duration-200 text-sm"
        >
          标题格式
        </button>
        <button
          onClick={() => convertText('camelcase')}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors duration-200 text-sm"
        >
          驼峰命名
        </button>
        <button
          onClick={() => convertText('pascalcase')}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors duration-200 text-sm"
        >
          帕斯卡命名
        </button>
        <button
          onClick={() => convertText('snakecase')}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors duration-200 text-sm"
        >
          蛇形命名
        </button>
        <button
          onClick={() => convertText('kebabcase')}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors duration-200 text-sm"
        >
          烤串命名
        </button>
        <button
          onClick={() => convertText('sentencecase')}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors duration-200 text-sm"
        >
          句子格式
        </button>
        <button
          onClick={clearAll}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors duration-200 text-sm dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        >
          清空
        </button>
      </div>
    </div>
  );
}
