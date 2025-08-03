'use client';

import { ToolLayout } from '@/components/tool-layout';
import { useState } from 'react';
import { Heart, Activity } from 'lucide-react';

export default function CalorieCalculator() {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [calories, setCalories] = useState<number | null>(null);

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
        light: 1.375,        // 轻度活动
        moderate: 1.55,      // 中度活动
        active: 1.725,       // 重度活动
        veryActive: 1.9      // 极重度活动
      };
      
      const dailyCalories = bmr * activityMultipliers[activityLevel as keyof typeof activityMultipliers];
      setCalories(dailyCalories);
    }
  };

  return (
    <ToolLayout>
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Heart className="h-8 w-8 text-primary-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            卡路里计算器
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          每日卡路里需求计算，食物营养成分查询
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                体重 (kg)
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="请输入体重"
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
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
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
                placeholder="请输入年龄"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                性别
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                <option value="male">男性</option>
                <option value="female">女性</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              活动水平
            </label>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              <option value="sedentary">久坐不动</option>
              <option value="light">轻度活动</option>
              <option value="moderate">中度活动</option>
              <option value="active">重度活动</option>
              <option value="veryActive">极重度活动</option>
            </select>
          </div>

          <button
            onClick={handleCalculate}
            disabled={!weight || !height || !age}
            className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <Activity className="h-5 w-5 mr-2" />
            计算卡路里
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              计算结果
            </h2>
            
            {calories !== null ? (
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {Math.round(calories)} 卡路里
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      每日所需卡路里
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    健康建议
                  </h3>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• 根据计算结果合理安排饮食</li>
                    <li>• 注意营养均衡，不要过度节食</li>
                    <li>• 结合运动来达到健康目标</li>
                    <li>• 建议咨询专业营养师</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg border border-gray-200 dark:border-gray-600 text-center">
                <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  输入个人信息进行计算
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
} 