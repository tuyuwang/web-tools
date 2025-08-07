'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Minus, Shuffle, Settings, Download, Upload, RotateCcw, Zap } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';
import { useLanguage } from '@/components/language-provider';

interface PickerItem {
  id: string;
  text: string;
  weight: number;
  color: string;
}

const defaultColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
];

export default function RandomPickerPage() {
  const { t } = useLanguage();
  const [items, setItems] = useState<PickerItem[]>([
    { id: '1', text: '选项 1', weight: 1, color: defaultColors[0] },
    { id: '2', text: '选项 2', weight: 1, color: defaultColors[1] },
    { id: '3', text: '选项 3', weight: 1, color: defaultColors[2] },
  ]);
  
  const [newItemText, setNewItemText] = useState('');
  const [selectedItem, setSelectedItem] = useState<PickerItem | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [pickHistory, setPickHistory] = useState<PickerItem[]>([]);
  const [allowDuplicates, setAllowDuplicates] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(2); // 1-5
  
  const wheelRef = useRef<HTMLDivElement>(null);
  const spinTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const addItem = () => {
    if (newItemText.trim()) {
      const newItem: PickerItem = {
        id: Date.now().toString(),
        text: newItemText.trim(),
        weight: 1,
        color: defaultColors[items.length % defaultColors.length],
      };
      setItems([...items, newItem]);
      setNewItemText('');
    }
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof PickerItem, value: any) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const getWeightedRandom = () => {
    const availableItems = allowDuplicates ? items : items.filter(item => 
      !pickHistory.some(picked => picked.id === item.id)
    );
    
    if (availableItems.length === 0) {
      return items[Math.floor(Math.random() * items.length)];
    }

    const totalWeight = availableItems.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const item of availableItems) {
      random -= item.weight;
      if (random <= 0) {
        return item;
      }
    }
    
    return availableItems[availableItems.length - 1];
  };

  const spin = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setSelectedItem(null);

    // 模拟转盘动画
    const duration = 2000 + (animationSpeed * 500);
    const finalItem = getWeightedRandom();
    
    let currentIndex = 0;
    const interval = 100 - (animationSpeed * 15);
    
    const animate = () => {
      setSelectedItem(items[currentIndex % items.length]);
      currentIndex++;
      
      if (currentIndex < duration / interval) {
        spinTimeoutRef.current = setTimeout(animate, interval);
      } else {
        setSelectedItem(finalItem);
        setPickHistory(prev => [finalItem, ...prev.slice(0, 9)]); // 保留最近10次
        setIsSpinning(false);
      }
    };
    
    animate();
  };

  const resetHistory = () => {
    setPickHistory([]);
    setSelectedItem(null);
  };

  const exportItems = () => {
    const data = JSON.stringify(items, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'random-picker-items.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importItems = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          if (Array.isArray(imported) && imported.every(item => 
            item.id && item.text && typeof item.weight === 'number'
          )) {
            setItems(imported);
          } else {
            alert('文件格式不正确');
          }
        } catch (error) {
          alert('文件解析失败');
        }
      };
      reader.readAsText(file);
    }
    event.target.value = '';
  };

  // 清理定时器
  useEffect(() => {
    return () => {
      if (spinTimeoutRef.current) {
        clearTimeout(spinTimeoutRef.current);
      }
    };
  }, []);

  const getTotalWeight = () => {
    return items.reduce((sum, item) => sum + item.weight, 0);
  };

  const getItemProbability = (weight: number) => {
    const total = getTotalWeight();
    return total > 0 ? ((weight / total) * 100).toFixed(1) : '0.0';
  };

  return (
    <ToolLayout
      title="随机选择器"
      description="从列表中随机选择项目，支持权重设置"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 主选择界面 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 转盘/选择区域 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="text-center space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                随机选择器
              </h2>

              {/* 转盘区域 */}
              <div className="relative">
                <div 
                  ref={wheelRef}
                  className={`w-64 h-64 mx-auto rounded-full border-4 border-gray-300 dark:border-gray-600 relative overflow-hidden ${
                    isSpinning ? 'animate-spin' : ''
                  }`}
                  style={{ 
                    animationDuration: isSpinning ? `${animationSpeed}s` : '0s',
                    animationTimingFunction: 'cubic-bezier(0.23, 1, 0.320, 1)'
                  }}
                >
                  {items.map((item, index) => {
                    const angle = (360 / items.length) * index;
                    const nextAngle = (360 / items.length) * (index + 1);
                    const midAngle = (angle + nextAngle) / 2;
                    
                    return (
                      <div
                        key={item.id}
                        className="absolute inset-0 flex items-center justify-center text-white font-medium text-sm"
                        style={{
                          background: `conic-gradient(from ${angle}deg, ${item.color} 0deg, ${item.color} ${360/items.length}deg, transparent ${360/items.length}deg)`,
                          clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos((angle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((angle - 90) * Math.PI / 180)}%, ${50 + 50 * Math.cos((nextAngle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((nextAngle - 90) * Math.PI / 180)}%)`,
                        }}
                      >
                        <div 
                          className="absolute"
                          style={{
                            transform: `rotate(${midAngle}deg) translateY(-80px)`,
                            transformOrigin: '50% 80px',
                          }}
                        >
                          <span 
                            className="block text-xs font-bold"
                            style={{ transform: `rotate(${-midAngle}deg)` }}
                          >
                            {item.text.length > 8 ? item.text.substring(0, 8) + '...' : item.text}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* 中心圆 */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-white dark:bg-gray-800 rounded-full border-2 border-gray-400 dark:border-gray-500 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* 指针 */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
                  <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-transparent border-b-red-500"></div>
                </div>
              </div>

              {/* 选中结果 */}
              {selectedItem && (
                <div className="p-4 rounded-lg border-2 border-dashed border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20">
                  <div className="flex items-center justify-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: selectedItem.color }}
                    ></div>
                    <span className="text-xl font-bold text-blue-700 dark:text-blue-300">
                      {selectedItem.text}
                    </span>
                  </div>
                </div>
              )}

              {/* 控制按钮 */}
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={spin}
                  disabled={isSpinning || items.length === 0}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Shuffle className="w-5 h-5" />
                  <span>{isSpinning ? '选择中...' : '开始选择'}</span>
                </button>

                <button
                  onClick={resetHistory}
                  className="flex items-center space-x-2 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>重置</span>
                </button>
              </div>
            </div>
          </div>

          {/* 项目管理 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                选择项目
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  title="设置"
                >
                  <Settings className="w-5 h-5" />
                </button>
                <button
                  onClick={exportItems}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  title="导出"
                >
                  <Download className="w-5 h-5" />
                </button>
                <label className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer" title="导入">
                  <Upload className="w-5 h-5" />
                  <input
                    type="file"
                    accept=".json"
                    onChange={importItems}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* 添加新项目 */}
            <div className="flex space-x-2 mb-4">
              <input
                type="text"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addItem()}
                placeholder="输入新选项..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <button
                onClick={addItem}
                disabled={!newItemText.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* 设置面板 */}
            {showSettings && (
              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="allowDuplicates"
                    checked={allowDuplicates}
                    onChange={(e) => setAllowDuplicates(e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  <label htmlFor="allowDuplicates" className="text-sm text-gray-700 dark:text-gray-300">
                    允许重复选择
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    动画速度 ({animationSpeed})
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={animationSpeed}
                    onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {/* 项目列表 */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {items.map((item, index) => (
                <div key={item.id} className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div 
                    className="w-4 h-4 rounded-full cursor-pointer"
                    style={{ backgroundColor: item.color }}
                    onClick={() => {
                      const newColor = defaultColors[(defaultColors.indexOf(item.color) + 1) % defaultColors.length];
                      updateItem(item.id, 'color', newColor);
                    }}
                    title="点击更换颜色"
                  ></div>
                  
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => updateItem(item.id, 'text', e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">权重:</span>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={item.weight}
                      onChange={(e) => updateItem(item.id, 'weight', Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 px-1 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      ({getItemProbability(item.weight)}%)
                    </span>
                  </div>
                  
                  <button
                    onClick={() => removeItem(item.id)}
                    disabled={items.length <= 1}
                    className="p-1 text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 历史记录 */}
        {pickHistory.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              选择历史
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-2">
              {pickHistory.map((item, index) => (
                <div 
                  key={`${item.id}-${index}`}
                  className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm"
                >
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="truncate text-gray-700 dark:text-gray-300">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            使用说明
          </h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>• <strong>添加选项:</strong> 在输入框中输入选项名称，点击加号添加</p>
            <p>• <strong>设置权重:</strong> 权重越高的选项被选中的概率越大</p>
            <p>• <strong>更换颜色:</strong> 点击选项前的颜色圆点可以更换颜色</p>
            <p>• <strong>权重说明:</strong> 权重为1-10，显示的百分比为该选项被选中的概率</p>
            <p>• <strong>导入导出:</strong> 支持保存和加载选项配置，方便重复使用</p>
            <p>• <strong>历史记录:</strong> 自动记录最近10次的选择结果</p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}