'use client';

import { useState, useEffect, useCallback } from 'react';
import { Copy, RotateCcw, Palette } from 'lucide-react';

interface ColorFormat {
  name: string;
  value: string;
  description: string;
}

export default function ColorPickerPage() {
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  const [colorFormats, setColorFormats] = useState<ColorFormat[]>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // 颜色转换函数
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const hexToHsl = useCallback((hex: string) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return null;
    
    const { r, g, b } = rgb;
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    
    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case rNorm:
          h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
          break;
        case gNorm:
          h = (bNorm - rNorm) / d + 2;
          break;
        case bNorm:
          h = (rNorm - gNorm) / d + 4;
          break;
      }
      h /= 6;
    }
    
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }, []);

  const rgbToHex = (r: number, g: number, b: number) => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  const hslToHex = (h: number, s: number, l: number) => {
    s /= 100;
    l /= 100;
    
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    
    if (0 <= h && h < 60) {
      r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
      r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
      r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
      r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
      r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
      r = c; g = 0; b = x;
    }
    
    const rHex = Math.round((r + m) * 255);
    const gHex = Math.round((g + m) * 255);
    const bHex = Math.round((b + m) * 255);
    
    return rgbToHex(rHex, gHex, bHex);
  };

  // 更新颜色格式
  useEffect(() => {
    const rgb = hexToRgb(selectedColor);
    const hsl = hexToHsl(selectedColor);
    
    if (rgb && hsl) {
      const formats: ColorFormat[] = [
        {
          name: 'HEX',
          value: selectedColor.toUpperCase(),
          description: '十六进制颜色值'
        },
        {
          name: 'RGB',
          value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
          description: 'RGB颜色值'
        },
        {
          name: 'RGBA',
          value: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`,
          description: 'RGBA颜色值（含透明度）'
        },
        {
          name: 'HSL',
          value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
          description: 'HSL颜色值'
        },
        {
          name: 'HSLA',
          value: `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, 1)`,
          description: 'HSLA颜色值（含透明度）'
        },
        {
          name: 'CSS变量',
          value: `var(--primary-color)`,
          description: 'CSS变量格式'
        }
      ];
      setColorFormats(formats);
    }
  }, [selectedColor, hexToHsl]);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedColor(e.target.value);
  };

  const copyToClipboard = async (text: string) => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    }
  };

  const generateRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    setSelectedColor(color);
  };

  const clearAll = () => {
    setSelectedColor('#3B82F6');
  };

  const predefinedColors = [
    '#FF0000', '#FF4500', '#FFA500', '#FFFF00', '#00FF00', '#00FFFF',
    '#0000FF', '#8A2BE2', '#FF00FF', '#FF69B4', '#FFC0CB', '#FFE4E1',
    '#F0F8FF', '#F5F5DC', '#F0FFF0', '#FFF0F5', '#FDF5E6', '#F5F5F5',
    '#000000', '#696969', '#808080', '#A9A9A9', '#C0C0C0', '#D3D3D3',
    '#FFFFFF', '#FFD700', '#FFA500', '#FF6347', '#FF4500', '#FF0000'
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          颜色选择器
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          选择颜色并获取多种格式的颜色值，支持RGB、HSL、HEX等格式
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 颜色选择区域 */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              颜色选择
            </h2>
            
            <div className="space-y-4">
              {/* 颜色预览 */}
              <div className="flex items-center space-x-4">
                <div
                  className="w-16 h-16 rounded-lg border-2 border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: selectedColor }}
                />
                <div className="flex-1">
                  <input
                    type="color"
                    value={selectedColor}
                    onChange={handleColorChange}
                    className="w-full h-10 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={generateRandomColor}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Palette className="w-4 h-4" />
                  随机颜色
                </button>
                <button
                  onClick={clearAll}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  重置
                </button>
              </div>
            </div>
          </div>

          {/* 预设颜色 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              预设颜色
            </h3>
            <div className="grid grid-cols-6 gap-2">
              {predefinedColors.map((color, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedColor(color)}
                  className="w-8 h-8 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 颜色格式区域 */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              颜色格式
            </h2>
            
            <div className="space-y-4">
              {colorFormats.map((format, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {format.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {format.description}
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(format.value)}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                      复制
                    </button>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <code className="text-sm font-mono text-gray-900 dark:text-white">
                      {format.value}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 颜色信息 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              颜色信息
            </h3>
            {(() => {
              const rgb = hexToRgb(selectedColor);
              const hsl = hexToHsl(selectedColor);
              return (
                <div className="space-y-3">
                  {rgb && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">RGB值:</span>
                      <span className="text-sm font-mono text-gray-900 dark:text-white">
                        {rgb.r}, {rgb.g}, {rgb.b}
                      </span>
                    </div>
                  )}
                  {hsl && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">HSL值:</span>
                      <span className="text-sm font-mono text-gray-900 dark:text-white">
                        {hsl.h}°, {hsl.s}%, {hsl.l}%
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">亮度:</span>
                    <span className="text-sm font-mono text-gray-900 dark:text-white">
                      {hsl ? Math.round(hsl.l) : 0}%
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
} 