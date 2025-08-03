'use client';

import { ToolLayout } from '@/components/tool-layout';
import { useState } from 'react';
import { FileText, Table, FileSpreadsheet, FileCheck, FileX, Download, Upload, Copy, Check } from 'lucide-react';
import { useToolTranslations } from '@/components/tool-translations';
import { useLanguage } from '@/components/language-provider';

export default function OfficeToolsPage() {
  const { getToolTranslation, getUITranslation, getToolPageTranslation } = useToolTranslations();
  const { t } = useLanguage();
  const toolTranslation = getToolTranslation('office');
  const ui = getUITranslation();
  const pageTranslation = getToolPageTranslation('office');
  
  const [activeTab, setActiveTab] = useState('document');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [csvData, setCsvData] = useState('');
  const [jsonData, setJsonData] = useState('');

  const tabs = [
    { id: 'document', name: pageTranslation.documentProcessing, icon: FileText },
    { id: 'table', name: pageTranslation.tableGenerator, icon: Table },
    { id: 'csv', name: pageTranslation.csvJsonConverter, icon: FileSpreadsheet },
  ];

  const documentOperations = [
    { id: 'uppercase', name: pageTranslation.features.caseConversion, description: '转换为大写' },
    { id: 'lowercase', name: '转换为小写', description: '转换为小写' },
    { id: 'capitalize', name: '首字母大写', description: '每个单词首字母大写' },
    { id: 'removeSpaces', name: '清理空格', description: '移除多余空格' },
    { id: 'removeEmptyLines', name: '移除空行', description: '移除空白行' },
    { id: 'sortLines', name: '排序行', description: '按字母顺序排序' },
    { id: 'reverseLines', name: '反转行', description: '反转行顺序' },
    { id: 'countWords', name: '统计字数', description: '计算单词数量' },
    { id: 'countCharacters', name: '统计字符', description: '计算字符数量' },
    { id: 'countLines', name: '统计行数', description: '计算行数' },
  ];

  const handleDocumentProcess = (type: string) => {
    if (!inputText.trim()) return;

    let result = '';
    switch (type) {
      case 'uppercase':
        result = inputText.toUpperCase();
        break;
      case 'lowercase':
        result = inputText.toLowerCase();
        break;
      case 'capitalize':
        result = inputText.replace(/\b\w/g, (char) => char.toUpperCase());
        break;
      case 'removeSpaces':
        result = inputText.replace(/\s+/g, ' ').trim();
        break;
      case 'removeEmptyLines':
        result = inputText.split('\n').filter(line => line.trim()).join('\n');
        break;
      case 'sortLines':
        result = inputText.split('\n').sort().join('\n');
        break;
      case 'reverseLines':
        result = inputText.split('\n').reverse().join('\n');
        break;
      case 'countWords':
        result = `总字数: ${inputText.split(/\s+/).filter(word => word.length > 0).length}`;
        break;
      case 'countCharacters':
        result = `总字符数: ${inputText.length}`;
        break;
      case 'countLines':
        result = `总行数: ${inputText.split('\n').length}`;
        break;
    }
    setOutputText(result);
  };

  const handleCsvToJson = () => {
    if (!csvData.trim()) return;
    
    try {
      const lines = csvData.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      const jsonArray = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = values[index] || '';
        });
        return obj;
      });
      
      setJsonData(JSON.stringify(jsonArray, null, 2));
    } catch (error) {
      setJsonData('转换失败，请检查CSV格式');
    }
  };

  const handleJsonToCsv = () => {
    if (!jsonData.trim()) return;
    
    try {
      const data = JSON.parse(jsonData);
      if (!Array.isArray(data) || data.length === 0) {
        setCsvData('请提供有效的JSON数组');
        return;
      }
      
      const headers = Object.keys(data[0]);
      const csvLines = [
        headers.join(','),
        ...data.map(row => headers.map(header => row[header] || '').join(','))
      ];
      
      setCsvData(csvLines.join('\n'));
    } catch (error) {
      setCsvData('转换失败，请检查JSON格式');
    }
  };

  const copyToClipboard = (text: string) => {
    if (text && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <ToolLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {toolTranslation.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {toolTranslation.description}
          </p>
        </div>

        {/* 标签页 */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* 内容区域 */}
        <div className="mt-8">
          {activeTab === 'document' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 输入区域 */}
                <div className="space-y-4">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      {ui.labels.input}
                    </h2>
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={ui.placeholders.enterText}
                      className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* 输出区域 */}
                <div className="space-y-4">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {ui.labels.output}
                      </h2>
                      {outputText && (
                        <button
                          onClick={() => copyToClipboard(outputText)}
                          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                          title={ui.buttons.copy}
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg min-h-64">
                      {outputText ? (
                        <div className="text-gray-900 dark:text-white whitespace-pre-wrap">
                          {outputText}
                        </div>
                      ) : (
                        <div className="text-gray-500 dark:text-gray-400 text-center py-8">
                          {ui.messages.processing}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 操作选项 */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {pageTranslation.features.documentProcessing}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {documentOperations.map((operation) => (
                    <button
                      key={operation.id}
                      onClick={() => handleDocumentProcess(operation.id)}
                      disabled={!inputText}
                      className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-left"
                    >
                      <div className="font-medium text-gray-900 dark:text-white">
                        {operation.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {operation.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'csv' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* CSV输入 */}
                <div className="space-y-4">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      CSV {ui.labels.input}
                    </h2>
                    <textarea
                      value={csvData}
                      onChange={(e) => setCsvData(e.target.value)}
                      placeholder="请输入CSV数据..."
                      className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleCsvToJson}
                      disabled={!csvData}
                      className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                      {pageTranslation.features.csvToJson}
                    </button>
                  </div>
                </div>

                {/* JSON输出 */}
                <div className="space-y-4">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      JSON {ui.labels.output}
                    </h2>
                    <textarea
                      value={jsonData}
                      onChange={(e) => setJsonData(e.target.value)}
                      placeholder="JSON数据将显示在这里..."
                      className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleJsonToCsv}
                      disabled={!jsonData}
                      className="mt-4 w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                      {pageTranslation.features.jsonToCsv}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'table' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {pageTranslation.tableGenerator}
                </h2>
                <div className="text-center py-8">
                  <Table className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {ui.messages.processing}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 使用说明 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">
            {pageTranslation.instructions}
          </h3>
          <ul className="space-y-2 text-blue-700 dark:text-blue-300">
            {pageTranslation.instructionSteps.map((step: string, index: number) => (
              <li key={index}>• {step}</li>
            ))}
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
} 