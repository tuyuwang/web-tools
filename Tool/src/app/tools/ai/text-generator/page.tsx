'use client';

import { useState } from 'react';
import { Metadata } from 'next';
import { Copy, Download, RefreshCw, MessageSquare, User, Building, Globe, Hash } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';

const textGenerators = {
  lorem: {
    name: 'Lorem Ipsum',
    description: '经典的拉丁文占位符文本',
    icon: MessageSquare,
    generate: (count: number) => {
      const loremWords = [
        'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
        'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
        'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
        'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
        'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
        'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
        'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
        'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
      ];
      
      const sentences = [];
      for (let i = 0; i < count; i++) {
        const sentenceLength = Math.floor(Math.random() * 15) + 5;
        const words = [];
        for (let j = 0; j < sentenceLength; j++) {
          words.push(loremWords[Math.floor(Math.random() * loremWords.length)]);
        }
        words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
        sentences.push(words.join(' ') + '.');
      }
      return sentences.join(' ');
    }
  },
  chinese: {
    name: '中文假文',
    description: '中文占位符文本生成',
    icon: Globe,
    generate: (count: number) => {
      const chineseWords = [
        '这是', '一个', '测试', '文本', '内容', '示例', '数据', '信息', '系统', '功能',
        '页面', '网站', '应用', '程序', '开发', '设计', '用户', '体验', '界面', '交互',
        '响应', '移动', '端口', '服务', '平台', '工具', '方案', '解决', '问题', '需求',
        '分析', '研究', '报告', '结果', '效果', '性能', '优化', '提升', '改进', '完善'
      ];
      
      const sentences = [];
      for (let i = 0; i < count; i++) {
        const sentenceLength = Math.floor(Math.random() * 12) + 6;
        const words = [];
        for (let j = 0; j < sentenceLength; j++) {
          words.push(chineseWords[Math.floor(Math.random() * chineseWords.length)]);
        }
        sentences.push(words.join('') + '。');
      }
      return sentences.join('');
    }
  },
  person: {
    name: '人员信息',
    description: '生成虚拟人员信息数据',
    icon: User,
    generate: (count: number) => {
      const firstNames = ['张', '王', '李', '赵', '刘', '陈', '杨', '黄', '周', '吴'];
      const lastNames = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋'];
      const departments = ['技术部', '市场部', '销售部', '人事部', '财务部', '运营部'];
      const positions = ['经理', '主管', '专员', '助理', '总监', '副总'];
      
      const people = [];
      for (let i = 0; i < count; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const department = departments[Math.floor(Math.random() * departments.length)];
        const position = positions[Math.floor(Math.random() * positions.length)];
        const age = Math.floor(Math.random() * 40) + 22;
        const phone = `138${Math.floor(Math.random() * 90000000) + 10000000}`;
        
        people.push(`姓名: ${firstName}${lastName}, 部门: ${department}, 职位: ${position}, 年龄: ${age}, 电话: ${phone}`);
      }
      return people.join('\n');
    }
  },
  company: {
    name: '公司信息',
    description: '生成虚拟公司信息数据',
    icon: Building,
    generate: (count: number) => {
      const companyTypes = ['科技有限公司', '贸易有限公司', '实业有限公司', '投资有限公司', '咨询有限公司'];
      const cities = ['北京', '上海', '广州', '深圳', '杭州', '南京', '成都', '武汉'];
      const industries = ['互联网', '金融', '教育', '医疗', '制造业', '服务业', '零售业'];
      
      const companies = [];
      for (let i = 0; i < count; i++) {
        const name = `${cities[Math.floor(Math.random() * cities.length)]}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${companyTypes[Math.floor(Math.random() * companyTypes.length)]}`;
        const industry = industries[Math.floor(Math.random() * industries.length)];
        const employees = Math.floor(Math.random() * 5000) + 50;
        const revenue = (Math.random() * 10000).toFixed(2);
        
        companies.push(`公司: ${name}, 行业: ${industry}, 员工数: ${employees}, 年收入: ${revenue}万元`);
      }
      return companies.join('\n');
    }
  },
  uuid: {
    name: 'UUID生成',
    description: '生成唯一标识符',
    icon: Hash,
    generate: (count: number) => {
      const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };
      
      const uuids = [];
      for (let i = 0; i < count; i++) {
        uuids.push(generateUUID());
      }
      return uuids.join('\n');
    }
  }
};

export default function TextGeneratorPage() {
  const [selectedType, setSelectedType] = useState('lorem');
  const [count, setCount] = useState(3);
  const [generatedText, setGeneratedText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 300)); // 模拟生成延迟
    
    const generator = textGenerators[selectedType as keyof typeof textGenerators];
    const text = generator.generate(count);
    setGeneratedText(text);
    setIsGenerating(false);
  };

  const handleCopy = async () => {
    if (generatedText) {
      await navigator.clipboard.writeText(generatedText);
    }
  };

  const handleDownload = () => {
    if (generatedText) {
      const blob = new Blob([generatedText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-text-${selectedType}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <ToolLayout>
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* 页面标题 */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            文本生成器
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            生成各种类型的占位符文本和假数据，支持Lorem ipsum、中文假文、人员信息等
          </p>
        </div>
        
        <div className="space-y-6">
        {/* 生成类型选择 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            选择生成类型
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(textGenerators).map(([key, generator]) => {
              const IconComponent = generator.icon;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedType(key)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedType === key
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <IconComponent className={`h-5 w-5 ${
                      selectedType === key ? 'text-blue-600' : 'text-gray-500'
                    }`} />
                    <div className="text-left">
                      <div className={`font-medium ${
                        selectedType === key ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'
                      }`}>
                        {generator.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {generator.description}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 生成数量设置 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            生成数量: {count}
          </label>
          <input
            type="range"
            min="1"
            max="20"
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>1</span>
            <span>20</span>
          </div>
        </div>

        {/* 生成按钮 */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? '生成中...' : '生成文本'}</span>
        </button>

        {/* 生成结果 */}
        {generatedText && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                生成结果
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                  <Copy className="h-4 w-4" />
                  <span>复制</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center space-x-1 px-3 py-2 text-sm bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/40 text-green-700 dark:text-green-300 rounded-lg transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>下载</span>
                </button>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-100 font-mono">
                {generatedText}
              </pre>
            </div>
            
            <div className="text-sm text-gray-500 dark:text-gray-400">
              生成了 {generatedText.length} 个字符
            </div>
          </div>
        )}
        </div>
      </div>
    </ToolLayout>
  );
}