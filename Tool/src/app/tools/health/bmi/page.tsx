'use client';

import { ToolLayout } from '@/components/tool-layout';
import { useState } from 'react';
import { Heart, Scale, Activity, TrendingUp, Info } from 'lucide-react';
import { useToolTranslations } from '@/components/tool-translations';
import { useLanguage } from '@/components/language-provider';

interface BMICategory {
  range: string;
  category: string;
  description: string;
  color: string;
  bgColor: string;
}

export default function BMICalculator() {
  const { getToolTranslation, getUITranslation, getToolPageTranslation } = useToolTranslations();
  const { t } = useLanguage();
  const toolTranslation = getToolTranslation('health-bmi');
  const ui = getUITranslation();
  const pageTranslation = getToolPageTranslation('health-bmi');
  
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bmi, setBmi] = useState<number | null>(null);
  const [category, setCategory] = useState<BMICategory | null>(null);
  const [idealWeight, setIdealWeight] = useState({ min: 0, max: 0 });

  const bmiCategories: BMICategory[] = [
    {
      range: pageTranslation.bmiCategories.underweight.range,
      category: pageTranslation.bmiCategories.underweight.status,
      description: pageTranslation.bmiCategories.underweight.description,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      range: pageTranslation.bmiCategories.normal.range,
      category: pageTranslation.bmiCategories.normal.status,
      description: pageTranslation.bmiCategories.normal.description,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      range: pageTranslation.bmiCategories.overweight.range,
      category: pageTranslation.bmiCategories.overweight.status,
      description: pageTranslation.bmiCategories.overweight.description,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    },
    {
      range: pageTranslation.bmiCategories.obese.range,
      category: pageTranslation.bmiCategories.obese.status,
      description: pageTranslation.bmiCategories.obese.description,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
    },
  ];

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
      } else {
        selectedCategory = bmiCategories[3];
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
    return bmiCategories[3];
  };

  return (
    <ToolLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {toolTranslation.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {toolTranslation.description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 输入区域 */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {pageTranslation.title}
              </h2>

              <div className="space-y-4">
                {/* 身高输入 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {pageTranslation.height}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder={ui.placeholders.enterNumber}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      cm
                    </div>
                  </div>
                </div>

                {/* 体重输入 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {pageTranslation.weight}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder={ui.placeholders.enterNumber}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      kg
                    </div>
                  </div>
                </div>

                {/* 计算按钮 */}
                <button
                  onClick={calculateBMI}
                  disabled={!weight || !height}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Scale className="w-5 h-5" />
                  {pageTranslation.calculate}
                </button>
              </div>
            </div>
          </div>

          {/* 结果区域 */}
          <div className="space-y-6">
            {bmi && (
              <>
                {/* BMI结果 */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {pageTranslation.result}
                  </h2>
                  
                  <div className="text-center space-y-4">
                    <div className="text-4xl font-bold text-blue-600">
                      {bmi.toFixed(1)}
                    </div>
                    <div className="text-lg text-gray-600 dark:text-gray-400">
                      BMI
                    </div>
                    
                    {category && (
                      <div className={`p-4 rounded-lg ${category.bgColor}`}>
                        <div className={`text-lg font-semibold ${category.color}`}>
                          {category.category}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {category.description}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 理想体重范围 */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    理想体重范围
                  </h3>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {idealWeight.min.toFixed(1)} - {idealWeight.max.toFixed(1)} kg
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      基于您的身高计算
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* BMI分类说明 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                BMI分类标准
              </h3>
              <div className="space-y-3">
                {bmiCategories.map((cat, index) => (
                  <div key={index} className={`p-3 rounded-lg ${cat.bgColor}`}>
                    <div className="flex justify-between items-center">
                      <span className={`font-medium ${cat.color}`}>
                        {cat.category}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {cat.range}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {cat.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
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