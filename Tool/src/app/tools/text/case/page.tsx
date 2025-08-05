'use client';

import { useState } from 'react';
import { Copy, RotateCcw, Check } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';
import { useToolTranslations } from '@/components/tool-translations';
import { useLanguage } from '@/components/language-provider';

export default function TextCaseConverterPage() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { getToolTranslation, getUITranslation, getToolPageTranslation } = useToolTranslations();
  const { t } = useLanguage();
  const toolTranslation = getToolTranslation('text-case');
  const ui = getUITranslation();
  const pageTranslation = getToolPageTranslation('text-case');

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

  const copyToClipboard = async (text: string, index?: number) => {
    if (text && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        if (typeof index === 'number') {
          setCopiedIndex(index);
          setTimeout(() => setCopiedIndex(null), 2000);
        }
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
    { id: 'uppercase', ...pageTranslation.caseTypes.uppercase },
    { id: 'lowercase', ...pageTranslation.caseTypes.lowercase },
    { id: 'capitalize', ...pageTranslation.caseTypes.capitalize },
    { id: 'titlecase', ...pageTranslation.caseTypes.titlecase },
    { id: 'alternating', ...pageTranslation.caseTypes.alternating },
    { id: 'inverse', ...pageTranslation.caseTypes.inverse },
  ];

  return (
    <ToolLayout>
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* 页面标题 */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {toolTranslation.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            {toolTranslation.description}
          </p>
        </div>

        {/* 输入输出区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* 输入区域 */}
          <div className="space-y-4 sm:space-y-6">
            <div className="card p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {pageTranslation.inputText}
              </h2>
              
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={ui.placeholders.enterText}
                className="w-full h-40 sm:h-48 p-3 sm:p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
              
              <div className="flex gap-2 mt-4">
                <button
                  onClick={clearText}
                  className="btn bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {ui.buttons.clear}
                </button>
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center ml-auto">
                  {inputText.length} 字符
                </div>
              </div>
            </div>
          </div>

          {/* 输出区域 */}
          <div className="space-y-4 sm:space-y-6">
            <div className="card p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {pageTranslation.outputText}
                </h2>
                {outputText && (
                  <button
                    onClick={() => copyToClipboard(outputText)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    title={ui.buttons.copy}
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-lg min-h-40 sm:min-h-48">
                {outputText ? (
                  <div className="text-gray-900 dark:text-white whitespace-pre-wrap text-sm sm:text-base">
                    {outputText}
                  </div>
                ) : (
                  <div className="text-gray-500 dark:text-gray-400 text-center py-8 text-sm sm:text-base">
                    {ui.messages.processing}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 转换选项 */}
        <div className="card p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {pageTranslation.conversionOptions}
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {caseTypes.map((type, index) => (
              <button
                key={type.id}
                onClick={() => {
                  convertCase(type.id);
                  setCopiedIndex(null);
                }}
                disabled={!inputText}
                className="p-3 sm:p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-left bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 touch-manipulation min-h-[80px] sm:min-h-[90px]"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                  {type.name}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                  {type.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 使用说明 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 sm:p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3 sm:mb-4">
            {pageTranslation.instructions}
          </h3>
          <ul className="space-y-2 text-blue-700 dark:text-blue-300 text-sm sm:text-base">
            {pageTranslation.instructionSteps.map((step: string, index: number) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-500 mr-2 flex-shrink-0">•</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}
