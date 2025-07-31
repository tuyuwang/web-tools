'use client';

import { useState } from 'react';
import { Copy, RotateCcw, FileCode } from 'lucide-react';

export default function CodeFormatPage() {
  const [inputCode, setInputCode] = useState('');
  const [outputCode, setOutputCode] = useState('');
  const [language, setLanguage] = useState<'json' | 'javascript' | 'css' | 'html'>('json');

  const formatCode = () => {
    if (!inputCode) return;

    try {
      let formatted = '';
      switch (language) {
        case 'json':
          formatted = JSON.stringify(JSON.parse(inputCode), null, 2);
          break;
        case 'javascript':
          // 简单的JavaScript格式化
          formatted = inputCode
            .replace(/;\s*/g, ';\n')
            .replace(/\{\s*/g, ' {\n')
            .replace(/\}\s*/g, '\n}\n')
            .replace(/,\s*/g, ',\n');
          break;
        case 'css':
          // 简单的CSS格式化
          formatted = inputCode
            .replace(/\s*\{\s*/g, ' {\n  ')
            .replace(/\s*\}\s*/g, '\n}\n')
            .replace(/;\s*/g, ';\n  ');
          break;
        case 'html':
          // 简单的HTML格式化
          formatted = inputCode
            .replace(/>\s*</g, '>\n<')
            .replace(/\s*>\s*/g, '>\n')
            .replace(/\s*<\s*/g, '\n<');
          break;
      }
      setOutputCode(formatted);
    } catch (error) {
      setOutputCode('格式化失败：代码格式不正确');
    }
  };

  const validateCode = () => {
    if (!inputCode) return;

    try {
      switch (language) {
        case 'json':
          JSON.parse(inputCode);
          return { valid: true, message: 'JSON格式正确' };
        case 'javascript':
          // 简单的JavaScript语法检查
          new Function(inputCode);
          return { valid: true, message: 'JavaScript语法正确' };
        default:
          return { valid: true, message: '代码格式正确' };
      }
    } catch (error) {
      return { valid: false, message: `语法错误: ${error instanceof Error ? error.message : '未知错误'}` };
    }
  };

  const handleCopy = async () => {
    if (outputCode && navigator.clipboard) {
      await navigator.clipboard.writeText(outputCode);
    }
  };

  const handleClear = () => {
    setInputCode('');
    setOutputCode('');
  };

  const languages = [
    { id: 'json', name: 'JSON', description: 'JSON数据格式化' },
    { id: 'javascript', name: 'JavaScript', description: 'JavaScript代码格式化' },
    { id: 'css', name: 'CSS', description: 'CSS样式格式化' },
    { id: 'html', name: 'HTML', description: 'HTML代码格式化' },
  ];

  const sampleCode = {
    json: '{"name":"John","age":30,"city":"New York"}',
    javascript: 'function hello(name){return "Hello, "+name+"!";}',
    css: '.container{width:100%;height:100vh;background-color:#f0f0f0;}',
    html: '<div class="container"><h1>Hello World</h1><p>Welcome to our website</p></div>',
  };

  const validation = validateCode();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          代码格式化工具
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          格式化JSON、JavaScript、CSS、HTML代码
        </p>
      </div>

      {/* 语言选择 */}
      <div className="flex flex-wrap gap-4 justify-center">
        {languages.map((lang) => (
          <button
            key={lang.id}
            onClick={() => setLanguage(lang.id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              language === lang.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {lang.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 左侧：输入代码 */}
        <div className="space-y-4">
          <div>
            <label htmlFor="input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              输入代码
            </label>
            <textarea
              id="input"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder={`输入${languages.find(l => l.id === language)?.name}代码...`}
              className="textarea w-full h-64 font-mono text-sm"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={formatCode}
              disabled={!inputCode}
              className="btn btn-primary flex items-center gap-2"
            >
              <FileCode className="h-4 w-4" />
              格式化
            </button>
            <button
              onClick={() => setInputCode(sampleCode[language])}
              className="btn btn-outline"
            >
              加载示例
            </button>
            <button
              onClick={handleClear}
              className="btn btn-outline flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              清空
            </button>
          </div>

          {inputCode && (
            <div className={`p-3 rounded-lg text-sm ${
              validation?.valid 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
            }`}>
              {validation?.message}
            </div>
          )}
        </div>

        {/* 右侧：格式化结果 */}
        <div className="space-y-4">
          <div>
            <label htmlFor="output" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              格式化结果
            </label>
            <textarea
              id="output"
              value={outputCode}
              readOnly
              placeholder="格式化后的代码将显示在这里..."
              className="textarea w-full h-64 font-mono text-sm"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              disabled={!outputCode}
              className="btn btn-primary flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              复制结果
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          使用说明
        </h3>
        <ul className="space-y-2 text-gray-600 dark:text-gray-400">
          <li>• 选择要格式化的代码语言</li>
          <li>• 在左侧输入框中粘贴要格式化的代码</li>
          <li>• 点击"格式化"按钮进行代码格式化</li>
          <li>• 可以点击"加载示例"查看示例代码</li>
          <li>• 格式化后的代码会显示在右侧，可以复制使用</li>
        </ul>
      </div>
    </div>
  );
}
