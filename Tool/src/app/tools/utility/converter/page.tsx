'use client';

import { useState } from 'react';
import { RotateCcw, Copy } from 'lucide-react';

const categories = [
  { id: 'length', name: '长度', units: ['米', '厘米', '千米', '英尺', '英寸', '英里'] },
  { id: 'weight', name: '重量', units: ['千克', '克', '磅', '盎司', '吨'] },
  { id: 'temperature', name: '温度', units: ['摄氏度', '华氏度', '开尔文'] },
  { id: 'area', name: '面积', units: ['平方米', '平方厘米', '平方千米', '平方英尺', '英亩'] },
];

export default function UnitConverterPage() {
  const [category, setCategory] = useState('length');
  const [fromUnit, setFromUnit] = useState('米');
  const [toUnit, setToUnit] = useState('英尺');
  const [fromValue, setFromValue] = useState('');
  const [toValue, setToValue] = useState('');

  const currentUnits = categories.find(c => c.id === category)?.units || [];

  const convert = (value: string) => {
    if (!value || !fromUnit || !toUnit) return '';
    
    const num = parseFloat(value);
    if (isNaN(num)) return '';

    // 简化的转换逻辑
    let result = 0;
    
    if (category === 'length') {
      // 长度转换（以米为基准）
      const toMeter: { [key: string]: number } = {
        '米': 1, '厘米': 0.01, '千米': 1000, '英尺': 0.3048, '英寸': 0.0254, '英里': 1609.344
      };
      const fromMeter: { [key: string]: number } = {
        '米': 1, '厘米': 100, '千米': 0.001, '英尺': 3.28084, '英寸': 39.3701, '英里': 0.000621371
      };
      
      const meters = num * toMeter[fromUnit];
      result = meters * fromMeter[toUnit];
    } else if (category === 'temperature') {
      // 温度转换
      let celsius = 0;
      if (fromUnit === '摄氏度') celsius = num;
      else if (fromUnit === '华氏度') celsius = (num - 32) * 5 / 9;
      else if (fromUnit === '开尔文') celsius = num - 273.15;
      
      if (toUnit === '摄氏度') result = celsius;
      else if (toUnit === '华氏度') result = celsius * 9 / 5 + 32;
      else if (toUnit === '开尔文') result = celsius + 273.15;
    }

    return result.toFixed(4).replace(/\.?0+$/, '');
  };

  const handleFromValueChange = (value: string) => {
    setFromValue(value);
    if (value) {
      const result = convert(value);
      setToValue(result);
    } else {
      setToValue('');
    }
  };

  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    if (fromValue) {
      const result = convert(fromValue);
      setToValue(result);
    }
  };

  const clearAll = () => {
    setFromValue('');
    setToValue('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          单位转换器
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          支持长度、重量、温度、面积等常用单位转换
        </p>
      </div>

      {/* 类别选择 */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          选择转换类别
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`p-3 rounded-lg border transition-colors ${
                category === cat.id
                  ? 'bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-300'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* 转换器 */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {categories.find(c => c.id === category)?.name}转换
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={swapUnits}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="交换单位"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
            <button
              onClick={clearAll}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-colors"
            >
              清空
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 输入 */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              从
            </label>
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {currentUnits.map((unit) => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
            <input
              type="number"
              value={fromValue}
              onChange={(e) => handleFromValueChange(e.target.value)}
              placeholder="输入数值"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 输出 */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              到
            </label>
            <select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {currentUnits.map((unit) => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
            <input
              type="text"
              value={toValue}
              readOnly
              placeholder="转换结果"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 