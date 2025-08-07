'use client';

import { ToolLayout } from '@/components/tool-layout';
import { useState, useCallback } from 'react';
import { Copy, Plus, Minus, RotateCcw, Download } from 'lucide-react';

interface ColorStop {
  id: string;
  color: string;
  position: number;
}

interface GradientSettings {
  type: 'linear' | 'radial';
  angle: number;
  colorStops: ColorStop[];
}

export default function GradientGeneratorPage() {
  const [settings, setSettings] = useState<GradientSettings>({
    type: 'linear',
    angle: 45,
    colorStops: [
      { id: '1', color: '#ff6b6b', position: 0 },
      { id: '2', color: '#4ecdc4', position: 100 },
    ],
  });
  
  const [copied, setCopied] = useState<string | null>(null);

  const generateGradientCSS = useCallback(() => {
    const { type, angle, colorStops } = settings;
    const sortedStops = [...colorStops].sort((a, b) => a.position - b.position);
    const stopStrings = sortedStops.map(stop => `${stop.color} ${stop.position}%`);
    
    if (type === 'linear') {
      return `linear-gradient(${angle}deg, ${stopStrings.join(', ')})`;
    } else {
      return `radial-gradient(circle, ${stopStrings.join(', ')})`;
    }
  }, [settings]);

  const addColorStop = () => {
    const newPosition = settings.colorStops.length === 0 ? 50 : 
      (settings.colorStops[settings.colorStops.length - 1].position + settings.colorStops[0].position) / 2;
    
    const newStop: ColorStop = {
      id: Date.now().toString(),
      color: '#' + Math.floor(Math.random()*16777215).toString(16),
      position: newPosition,
    };
    
    setSettings(prev => ({
      ...prev,
      colorStops: [...prev.colorStops, newStop].sort((a, b) => a.position - b.position),
    }));
  };

  const removeColorStop = (id: string) => {
    if (settings.colorStops.length > 2) {
      setSettings(prev => ({
        ...prev,
        colorStops: prev.colorStops.filter(stop => stop.id !== id),
      }));
    }
  };

  const updateColorStop = (id: string, updates: Partial<ColorStop>) => {
    setSettings(prev => ({
      ...prev,
      colorStops: prev.colorStops.map(stop => 
        stop.id === id ? { ...stop, ...updates } : stop
      ),
    }));
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const generateRandomGradient = () => {
    const randomColor = () => '#' + Math.floor(Math.random()*16777215).toString(16);
    const newStops: ColorStop[] = [
      { id: '1', color: randomColor(), position: 0 },
      { id: '2', color: randomColor(), position: 100 },
    ];
    
    // 有30%概率添加第三个颜色
    if (Math.random() < 0.3) {
      newStops.splice(1, 0, { id: '3', color: randomColor(), position: 50 });
    }
    
    setSettings(prev => ({
      ...prev,
      angle: Math.floor(Math.random() * 360),
      colorStops: newStops,
    }));
  };

  const downloadGradient = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      const gradient = settings.type === 'linear' 
        ? ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
        : ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, canvas.width/2);
      
      settings.colorStops.forEach(stop => {
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

  const gradientCSS = generateGradientCSS();
  const gradientStyle = { background: gradientCSS };

  const presetGradients = [
    { name: '日落', colors: ['#ff6b6b', '#ffa726'] },
    { name: '海洋', colors: ['#42a5f5', '#66bb6a'] },
    { name: '紫色梦幻', colors: ['#9c27b0', '#673ab7'] },
    { name: '春天', colors: ['#8bc34a', '#cddc39'] },
    { name: '火焰', colors: ['#ff5722', '#ff9800'] },
    { name: '薄荷', colors: ['#26c6da', '#66bb6a'] },
    { name: '浆果', colors: ['#e91e63', '#9c27b0'] },
    { name: '夜空', colors: ['#1a237e', '#3f51b5'] },
  ];

  const applyPreset = (colors: string[]) => {
    const newStops: ColorStop[] = colors.map((color, index) => ({
      id: (index + 1).toString(),
      color,
      position: index * (100 / (colors.length - 1)),
    }));
    
    setSettings(prev => ({
      ...prev,
      colorStops: newStops,
    }));
  };

  return (
    <ToolLayout>
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          渐变色生成器
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          创建美丽的CSS渐变色并获取代码
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* 预览区域 */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              渐变预览
            </h2>
            
            <div 
              className="w-full h-64 rounded-lg border border-gray-300 dark:border-gray-600"
              style={gradientStyle}
            />
            
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={generateRandomGradient}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                随机生成
              </button>
              <button
                onClick={downloadGradient}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                下载图片
              </button>
            </div>
          </div>

          {/* CSS代码 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              CSS代码
            </h2>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    background
                  </label>
                  <button
                    onClick={() => copyToClipboard(gradientCSS, 'background')}
                    className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <Copy className="w-3 h-3" />
                    复制
                  </button>
                </div>
                <div className="relative">
                  <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
                    <code>{gradientCSS}</code>
                  </pre>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    完整CSS规则
                  </label>
                  <button
                    onClick={() => copyToClipboard(`background: ${gradientCSS};`, 'css')}
                    className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <Copy className="w-3 h-3" />
                    复制
                  </button>
                </div>
                <div className="relative">
                  <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
                    <code>{`background: ${gradientCSS};`}</code>
                  </pre>
                </div>
              </div>

              {copied && (
                <div className="p-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg text-sm">
                  {copied === 'background' ? '渐变值' : 'CSS规则'}已复制到剪贴板
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 控制面板 */}
        <div className="space-y-6">
          {/* 渐变类型 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              渐变类型
            </h3>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSettings(prev => ({ ...prev, type: 'linear' }))}
                className={`p-3 border rounded-lg text-center transition-colors ${
                  settings.type === 'linear'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600'
                }`}
              >
                线性渐变
              </button>
              <button
                onClick={() => setSettings(prev => ({ ...prev, type: 'radial' }))}
                className={`p-3 border rounded-lg text-center transition-colors ${
                  settings.type === 'radial'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600'
                }`}
              >
                径向渐变
              </button>
            </div>
          </div>

          {/* 角度控制 (仅线性渐变) */}
          {settings.type === 'linear' && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                角度: {settings.angle}°
              </h3>
              
              <input
                type="range"
                min="0"
                max="360"
                value={settings.angle}
                onChange={(e) => setSettings(prev => ({ ...prev, angle: Number(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>0°</span>
                <span>90°</span>
                <span>180°</span>
                <span>270°</span>
                <span>360°</span>
              </div>
            </div>
          )}

          {/* 颜色停止点 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                颜色停止点
              </h3>
              <button
                onClick={addColorStop}
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
              >
                <Plus className="w-3 h-3" />
                添加
              </button>
            </div>
            
            <div className="space-y-3">
              {settings.colorStops
                .sort((a, b) => a.position - b.position)
                .map((stop, index) => (
                <div key={stop.id} className="flex items-center gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="color"
                      value={stop.color}
                      onChange={(e) => updateColorStop(stop.id, { color: e.target.value })}
                      className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={stop.color}
                      onChange={(e) => updateColorStop(stop.id, { color: e.target.value })}
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={stop.position}
                      onChange={(e) => updateColorStop(stop.id, { position: Number(e.target.value) })}
                      className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400">%</span>
                    {settings.colorStops.length > 2 && (
                      <button
                        onClick={() => removeColorStop(stop.id)}
                        className="p-1 text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 预设渐变 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              预设渐变
            </h3>
            
            <div className="grid grid-cols-2 gap-2">
              {presetGradients.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset.colors)}
                  className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                  style={{
                    background: `linear-gradient(45deg, ${preset.colors.join(', ')})`
                  }}
                >
                  <div className="text-white text-sm font-medium text-shadow">
                    {preset.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}