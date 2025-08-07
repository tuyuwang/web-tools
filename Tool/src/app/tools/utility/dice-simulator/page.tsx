'use client';

import { useState, useEffect } from 'react';
import { Dices, RotateCcw, Plus, Minus } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';

interface DiceResult {
  value: number;
  rolling: boolean;
}

interface RollHistory {
  timestamp: Date;
  diceType: number;
  diceCount: number;
  results: number[];
  total: number;
}

export default function DiceSimulatorPage() {
  const [diceType, setDiceType] = useState(6); // 骰子面数
  const [diceCount, setDiceCount] = useState(1); // 骰子数量
  const [results, setResults] = useState<DiceResult[]>([]);
  const [total, setTotal] = useState(0);
  const [rolling, setRolling] = useState(false);
  const [history, setHistory] = useState<RollHistory[]>([]);

  // 骰子类型选项
  const diceTypes = [
    { faces: 4, name: 'D4 (四面骰)', color: '#EF4444' },
    { faces: 6, name: 'D6 (六面骰)', color: '#3B82F6' },
    { faces: 8, name: 'D8 (八面骰)', color: '#10B981' },
    { faces: 10, name: 'D10 (十面骰)', color: '#F59E0B' },
    { faces: 12, name: 'D12 (十二面骰)', color: '#8B5CF6' },
    { faces: 20, name: 'D20 (二十面骰)', color: '#EC4899' },
    { faces: 100, name: 'D100 (百面骰)', color: '#06B6D4' }
  ];

  // 获取骰子颜色
  const getDiceColor = (faces: number) => {
    return diceTypes.find(type => type.faces === faces)?.color || '#3B82F6';
  };

  // 投掷骰子
  const rollDice = () => {
    if (rolling) return;

    setRolling(true);
    
    // 初始化结果
    const newResults: DiceResult[] = Array(diceCount).fill(null).map(() => ({
      value: 1,
      rolling: true
    }));
    setResults(newResults);

    // 模拟滚动动画
    let animationStep = 0;
    const maxSteps = 20;
    
    const animationInterval = setInterval(() => {
      animationStep++;
      
      setResults(prev => prev.map((result, index) => ({
        ...result,
        value: Math.floor(Math.random() * diceType) + 1,
        rolling: animationStep < maxSteps
      })));

      if (animationStep >= maxSteps) {
        clearInterval(animationInterval);
        
        // 最终结果
        const finalResults = Array(diceCount).fill(null).map(() => ({
          value: Math.floor(Math.random() * diceType) + 1,
          rolling: false
        }));
        
        setResults(finalResults);
        
        const newTotal = finalResults.reduce((sum, result) => sum + result.value, 0);
        setTotal(newTotal);
        setRolling(false);

        // 添加到历史记录
        const newHistoryEntry: RollHistory = {
          timestamp: new Date(),
          diceType,
          diceCount,
          results: finalResults.map(r => r.value),
          total: newTotal
        };
        
        setHistory(prev => [newHistoryEntry, ...prev.slice(0, 9)]);
      }
    }, 100);
  };

  // 重置
  const reset = () => {
    setResults([]);
    setTotal(0);
    setHistory([]);
  };

  // 调整骰子数量
  const adjustDiceCount = (delta: number) => {
    const newCount = Math.max(1, Math.min(10, diceCount + delta));
    setDiceCount(newCount);
  };

  // 渲染骰子
  const renderDice = (result: DiceResult, index: number) => {
    const color = getDiceColor(diceType);
    
    return (
      <div
        key={index}
        className={`relative w-16 h-16 rounded-lg border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-xl transition-transform duration-100 ${
          result.rolling ? 'animate-bounce' : 'hover:scale-105'
        }`}
        style={{ backgroundColor: color }}
      >
        {result.rolling ? '?' : result.value}
        {result.rolling && (
          <div className="absolute inset-0 bg-white bg-opacity-20 rounded-lg animate-pulse" />
        )}
      </div>
    );
  };

  // 获取统计信息
  const getStats = () => {
    if (results.length === 0) return null;
    
    const values = results.map(r => r.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const average = (total / diceCount).toFixed(1);
    
    return { min, max, average };
  };

  const stats = getStats();

  return (
    <ToolLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-2">
            <Dices className="h-8 w-8" />
            骰子模拟器
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            虚拟骰子投掷器，支持多种骰子类型和数量设置
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 控制面板 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              骰子设置
            </h2>
            
            <div className="space-y-6">
              {/* 骰子类型 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  骰子类型
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {diceTypes.map((type) => (
                    <button
                      key={type.faces}
                      onClick={() => setDiceType(type.faces)}
                      className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                        diceType === type.faces
                          ? 'border-blue-500 text-white'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                      style={{
                        backgroundColor: diceType === type.faces ? type.color : undefined
                      }}
                    >
                      {type.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 骰子数量 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  骰子数量: {diceCount}
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => adjustDiceCount(-1)}
                    disabled={diceCount <= 1}
                    className={`p-2 rounded-lg ${
                      diceCount <= 1
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-500 hover:bg-gray-600 text-white'
                    }`}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  
                  <div className="flex-1">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={diceCount}
                      onChange={(e) => setDiceCount(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  <button
                    onClick={() => adjustDiceCount(1)}
                    disabled={diceCount >= 10}
                    className={`p-2 rounded-lg ${
                      diceCount >= 10
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-500 hover:bg-gray-600 text-white'
                    }`}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  最多可投掷10个骰子
                </div>
              </div>

              {/* 投掷按钮 */}
              <div className="flex gap-4">
                <button
                  onClick={rollDice}
                  disabled={rolling}
                  className={`flex-1 py-3 px-6 rounded-lg font-semibold text-lg transition-colors ${
                    rolling
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {rolling ? '投掷中...' : '投掷骰子'}
                </button>
                
                <button
                  onClick={reset}
                  className="px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
                >
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>

              {/* 当前设置预览 */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p><strong>当前设置:</strong></p>
                  <p>投掷 {diceCount} 个 D{diceType}</p>
                  <p>范围: {diceCount} - {diceCount * diceType}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 结果显示 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              投掷结果
            </h2>
            
            {results.length > 0 ? (
              <div className="space-y-6">
                {/* 骰子显示 */}
                <div className="flex flex-wrap gap-4 justify-center">
                  {results.map((result, index) => renderDice(result, index))}
                </div>

                {/* 总计 */}
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {total}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    总计
                  </div>
                </div>

                {/* 统计信息 */}
                {stats && !rolling && (
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                      <div className="text-lg font-semibold text-green-800 dark:text-green-200">
                        {stats.min}
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400">
                        最小值
                      </div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                      <div className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                        {stats.average}
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400">
                        平均值
                      </div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                      <div className="text-lg font-semibold text-red-800 dark:text-red-200">
                        {stats.max}
                      </div>
                      <div className="text-xs text-red-600 dark:text-red-400">
                        最大值
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Dices className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  准备投掷
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  点击"投掷骰子"按钮开始
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 历史记录 */}
        {history.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              投掷历史 (最近10次)
            </h3>
            
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {history.map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      #{history.length - index}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {entry.diceCount}d{entry.diceType}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        [{entry.results.join(', ')}]
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {entry.total}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {entry.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 应用场景 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">
              适用场景
            </h3>
            <ul className="space-y-2 text-blue-700 dark:text-blue-300">
              <li>• 桌游和角色扮演游戏</li>
              <li>• 教学概率和统计</li>
              <li>• 随机决策和抽签</li>
              <li>• 游戏开发测试</li>
              <li>• 聚会游戏和娱乐</li>
              <li>• 数学实验和模拟</li>
            </ul>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-4">
              骰子说明
            </h3>
            <ul className="space-y-2 text-green-700 dark:text-green-300">
              <li>• D4: 四面体骰子 (1-4)</li>
              <li>• D6: 标准六面骰子 (1-6)</li>
              <li>• D8: 八面体骰子 (1-8)</li>
              <li>• D10: 十面体骰子 (1-10)</li>
              <li>• D12: 十二面体骰子 (1-12)</li>
              <li>• D20: 二十面体骰子 (1-20)</li>
            </ul>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">
            使用说明
          </h3>
          <ul className="space-y-2 text-blue-700 dark:text-blue-300">
            <li>• 选择骰子类型（D4到D100）</li>
            <li>• 调整骰子数量（1-10个）</li>
            <li>• 点击"投掷骰子"开始投掷</li>
            <li>• 查看结果、统计信息和历史记录</li>
            <li>• 使用重置按钮清除所有数据</li>
            <li>• 所有结果都是真正的随机数</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}