'use client';

import { useState } from 'react';
import { Copy, RotateCcw } from 'lucide-react';
import { useToolTranslations } from '@/components/tool-translations';
import { useLanguage } from '@/components/language-provider';

export default function TextEncodePage() {
  const { getToolTranslation } = useToolTranslations();
  const toolTranslation = getToolTranslation('text-encode');
  const { t } = useLanguage();
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [type, setType] = useState<'base64' | 'url' | 'html'>('base64');

  const transformText = () => {
    if (!inputText) return;

    let result = '';
    try {
      if (mode === 'encode') {
        switch (type) {
          case 'base64':
            result = btoa(inputText);
            break;
          case 'url':
            result = encodeURIComponent(inputText);
            break;
          case 'html':
            result = inputText
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#39;');
            break;
        }
      } else {
        switch (type) {
          case 'base64':
            result = atob(inputText);
            break;
          case 'url':
            result = decodeURIComponent(inputText);
            break;
          case 'html':
            result = inputText
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'");
            break;
        }
      }
      setOutputText(result);
    } catch (error) {
      setOutputText('转换失败：输入格式不正确');
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
  };

  const types = [
    { id: 'base64', name: 'Base64', description: toolTranslation.features?.[0] || 'Base64编码/解码' },
    { id: 'url', name: 'URL', description: toolTranslation.features?.[1] || 'URL编码/解码' },
    { id: 'html', name: 'HTML', description: toolTranslation.features?.[2] || 'HTML实体编码/解码' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {toolTranslation.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {toolTranslation.description}
        </p>
      </div>

      {/* 控制选项 */}
      <div className="flex flex-wrap gap-4 justify-center">
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

        <div className="flex gap-2">
          {types.map((typeOption) => (
            <button
              key={typeOption.id}
              onClick={() => setType(typeOption.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                type === typeOption.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {typeOption.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label htmlFor="input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              输入文本
            </label>
            <textarea
              id="input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="在此输入要转换的文本..."
              className="textarea w-full h-64"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={transformText}
              disabled={!inputText}
              className="btn btn-primary"
            >
              {mode === 'encode' ? '编码' : '解码'}
            </button>
            <button
              onClick={handleClear}
              className="btn btn-outline flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              清空
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="output" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              转换结果
            </label>
            <textarea
              id="output"
              value={outputText}
              readOnly
              placeholder="转换结果将显示在这里..."
              className="textarea w-full h-64"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              disabled={!outputText}
              className="btn btn-primary flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              复制
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          使用说明
        </h3>
        <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li>• 选择编码或解码模式</li>
        <li>• 选择编码类型（Base64、URL、HTML）</li>
        <li>• 在左侧输入框中输入要转换的文本</li>
        <li>• 点击转换按钮进行编码或解码</li>
        <li>• 转换结果会显示在右侧输出框中</li>
        </ul>
      </div>
    </div>
  );
}
