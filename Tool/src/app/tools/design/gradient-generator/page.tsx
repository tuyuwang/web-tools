'use client';

import { useState, useEffect } from 'react';
import { ToolLayout } from '@/components/tool-layout';
import { Palette, Copy, Download, RefreshCw, Plus, Minus } from 'lucide-react';

interface GradientStop {
  color: string;
  position: number;
}

interface GradientConfig {
  type: 'linear' | 'radial';
  direction: number;
  stops: GradientStop[];
}

export default function GradientGeneratorPage() {
  const [config, setConfig] = useState<GradientConfig>({
    type: 'linear',
    direction: 45,
    stops: [
      { color: '#ff6b6b', position: 0 },
      { color: '#4ecdc4', position: 100 }
    ]
  });

  const [copiedCSS, setCopiedCSS] = useState(false);
  const [presetGradients] = useState([
    {
      name: '日落橙',
      stops: [
        { color: '#ff9a9e', position: 0 },
        { color: '#fecfef', position: 50 },
        { color: '#fecfef', position: 100 }
      ]
    },
    {
      name: '海洋蓝',
      stops: [
        { color: '#667eea', position: 0 },
        { color: '#764ba2', position: 100 }
      ]
    },
    {
      name: '薄荷绿',
      stops: [
        { color: '#a8edea', position: 0 },
        { color: '#fed6e3', position: 100 }
      ]
    },
    {
      name: '彩虹色',
      stops: [
        { color: '#ff0000', position: 0 },
        { color: '#ff8000', position: 16.66 },
        { color: '#ffff00', position: 33.33 },
        { color: '#80ff00', position: 50 },
        { color: '#00ff80', position: 66.66 },
        { color: '#0080ff', position: 83.33 },
        { color: '#8000ff', position: 100 }
      ]
    },
    {
      name: '紫色梦境',
      stops: [
        { color: '#667eea', position: 0 },
        { color: '#764ba2', position: 100 }
      ]
    },
    {
      name: '金色辉煌',
      stops: [
        { color: '#f7971e', position: 0 },
        { color: '#ffd200', position: 100 }
      ]
    }
  ]);

  const generateCSS = () => {
    const sortedStops = [...config.stops].sort((a, b) => a.position - b.position);
    const colorStops = sortedStops.map(stop => `${stop.color} ${stop.position}%`).join(', ');
    
    if (config.type === 'linear') {
      return `background: linear-gradient(${config.direction}deg, ${colorStops});`;
    } else {
      return `background: radial-gradient(circle, ${colorStops});`;
    }
  };

  const getGradientStyle = () => {
    const sortedStops = [...config.stops].sort((a, b) => a.position - b.position);
    const colorStops = sortedStops.map(stop => `${stop.color} ${stop.position}%`).join(', ');
    
    if (config.type === 'linear') {
      return {
        background: `linear-gradient(${config.direction}deg, ${colorStops})`
      };
    } else {
      return {
        background: `radial-gradient(circle, ${colorStops})`
      };
    }
  };

  const copyCSS = async () => {
    try {
      await navigator.clipboard.writeText(generateCSS());
      setCopiedCSS(true);
      setTimeout(() => setCopiedCSS(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const downloadGradient = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      const gradient = config.type === 'linear' 
        ? ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
        : ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, Math.min(canvas.width, canvas.height)/2);
      
      config.stops.forEach(stop => {
        gradient.addColorStop(stop.position / 100, stop.color);
      });
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const link = document.createElement('a');
      link.download = 'gradient.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const addColorStop = () => {
    const newPosition = config.stops.length > 0 
      ? Math.max(...config.stops.map(s => s.position)) + 10
      : 50;
    
    setConfig(prev => ({
      ...prev,
      stops: [...prev.stops, { color: '#ff0000', position: Math.min(newPosition, 100) }]
    }));
  };

  const removeColorStop = (index: number) => {
    if (config.stops.length > 2) {
      setConfig(prev => ({
        ...prev,
        stops: prev.stops.filter((_, i) => i !== index)
      }));
    }
  };

  const updateColorStop = (index: number, field: 'color' | 'position', value: string | number) => {
    setConfig(prev => ({
      ...prev,
      stops: prev.stops.map((stop, i) => 
        i === index ? { ...stop, [field]: value } : stop
      )
    }));
  };

  const applyPreset = (preset: typeof presetGradients[0]) => {
    setConfig(prev => ({
      ...prev,
      stops: preset.stops
    }));
  };

  const randomizeGradient = () => {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7', '#a29bfe', '#fd79a8', '#fdcb6e'];
    const numStops = Math.floor(Math.random() * 3) + 2; // 2-4 stops
    const stops = Array.from({ length: numStops }, (_, i) => ({
      color: colors[Math.floor(Math.random() * colors.length)],
      position: (i / (numStops - 1)) * 100
    }));
    
    setConfig(prev => ({
      ...prev,
      stops,
      direction: Math.floor(Math.random() * 360)
    }));
  };

  return (
    <ToolLayout>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
              <Palette className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            渐变生成器
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            创建美丽的CSS渐变背景，支持多种渐变类型和颜色
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 预览区域 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              渐变预览
            </h2>
            
            {/* 大预览 */}
            <div 
              className="w-full h-64 rounded-lg border border-gray-300 dark:border-gray-600 mb-4"
              style={getGradientStyle()}
            />
            
            {/* 控制按钮 */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={copyCSS}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Copy className="h-4 w-4 mr-2" />
                {copiedCSS ? '已复制!' : '复制 CSS'}
              </button>
              
              <button
                onClick={downloadGradient}
                className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                下载图片
              </button>
              
              <button
                onClick={randomizeGradient}
                className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                随机生成
              </button>
            </div>

            {/* CSS 代码 */}
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
              <code className="text-sm text-gray-800 dark:text-gray-200 font-mono break-all">
                {generateCSS()}
              </code>
            </div>
          </div>

          {/* 控制面板 */}
          <div className="space-y-6">
            {/* 渐变类型 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                渐变设置
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    渐变类型
                  </label>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setConfig(prev => ({ ...prev, type: 'linear' }))}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        config.type === 'linear'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      线性渐变
                    </button>
                    <button
                      onClick={() => setConfig(prev => ({ ...prev, type: 'radial' }))}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        config.type === 'radial'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      径向渐变
                    </button>
                  </div>
                </div>

                {config.type === 'linear' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      方向角度: {config.direction}°
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={config.direction}
                      onChange={(e) => setConfig(prev => ({ ...prev, direction: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                )}

                {/* 颜色停止点 */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      颜色停止点
                    </label>
                    <button
                      onClick={addColorStop}
                      className="flex items-center px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      添加
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {config.stops.map((stop, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={stop.color}
                          onChange={(e) => updateColorStop(index, 'color', e.target.value)}
                          className="w-12 h-8 rounded border border-gray-300 dark:border-gray-600"
                        />
                        <input
                          type="number"
                          value={stop.position}
                          onChange={(e) => updateColorStop(index, 'position', parseInt(e.target.value))}
                          className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                          min="0"
                          max="100"
                        />
                        <span className="text-xs text-gray-500">%</span>
                        {config.stops.length > 2 && (
                          <button
                            onClick={() => removeColorStop(index)}
                            className="p-1 text-red-600 hover:text-red-700"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 预设渐变 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                预设渐变
              </h3>
              
              <div className="grid grid-cols-2 gap-2">
                {presetGradients.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => applyPreset(preset)}
                    className="h-16 rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden hover:scale-105 transition-transform"
                    style={{
                      background: `linear-gradient(45deg, ${preset.stops.map(s => `${s.color} ${s.position}%`).join(', ')})`
                    }}
                    title={preset.name}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            💡 使用技巧
          </h3>
          <ul className="text-blue-800 dark:text-blue-200 space-y-1 text-sm">
            <li>• <strong>线性渐变：</strong>颜色沿直线方向渐变，可调整角度</li>
            <li>• <strong>径向渐变：</strong>颜色从中心向外辐射渐变</li>
            <li>• <strong>颜色停止点：</strong>控制颜色在渐变中的位置，数值越小越靠前</li>
            <li>• <strong>预设渐变：</strong>点击预设可快速应用流行的渐变配色</li>
            <li>• <strong>随机生成：</strong>点击随机按钮获得意想不到的配色灵感</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}