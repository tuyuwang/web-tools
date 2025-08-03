'use client';

import { ToolLayout } from '@/components/tool-layout';
import { useState } from 'react';
import { Heart, Activity } from 'lucide-react';
import { useToolTranslations } from '@/components/tool-translations';
import { useLanguage } from '@/components/language-provider';

export default function CalorieCalculator() {
  const { getToolTranslation, getUITranslation, getToolPageTranslation } = useToolTranslations();
  const { t } = useLanguage();
  const toolTranslation = getToolTranslation('health-calorie');
  const ui = getUITranslation();
  const pageTranslation = getToolPageTranslation('health-calorie');
  
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [calories, setCalories] = useState<number | null>(null);

  const activityLevels = [
    { value: 'sedentary', ...pageTranslation.activityLevels.sedentary },
    { value: 'lightlyActive', ...pageTranslation.activityLevels.lightlyActive },
    { value: 'moderatelyActive', ...pageTranslation.activityLevels.moderatelyActive },
    { value: 'veryActive', ...pageTranslation.activityLevels.veryActive },
    { value: 'extremelyActive', ...pageTranslation.activityLevels.extremelyActive },
  ];

  const goals = [
    { value: 'lose', label: pageTranslation.goals.lose },
    { value: 'maintain', label: pageTranslation.goals.maintain },
    { value: 'gain', label: pageTranslation.goals.gain },
  ];

  const handleCalculate = () => {
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);
    const ageNum = parseFloat(age);
    
    if (weightNum > 0 && heightNum > 0 && ageNum > 0) {
      // 基础代谢率计算（Mifflin-St Jeor公式）
      let bmr;
      if (gender === 'male') {
        bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum + 5;
      } else {
        bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum - 161;
      }
      
      // 活动系数
      const activityMultipliers = {
        sedentary: 1.2,      // 久坐不动
        lightlyActive: 1.375,        // 轻度活动
        moderatelyActive: 1.55,      // 中度活动
        veryActive: 1.725,       // 重度活动
        extremelyActive: 1.9      // 极重度活动
      };
      
      const dailyCalories = bmr * activityMultipliers[activityLevel as keyof typeof activityMultipliers];
      setCalories(dailyCalories);
    }
  };

  return (
    <ToolLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Heart className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {toolTranslation.title}
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {toolTranslation.description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 输入区域 */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {pageTranslation.personalInfo}
              </h2>

              <div className="space-y-4">
                {/* 基本信息 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {pageTranslation.weight}
                    </label>
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder={ui.placeholders.enterNumber}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {pageTranslation.height}
                    </label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder={ui.placeholders.enterNumber}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      年龄
                    </label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder={ui.placeholders.enterNumber}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      性别
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="male">男性</option>
                      <option value="female">女性</option>
                    </select>
                  </div>
                </div>

                {/* 活动水平 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {pageTranslation.activityLevel}
                  </label>
                  <div className="space-y-2">
                    {activityLevels.map((level) => (
                      <label key={level.value} className="flex items-center">
                        <input
                          type="radio"
                          name="activityLevel"
                          value={level.value}
                          checked={activityLevel === level.value}
                          onChange={(e) => setActivityLevel(e.target.value)}
                          className="mr-2"
                        />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{level.name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{level.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 目标 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {pageTranslation.goal}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {goals.map((goal) => (
                      <label key={goal.value} className="flex items-center">
                        <input
                          type="radio"
                          name="goal"
                          value={goal.value}
                          className="mr-2"
                        />
                        <span className="text-sm">{goal.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 计算按钮 */}
                <button
                  onClick={handleCalculate}
                  disabled={!weight || !height || !age}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Activity className="w-5 h-5" />
                  {pageTranslation.calculate}
                </button>
              </div>
            </div>
          </div>

          {/* 结果区域 */}
          <div className="space-y-6">
            {calories && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {pageTranslation.result}
                </h2>
                
                <div className="text-center space-y-4">
                  <div className="text-4xl font-bold text-green-600">
                    {Math.round(calories)}
                  </div>
                  <div className="text-lg text-gray-600 dark:text-gray-400">
                    卡路里/天
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <div className="text-sm text-green-800 dark:text-green-200">
                      这是您每日所需的基础卡路里摄入量，基于您的个人信息和活动水平计算得出。
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 营养建议 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                营养建议
              </h3>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <div>• 蛋白质：总热量的10-35%</div>
                <div>• 碳水化合物：总热量的45-65%</div>
                <div>• 脂肪：总热量的20-35%</div>
                <div>• 建议多摄入蔬菜、水果和全谷物</div>
                <div>• 保持充足的水分摄入</div>
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