'use client';

import { ToolLayout } from '@/components/tool-layout';
import { useState } from 'react';
import { Database, Copy, Download, RefreshCw } from 'lucide-react';

interface DataType {
  id: string;
  name: string;
  description: string;
  generator: () => any;
}

export default function DataGeneratorPage() {
  const [selectedType, setSelectedType] = useState('');
  const [count, setCount] = useState(10);
  const [generatedData, setGeneratedData] = useState<string>('');

  const dataTypes: DataType[] = [
    {
      id: 'user',
      name: '用户数据',
      description: '生成用户信息，包括姓名、邮箱、电话等',
      generator: () => ({
        id: Math.floor(Math.random() * 10000),
        name: generateName(),
        email: generateEmail(),
        phone: generatePhone(),
        address: generateAddress(),
        createdAt: new Date().toISOString()
      })
    },
    {
      id: 'product',
      name: '产品数据',
      description: '生成产品信息，包括名称、价格、描述等',
      generator: () => ({
        id: Math.floor(Math.random() * 10000),
        name: generateProductName(),
        price: (Math.random() * 1000).toFixed(2),
        category: generateCategory(),
        description: generateDescription(),
        inStock: Math.random() > 0.3
      })
    },
    {
      id: 'order',
      name: '订单数据',
      description: '生成订单信息，包括订单号、金额、状态等',
      generator: () => ({
        id: generateOrderId(),
        customerId: Math.floor(Math.random() * 1000),
        total: (Math.random() * 500).toFixed(2),
        status: generateOrderStatus(),
        items: Math.floor(Math.random() * 5) + 1,
        createdAt: new Date().toISOString()
      })
    },
    {
      id: 'article',
      name: '文章数据',
      description: '生成文章信息，包括标题、内容、作者等',
      generator: () => ({
        id: Math.floor(Math.random() * 10000),
        title: generateTitle(),
        content: generateContent(),
        author: generateName(),
        category: generateCategory(),
        publishedAt: new Date().toISOString()
      })
    }
  ];

  const generateName = () => {
    const firstNames = ['张', '李', '王', '刘', '陈', '杨', '赵', '黄', '周', '吴'];
    const lastNames = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '军'];
    return firstNames[Math.floor(Math.random() * firstNames.length)] + 
           lastNames[Math.floor(Math.random() * lastNames.length)];
  };

  const generateEmail = () => {
    const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'qq.com'];
    const name = generateName().toLowerCase();
    const domain = domains[Math.floor(Math.random() * domains.length)];
    return `${name}${Math.floor(Math.random() * 1000)}@${domain}`;
  };

  const generatePhone = () => {
    const prefixes = ['130', '131', '132', '133', '134', '135', '136', '137', '138', '139'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    return `${prefix}${suffix}`;
  };

  const generateAddress = () => {
    const cities = ['北京', '上海', '广州', '深圳', '杭州', '南京', '成都', '武汉', '西安', '重庆'];
    const districts = ['朝阳区', '海淀区', '浦东新区', '黄浦区', '天河区', '越秀区'];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const district = districts[Math.floor(Math.random() * districts.length)];
    return `${city}${district}某某街道${Math.floor(Math.random() * 100)}号`;
  };

  const generateProductName = () => {
    const prefixes = ['智能', '高级', '专业', '经典', '时尚', '实用'];
    const products = ['手机', '电脑', '耳机', '手表', '相机', '平板', '键盘', '鼠标'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const product = products[Math.floor(Math.random() * products.length)];
    return `${prefix}${product}`;
  };

  const generateCategory = () => {
    const categories = ['电子产品', '服装', '食品', '家居', '运动', '图书', '美妆', '汽车'];
    return categories[Math.floor(Math.random() * categories.length)];
  };

  const generateDescription = () => {
    const descriptions = [
      '高品质产品，值得信赖',
      '性价比超高，推荐购买',
      '设计精美，功能强大',
      '用户评价很好，值得推荐',
      '质量保证，售后无忧'
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  };

  const generateOrderId = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD${year}${month}${day}${random}`;
  };

  const generateOrderStatus = () => {
    const statuses = ['待付款', '已付款', '已发货', '已完成', '已取消'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  };

  const generateTitle = () => {
    const titles = [
      '如何提高工作效率',
      '现代科技发展趋势',
      '健康生活方式指南',
      '投资理财基础知识',
      '旅游攻略分享'
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  };

  const generateContent = () => {
    const contents = [
      '这是一篇关于技术发展的文章，探讨了现代科技对生活的影响。',
      '本文介绍了如何通过科学的方法提高个人工作效率。',
      '文章分析了当前市场趋势，为读者提供了有价值的见解。',
      '这是一篇关于健康生活的指南，包含了实用的建议。',
      '本文分享了作者的经验和心得，希望对读者有所帮助。'
    ];
    return contents[Math.floor(Math.random() * contents.length)];
  };

  const generateData = () => {
    if (!selectedType) return;

    const dataType = dataTypes.find(type => type.id === selectedType);
    if (!dataType) return;

    const data = [];
    for (let i = 0; i < count; i++) {
      data.push(dataType.generator());
    }

    setGeneratedData(JSON.stringify(data, null, 2));
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedData);
      alert('数据已复制到剪贴板');
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const downloadData = () => {
    const blob = new Blob([generatedData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedType}_data.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearData = () => {
    setGeneratedData('');
    setSelectedType('');
    setCount(10);
  };

  return (
    <ToolLayout>
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          数据生成器
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          生成各种类型的测试数据，支持用户、产品、订单、文章等
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 配置区域 */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              生成配置
            </h2>
            
            <div className="space-y-4">
              {/* 数据类型选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  数据类型
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {dataTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`p-3 rounded-lg border transition-colors text-left ${
                        selectedType === type.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="font-medium text-gray-900 dark:text-white">
                        {type.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {type.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 数量设置 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  生成数量: {count}
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>1</span>
                  <span>50</span>
                  <span>100</span>
                </div>
              </div>

              {/* 生成按钮 */}
              <button
                onClick={generateData}
                disabled={!selectedType}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <Database className="w-4 h-4" />
                生成数据
              </button>
            </div>
          </div>
        </div>

        {/* 结果区域 */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                生成结果
              </h2>
              {generatedData && (
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    复制
                  </button>
                  <button
                    onClick={downloadData}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-700 dark:text-green-300 rounded transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    下载
                  </button>
                  <button
                    onClick={clearData}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-300 rounded transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    清空
                  </button>
                </div>
              )}
            </div>
            
            {generatedData ? (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <pre className="text-sm font-mono text-gray-900 dark:text-white overflow-x-auto whitespace-pre-wrap">
                  {generatedData}
                </pre>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                <Database className="h-16 w-16 mb-4 text-gray-300" />
                <p>请选择数据类型并点击生成</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
} 