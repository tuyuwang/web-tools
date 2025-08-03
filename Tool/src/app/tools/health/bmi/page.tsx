'use client';

import { ToolLayout } from '@/components/tool-layout';
import { useState } from 'react';
import { Heart, Scale, Activity, TrendingUp, Info } from 'lucide-react';

interface BMICategory {
  range: string;
  category: string;
  description: string;
  color: string;
  bgColor: string;
}

const bmiCategories: BMICategory[] = [
  {
    range: '< 18.5',
    category: '体重过轻',
    description: '体重低于正常范围，建议适当增重',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
  },
  {
    range: '18.5 - 24.9',
    category: '正常体重',
    description: '体重在健康范围内，继续保持',
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
  },
  {
    range: '25.0 - 29.9',
    category: '超重',
    description: '体重略高于正常范围，建议适当减重',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
  },
  {
    range: '30.0 - 34.9',
    category: '肥胖（一级）',
    description: '体重明显超标，建议制定减重计划',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
  },
  {
    range: '35.0 - 39.9',
    category: '肥胖（二级）',
    description: '体重严重超标，建议咨询医生',
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
  },
  {
    range: '≥ 40.0',
    category: '肥胖（三级）',
    description: '体重极度超标，需要医疗干预',
    color: 'text-red-800',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
  },
];

export default function BMICalculator() {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bmi, setBmi] = useState<number | null>(null);
  const [category, setCategory] = useState<BMICategory | null>(null);
  const [idealWeight, setIdealWeight] = useState({ min: 0, max: 0 });

  const calculateBMI = () => {
    const weightKg = parseFloat(weight);
    const heightM = parseFloat(height) / 100; // 转换为米

    if (weightKg > 0 && heightM > 0) {
      const bmiValue = weightKg / (heightM * heightM);
      setBmi(bmiValue);

      // 确定BMI类别
      let selectedCategory: BMICategory;
      if (bmiValue < 18.5) {
        selectedCategory = bmiCategories[0];
      } else if (bmiValue < 25) {
        selectedCategory = bmiCategories[1];
      } else if (bmiValue < 30) {
        selectedCategory = bmiCategories[2];
      } else if (bmiValue < 35) {
        selectedCategory = bmiCategories[3];
      } else if (bmiValue < 40) {
        selectedCategory = bmiCategories[4];
      } else {
        selectedCategory = bmiCategories[5];
      }
      setCategory(selectedCategory);

      // 计算理想体重范围
      const minIdealWeight = 18.5 * heightM * heightM;
      const maxIdealWeight = 24.9 * heightM * heightM;
      setIdealWeight({ min: minIdealWeight, max: maxIdealWeight });
    }
  };

  const getBMICategory = (bmiValue: number): BMICategory => {
    if (bmiValue < 18.5) return bmiCategories[0];
    if (bmiValue < 25) return bmiCategories[1];
    if (bmiValue < 30) return bmiCategories[2];
    if (bmiValue < 35) return bmiCategories[3];
    if (bmiValue < 40) return bmiCategories[4];
    return bmiCategories[5];
  };

  return (
    <ToolLayout>
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Heart className="h-8 w-8 text-primary-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            BMI计算器
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          计算身体质量指数，评估体重健康状况
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 左侧：输入和计算 */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              输入信息
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  体重 (kg)
                </label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="请输入体重"
                  step="0.1"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  身高 (cm)
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="请输入身高"
                  step="0.1"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
              </div>

              <button
                onClick={calculateBMI}
                disabled={!weight || !height}
                className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <Scale className="h-5 w-5 mr-2" />
                计算BMI
              </button>
            </div>
          </div>

          {bmi !== null && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                计算结果
              </h2>
              
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-primary-600 mb-2">
                  {bmi.toFixed(1)}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  您的BMI指数
                </div>
              </div>

              {category && (
                <div className={`p-4 rounded-lg ${category.bgColor}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`font-semibold ${category.color}`}>
                      {category.category}
                    </h3>
                    <span className={`text-sm ${category.color}`}>
                      {category.range}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {category.description}
                  </p>
                </div>
              )}

              {idealWeight.min > 0 && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    理想体重范围
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    {idealWeight.min.toFixed(1)} - {idealWeight.max.toFixed(1)} kg
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 右侧：BMI分类表 */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              BMI分类标准
            </h2>
            
            <div className="space-y-3">
              {bmiCategories.map((cat, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    bmi !== null && getBMICategory(bmi).category === cat.category
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-medium ${cat.color}`}>
                      {cat.category}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {cat.range}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {cat.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                  使用说明
                </h3>
                <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
                  <li>• BMI = 体重(kg) / 身高(m)²</li>
                  <li>• 适用于18-65岁的成年人</li>
                  <li>• 不适用于运动员、孕妇等特殊人群</li>
                  <li>• 仅供参考，具体健康建议请咨询医生</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
} 