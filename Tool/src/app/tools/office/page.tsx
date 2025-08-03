'use client';

import { ToolLayout } from '@/components/tool-layout';
import { useState } from 'react';
import { FileText, Table, FileSpreadsheet, FileCheck, FileX, Download, Upload, Copy, Check } from 'lucide-react';
import { useToolTranslations } from '@/components/tool-translations';

export default function OfficeToolsPage() {
  const { getToolTranslation } = useToolTranslations();
  const toolTranslation = getToolTranslation('office');
  const [activeTab, setActiveTab] = useState('document');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [csvData, setCsvData] = useState('');
  const [jsonData, setJsonData] = useState('');

  const tabs = [
    { id: 'document', name: '文档处理', icon: FileText },
    { id: 'table', name: '表格工具', icon: Table },
    { id: 'csv', name: 'CSV工具', icon: FileSpreadsheet },
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
    navigator.clipboard.writeText(text);
  };

  return (
    <ToolLayout>
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
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* 文档处理工具 */}
      {activeTab === 'document' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                输入文本
              </h3>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="在此输入要处理的文本..."
                className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  处理结果
                </h3>
                {outputText && (
                  <button
                    onClick={() => copyToClipboard(outputText)}
                    className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
                  >
                    <Copy className="h-4 w-4" />
                    <span>复制</span>
                  </button>
                )}
              </div>
              <textarea
                value={outputText}
                readOnly
                placeholder="处理结果将显示在这里..."
                className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none bg-gray-50 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {[
              { name: '转大写', action: 'uppercase', icon: FileText },
              { name: '转小写', action: 'lowercase', icon: FileText },
              { name: '首字母大写', action: 'capitalize', icon: FileText },
              { name: '去除多余空格', action: 'removeSpaces', icon: FileText },
              { name: '去除空行', action: 'removeEmptyLines', icon: FileText },
              { name: '排序行', action: 'sortLines', icon: FileText },
              { name: '反转行', action: 'reverseLines', icon: FileText },
              { name: '统计字数', action: 'countWords', icon: FileCheck },
              { name: '统计字符', action: 'countCharacters', icon: FileCheck },
              { name: '统计行数', action: 'countLines', icon: FileCheck },
            ].map((tool) => (
              <button
                key={tool.action}
                onClick={() => handleDocumentProcess(tool.action)}
                className="flex flex-col items-center space-y-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
              >
                <tool.icon className="h-6 w-6 text-primary-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {tool.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CSV工具 */}
      {activeTab === 'csv' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                CSV数据
              </h3>
              <textarea
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                placeholder="输入CSV数据，第一行为表头..."
                className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
              <button
                onClick={handleCsvToJson}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>CSV转JSON</span>
              </button>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                JSON数据
              </h3>
              <textarea
                value={jsonData}
                onChange={(e) => setJsonData(e.target.value)}
                placeholder="输入JSON数组数据..."
                className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
              <button
                onClick={handleJsonToCsv}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>JSON转CSV</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 表格工具 */}
      {activeTab === 'table' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              表格生成器
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              快速生成HTML表格，支持自定义样式和内容
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  表格数据 (JSON格式)
                </label>
                <textarea
                  placeholder='[{"name": "张三", "age": 25, "city": "北京"}, {"name": "李四", "age": 30, "city": "上海"}]'
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  生成的HTML表格
                </label>
                <div className="w-full h-32 p-3 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-600 dark:text-white overflow-auto">
                  <code className="text-sm text-gray-600 dark:text-gray-400">
                    &lt;table&gt;<br/>
                    &nbsp;&nbsp;&lt;thead&gt;<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;&lt;tr&gt;&lt;th&gt;姓名&lt;/th&gt;&lt;th&gt;年龄&lt;/th&gt;&lt;th&gt;城市&lt;/th&gt;&lt;/tr&gt;<br/>
                    &nbsp;&nbsp;&lt;/thead&gt;<br/>
                    &nbsp;&nbsp;&lt;tbody&gt;<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;&lt;tr&gt;&lt;td&gt;张三&lt;/td&gt;&lt;td&gt;25&lt;/td&gt;&lt;td&gt;北京&lt;/td&gt;&lt;/tr&gt;<br/>
                    &nbsp;&nbsp;&lt;/tbody&gt;<br/>
                    &lt;/table&gt;
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </ToolLayout>
  );
} 