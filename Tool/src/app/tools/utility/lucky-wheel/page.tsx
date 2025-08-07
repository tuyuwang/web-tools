'use client';

import { useState, useRef, useEffect } from 'react';
import { RotateCw, Plus, Trash2, Settings, Play } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';

interface WheelOption {
  id: string;
  text: string;
  color: string;
}

export default function LuckyWheelPage() {
  const [options, setOptions] = useState<WheelOption[]>([
    { id: '1', text: '选项1', color: '#FF6B6B' },
    { id: '2', text: '选项2', color: '#4ECDC4' },
    { id: '3', text: '选项3', color: '#45B7D1' },
    { id: '4', text: '选项4', color: '#96CEB4' },
    { id: '5', text: '选项5', color: '#FFEAA7' },
    { id: '6', text: '选项6', color: '#DDA0DD' }
  ]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [newOption, setNewOption] = useState('');
  const [history, setHistory] = useState<string[]>([]);

  const wheelRef = useRef<HTMLDivElement>(null);

  // 预设颜色
  const presetColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#74B9FF', '#A29BFE',
    '#FD79A8', '#FDCB6E', '#6C5CE7', '#00B894'
  ];

  // 添加选项
  const addOption = () => {
    if (newOption.trim() && options.length < 12) {
      const newId = Date.now().toString();
      const randomColor = presetColors[Math.floor(Math.random() * presetColors.length)];
      setOptions([...options, {
        id: newId,
        text: newOption.trim(),
        color: randomColor
      }]);
      setNewOption('');
    }
  };

  // 删除选项
  const deleteOption = (id: string) => {
    if (options.length > 2) {
      setOptions(options.filter(option => option.id !== id));
    }
  };

  // 更新选项
  const updateOption = (id: string, field: 'text' | 'color', value: string) => {
    setOptions(options.map(option => 
      option.id === id ? { ...option, [field]: value } : option
    ));
  };

  // 开始转盘
  const spinWheel = () => {
    if (isSpinning || options.length < 2) return;

    setIsSpinning(true);
    setResult(null);

    // 计算每个选项的角度
    const sectionAngle = 360 / options.length;
    
    // 随机选择一个选项
    const randomIndex = Math.floor(Math.random() * options.length);
    const selectedOption = options[randomIndex];
    
    // 计算目标角度（让指针指向选中的选项）
    const targetAngle = 360 - (randomIndex * sectionAngle + sectionAngle / 2);
    
    // 增加多圈旋转使效果更好
    const finalRotation = rotation + 1440 + targetAngle; // 4圈 + 目标角度
    
    setRotation(finalRotation);

    // 动画结束后显示结果
    setTimeout(() => {
      setIsSpinning(false);
      setResult(selectedOption.text);
      setHistory(prev => [selectedOption.text, ...prev.slice(0, 9)]); // 保留最近10次记录
    }, 3000);
  };

  // 重置转盘
  const resetWheel = () => {
    setRotation(0);
    setResult(null);
    setHistory([]);
  };

  // 生成转盘SVG
  const generateWheelSVG = () => {
    const size = 300;
    const center = size / 2;
    const radius = size / 2 - 10;
    const sectionAngle = 360 / options.length;

    return (
      <svg width={size} height={size} className="drop-shadow-lg">
        {/* 转盘背景 */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="#ffffff"
          stroke="#e5e7eb"
          strokeWidth="2"
        />
        
        {/* 转盘扇形 */}
        {options.map((option, index) => {
          const startAngle = index * sectionAngle;
          const endAngle = (index + 1) * sectionAngle;
          
          const startRad = (startAngle * Math.PI) / 180;
          const endRad = (endAngle * Math.PI) / 180;
          
          const x1 = center + (radius - 5) * Math.cos(startRad);
          const y1 = center + (radius - 5) * Math.sin(startRad);
          const x2 = center + (radius - 5) * Math.cos(endRad);
          const y2 = center + (radius - 5) * Math.sin(endRad);
          
          const largeArcFlag = sectionAngle > 180 ? 1 : 0;
          
          const pathData = [
            `M ${center} ${center}`,
            `L ${x1} ${y1}`,
            `A ${radius - 5} ${radius - 5} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            'Z'
          ].join(' ');

          // 文本位置
          const textAngle = startAngle + sectionAngle / 2;
          const textRad = (textAngle * Math.PI) / 180;
          const textX = center + (radius * 0.7) * Math.cos(textRad);
          const textY = center + (radius * 0.7) * Math.sin(textRad);

          return (
            <g key={option.id}>
              <path
                d={pathData}
                fill={option.color}
                stroke="#ffffff"
                strokeWidth="2"
              />
              <text
                x={textX}
                y={textY}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#ffffff"
                fontSize="12"
                fontWeight="bold"
                className="select-none"
                transform={`rotate(${textAngle}, ${textX}, ${textY})`}
              >
                {option.text.length > 8 ? option.text.substring(0, 8) + '...' : option.text}
              </text>
            </g>
          );
        })}
        
        {/* 中心圆 */}
        <circle
          cx={center}
          cy={center}
          r="20"
          fill="#374151"
          stroke="#ffffff"
          strokeWidth="3"
        />
      </svg>
    );
  };

  return (
    <ToolLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-2">
            <RotateCw className="h-8 w-8" />
            幸运转盘
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            自定义选项，旋转转盘，随机选择结果
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 转盘区域 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-center space-y-6">
              {/* 转盘 */}
              <div className="relative inline-block">
                {/* 指针 */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
                  <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-b-[30px] border-l-transparent border-r-transparent border-b-red-500"></div>
                </div>
                
                {/* 转盘 */}
                <div
                  ref={wheelRef}
                  className={`transition-transform duration-3000 ease-out ${isSpinning ? 'animate-spin' : ''}`}
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transitionDuration: isSpinning ? '3s' : '0.3s'
                  }}
                >
                  {generateWheelSVG()}
                </div>
              </div>

              {/* 控制按钮 */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={spinWheel}
                  disabled={isSpinning || options.length < 2}
                  className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                    isSpinning || options.length < 2
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <Play className="h-5 w-5" />
                  {isSpinning ? '转动中...' : '开始转动'}
                </button>
                
                <button
                  onClick={resetWheel}
                  className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium"
                >
                  重置
                </button>
              </div>

              {/* 结果显示 */}
              {result && (
                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-2">
                    🎉 恭喜！
                  </h3>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {result}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 设置区域 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                转盘设置
              </h2>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>

            {/* 添加选项 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                添加新选项
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addOption()}
                  placeholder="输入选项名称"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  maxLength={20}
                />
                <button
                  onClick={addOption}
                  disabled={!newOption.trim() || options.length >= 12}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    !newOption.trim() || options.length >= 12
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  <Plus className="h-4 w-4" />
                  添加
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                最多12个选项，当前 {options.length}/12
              </p>
            </div>

            {/* 选项列表 */}
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {options.map((option, index) => (
                <div key={option.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-6">
                    {index + 1}
                  </span>
                  
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => updateOption(option.id, 'text', e.target.value)}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    maxLength={20}
                  />
                  
                  <input
                    type="color"
                    value={option.color}
                    onChange={(e) => updateOption(option.id, 'color', e.target.value)}
                    className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                  />
                  
                  <button
                    onClick={() => deleteOption(option.id)}
                    disabled={options.length <= 2}
                    className={`p-1 rounded ${
                      options.length <= 2
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-red-500 hover:text-red-700'
                    }`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 历史记录 */}
        {history.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              历史记录（最近10次）
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-2">
              {history.map((item, index) => (
                <div
                  key={index}
                  className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-center"
                >
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    第{history.length - index}次
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {item}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">
            使用说明
          </h3>
          <ul className="space-y-2 text-blue-700 dark:text-blue-300">
            <li>• 在右侧设置区域添加或编辑转盘选项</li>
            <li>• 最少需要2个选项，最多支持12个选项</li>
            <li>• 可以自定义每个选项的名称和颜色</li>
            <li>• 点击"开始转动"按钮启动转盘</li>
            <li>• 转盘会随机停在某个选项上</li>
            <li>• 查看历史记录了解之前的抽奖结果</li>
            <li>• 适用于聚会游戏、活动抽奖、决策辅助等场景</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}