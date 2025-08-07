'use client';

import { useState, useEffect } from 'react';
import { Type, Copy, Download, Sparkles } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';

export default function AsciiArtPage() {
  const [inputText, setInputText] = useState('HELLO');
  const [selectedFont, setSelectedFont] = useState('standard');
  const [asciiResult, setAsciiResult] = useState('');
  const [copied, setCopied] = useState(false);

  // ASCII字体样式数据
  const fonts = {
    standard: {
      name: '标准字体',
      patterns: {
        'A': ['  █  ', ' █ █ ', '█████', '█   █', '█   █'],
        'B': ['████ ', '█   █', '████ ', '█   █', '████ '],
        'C': [' ████', '█    ', '█    ', '█    ', ' ████'],
        'D': ['████ ', '█   █', '█   █', '█   █', '████ '],
        'E': ['█████', '█    ', '███  ', '█    ', '█████'],
        'F': ['█████', '█    ', '███  ', '█    ', '█    '],
        'G': [' ████', '█    ', '█ ███', '█   █', ' ████'],
        'H': ['█   █', '█   █', '█████', '█   █', '█   █'],
        'I': ['█████', '  █  ', '  █  ', '  █  ', '█████'],
        'J': ['█████', '    █', '    █', '█   █', ' ████'],
        'K': ['█   █', '█  █ ', '███  ', '█  █ ', '█   █'],
        'L': ['█    ', '█    ', '█    ', '█    ', '█████'],
        'M': ['█   █', '██ ██', '█ █ █', '█   █', '█   █'],
        'N': ['█   █', '██  █', '█ █ █', '█  ██', '█   █'],
        'O': [' ███ ', '█   █', '█   █', '█   █', ' ███ '],
        'P': ['████ ', '█   █', '████ ', '█    ', '█    '],
        'Q': [' ███ ', '█   █', '█ █ █', '█  ██', ' ████'],
        'R': ['████ ', '█   █', '████ ', '█  █ ', '█   █'],
        'S': [' ████', '█    ', ' ███ ', '    █', '████ '],
        'T': ['█████', '  █  ', '  █  ', '  █  ', '  █  '],
        'U': ['█   █', '█   █', '█   █', '█   █', ' ███ '],
        'V': ['█   █', '█   █', '█   █', ' █ █ ', '  █  '],
        'W': ['█   █', '█   █', '█ █ █', '██ ██', '█   █'],
        'X': ['█   █', ' █ █ ', '  █  ', ' █ █ ', '█   █'],
        'Y': ['█   █', ' █ █ ', '  █  ', '  █  ', '  █  '],
        'Z': ['█████', '   █ ', '  █  ', ' █   ', '█████'],
        '0': [' ███ ', '█   █', '█   █', '█   █', ' ███ '],
        '1': ['  █  ', ' ██  ', '  █  ', '  █  ', '█████'],
        '2': [' ███ ', '█   █', '  ██ ', ' █   ', '█████'],
        '3': [' ███ ', '█   █', '  ██ ', '█   █', ' ███ '],
        '4': ['█   █', '█   █', '█████', '    █', '    █'],
        '5': ['█████', '█    ', '████ ', '    █', '████ '],
        '6': [' ████', '█    ', '████ ', '█   █', ' ███ '],
        '7': ['█████', '    █', '   █ ', '  █  ', ' █   '],
        '8': [' ███ ', '█   █', ' ███ ', '█   █', ' ███ '],
        '9': [' ███ ', '█   █', ' ████', '    █', ' ███ '],
        ' ': ['     ', '     ', '     ', '     ', '     ']
      }
    },
    small: {
      name: '小号字体',
      patterns: {
        'A': [' █ ', '█ █', '███', '█ █'],
        'B': ['██ ', '██ ', '██ ', '██ '],
        'C': ['███', '█  ', '█  ', '███'],
        'D': ['██ ', '█ █', '█ █', '██ '],
        'E': ['███', '██ ', '██ ', '███'],
        'F': ['███', '██ ', '██ ', '█  '],
        'G': ['███', '█ █', '█ █', '███'],
        'H': ['█ █', '███', '███', '█ █'],
        'I': ['███', ' █ ', ' █ ', '███'],
        'J': ['███', '  █', '█ █', '███'],
        'K': ['█ █', '██ ', '██ ', '█ █'],
        'L': ['█  ', '█  ', '█  ', '███'],
        'M': ['█ █', '███', '█ █', '█ █'],
        'N': ['█ █', '███', '███', '█ █'],
        'O': ['███', '█ █', '█ █', '███'],
        'P': ['██ ', '█ █', '██ ', '█  '],
        'Q': ['███', '█ █', '███', '  █'],
        'R': ['██ ', '█ █', '██ ', '█ █'],
        'S': ['███', '██ ', ' ██', '███'],
        'T': ['███', ' █ ', ' █ ', ' █ '],
        'U': ['█ █', '█ █', '█ █', '███'],
        'V': ['█ █', '█ █', '█ █', ' █ '],
        'W': ['█ █', '█ █', '███', '█ █'],
        'X': ['█ █', ' █ ', ' █ ', '█ █'],
        'Y': ['█ █', ' █ ', ' █ ', ' █ '],
        'Z': ['███', ' █ ', '█  ', '███'],
        '0': ['███', '█ █', '█ █', '███'],
        '1': [' █ ', '██ ', ' █ ', '███'],
        '2': ['███', ' ██', '█  ', '███'],
        '3': ['███', ' ██', ' ██', '███'],
        '4': ['█ █', '███', '  █', '  █'],
        '5': ['███', '██ ', ' ██', '███'],
        '6': ['███', '██ ', '█ █', '███'],
        '7': ['███', '  █', ' █ ', '█  '],
        '8': ['███', '███', '███', '███'],
        '9': ['███', '█ █', '███', '███'],
        ' ': ['   ', '   ', '   ', '   ']
      }
    },
    block: {
      name: '方块字体',
      patterns: {
        'A': ['██████', '██  ██', '██████', '██  ██', '██  ██'],
        'B': ['██████', '██  ██', '██████', '██  ██', '██████'],
        'C': ['██████', '██    ', '██    ', '██    ', '██████'],
        'D': ['██████', '██  ██', '██  ██', '██  ██', '██████'],
        'E': ['██████', '██    ', '██████', '██    ', '██████'],
        'F': ['██████', '██    ', '██████', '██    ', '██    '],
        'G': ['██████', '██    ', '██  ██', '██  ██', '██████'],
        'H': ['██  ██', '██  ██', '██████', '██  ██', '██  ██'],
        'I': ['██████', '  ██  ', '  ██  ', '  ██  ', '██████'],
        'J': ['██████', '    ██', '    ██', '██  ██', '██████'],
        'K': ['██  ██', '██ ██ ', '██████', '██ ██ ', '██  ██'],
        'L': ['██    ', '██    ', '██    ', '██    ', '██████'],
        'M': ['██  ██', '██████', '██  ██', '██  ██', '██  ██'],
        'N': ['██  ██', '██████', '██████', '██  ██', '██  ██'],
        'O': ['██████', '██  ██', '██  ██', '██  ██', '██████'],
        'P': ['██████', '██  ██', '██████', '██    ', '██    '],
        'Q': ['██████', '██  ██', '██████', '██  ██', '██████'],
        'R': ['██████', '██  ██', '██████', '██  ██', '██  ██'],
        'S': ['██████', '██    ', '██████', '    ██', '██████'],
        'T': ['██████', '  ██  ', '  ██  ', '  ██  ', '  ██  '],
        'U': ['██  ██', '██  ██', '██  ██', '██  ██', '██████'],
        'V': ['██  ██', '██  ██', '██  ██', ' ████ ', '  ██  '],
        'W': ['██  ██', '██  ██', '██  ██', '██████', '██  ██'],
        'X': ['██  ██', ' ████ ', '  ██  ', ' ████ ', '██  ██'],
        'Y': ['██  ██', ' ████ ', '  ██  ', '  ██  ', '  ██  '],
        'Z': ['██████', '   ██ ', '  ██  ', ' ██   ', '██████'],
        '0': ['██████', '██  ██', '██  ██', '██  ██', '██████'],
        '1': ['  ██  ', ' ███  ', '  ██  ', '  ██  ', '██████'],
        '2': ['██████', '██  ██', '  ████', ' ██   ', '██████'],
        '3': ['██████', '██  ██', '  ████', '██  ██', '██████'],
        '4': ['██  ██', '██  ██', '██████', '    ██', '    ██'],
        '5': ['██████', '██    ', '██████', '    ██', '██████'],
        '6': ['██████', '██    ', '██████', '██  ██', '██████'],
        '7': ['██████', '    ██', '   ██ ', '  ██  ', ' ██   '],
        '8': ['██████', '██  ██', '██████', '██  ██', '██████'],
        '9': ['██████', '██  ██', '██████', '    ██', '██████'],
        ' ': ['      ', '      ', '      ', '      ', '      ']
      }
    }
  };

  // 生成ASCII艺术
  const generateAsciiArt = () => {
    if (!inputText.trim()) {
      setAsciiResult('');
      return;
    }

    const text = inputText.toUpperCase();
    const font = fonts[selectedFont as keyof typeof fonts];
    const height = Object.values(font.patterns)[0].length;
    
    let result = [];
    
    for (let row = 0; row < height; row++) {
      let line = '';
      for (let char of text) {
        const pattern = font.patterns[char as keyof typeof font.patterns];
        if (pattern) {
          line += pattern[row] + ' ';
        } else {
          // 对于不支持的字符，用空格代替
          line += ' '.repeat(font.patterns[' '][row].length) + ' ';
        }
      }
      result.push(line.trimEnd());
    }
    
    setAsciiResult(result.join('\n'));
  };

  // 复制到剪贴板
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(asciiResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  // 下载为文本文件
  const downloadAsFile = () => {
    const blob = new Blob([asciiResult], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ascii-art-${inputText.replace(/[^a-zA-Z0-9]/g, '')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    generateAsciiArt();
  }, [inputText, selectedFont]);

  return (
    <ToolLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8" />
            ASCII艺术生成器
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            将文本转换为ASCII艺术字，支持多种字体样式
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 输入设置 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              输入设置
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Type className="inline h-4 w-4 mr-1" />
                  输入文本
                </label>
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="输入要转换的文本"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-lg"
                  maxLength={20}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  支持英文字母、数字和空格，最多20个字符
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  字体样式
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(fonts).map(([key, font]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedFont(key)}
                      className={`p-4 rounded-lg border text-left transition-colors ${
                        selectedFont === key
                          ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/20 dark:border-blue-400 dark:text-blue-300'
                          : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      <div className="font-medium">{font.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        字符高度: {Object.values(font.patterns)[0].length}行
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 预览小样 */}
              {inputText && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    预览（首字符）
                  </h4>
                  <pre className="text-xs font-mono text-gray-800 dark:text-gray-200">
                    {fonts[selectedFont as keyof typeof fonts].patterns[inputText.toUpperCase()[0] as keyof typeof fonts.standard.patterns]?.join('\n') || '不支持的字符'}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* 结果显示 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                ASCII艺术结果
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  disabled={!asciiResult}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    !asciiResult
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : copied
                      ? 'bg-green-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <Copy className="h-4 w-4" />
                  {copied ? '已复制' : '复制'}
                </button>
                <button
                  onClick={downloadAsFile}
                  disabled={!asciiResult}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    !asciiResult
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  <Download className="h-4 w-4" />
                  下载
                </button>
              </div>
            </div>

            {asciiResult ? (
              <div className="bg-gray-900 dark:bg-gray-950 p-6 rounded-lg overflow-x-auto">
                <pre className="text-green-400 font-mono text-sm leading-tight whitespace-pre">
                  {asciiResult}
                </pre>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-700 p-12 rounded-lg text-center">
                <Sparkles className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  开始创作
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  输入文本即可生成ASCII艺术
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 示例展示 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            示例展示
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(fonts).map(([key, font]) => (
              <div key={key} className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {font.name}
                </h4>
                <div className="bg-gray-900 dark:bg-gray-950 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-green-400 font-mono text-xs leading-tight">
                    {font.patterns.A.join('\n')}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 应用场景 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">
              应用场景
            </h3>
            <ul className="space-y-2 text-blue-700 dark:text-blue-300">
              <li>• 社交媒体个性签名</li>
              <li>• 程序注释和文档美化</li>
              <li>• 终端应用界面设计</li>
              <li>• 电子邮件签名装饰</li>
              <li>• 论坛发帖个性化</li>
              <li>• 代码库README文件</li>
            </ul>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-4">
              使用提示
            </h3>
            <ul className="space-y-2 text-green-700 dark:text-green-300">
              <li>• 短文本效果更佳，建议1-10个字符</li>
              <li>• 标准字体适合大多数场景</li>
              <li>• 小号字体节省空间，适合嵌入代码</li>
              <li>• 方块字体视觉效果突出</li>
              <li>• 可复制或下载保存结果</li>
              <li>• 支持英文字母、数字和空格</li>
            </ul>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">
            使用说明
          </h3>
          <ul className="space-y-2 text-blue-700 dark:text-blue-300">
            <li>• 在左侧输入框中输入要转换的文本</li>
            <li>• 选择喜欢的字体样式</li>
            <li>• 右侧会实时显示ASCII艺术结果</li>
            <li>• 点击"复制"按钮复制到剪贴板</li>
            <li>• 点击"下载"按钮保存为文本文件</li>
            <li>• 查看示例了解不同字体的效果</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}