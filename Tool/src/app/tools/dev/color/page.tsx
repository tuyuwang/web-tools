'use client';

import { useState, useEffect, useCallback } from 'react';
import { Copy, RotateCcw, Palette } from 'lucide-react';
import { useToolTranslations } from '@/components/tool-translations';
import { useLanguage } from '@/components/language-provider';

interface ColorFormat {
  name: string;
  value: string;
  description: string;
}

export default function ColorPickerPage() {
  const { getToolTranslation, getUITranslation, getToolPageTranslation } = useToolTranslations();
  const { t } = useLanguage();
  const toolTranslation = getToolTranslation('dev-color');
  const ui = getUITranslation();
  const pageTranslation = getToolPageTranslation('dev-color');
  
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
      try {
        await navigator.clipboard.writeText(text);
      } catch (err) {
        console.error('复制失败:', err);
      }
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

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          颜色工具
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          颜色选择器、格式转换和调色板工具
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 颜色选择器 */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              颜色选择
            </h2>

            <div className="space-y-4">
              {/* 颜色预览 */}
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-lg border-2 border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: selectedColor }}
                />
                <div className="flex-1">
                  <input
                    type="color"
                    value={selectedColor}
                    onChange={handleColorChange}
                    className="w-full h-12 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-2">
                <button
                  onClick={generateRandomColor}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Palette className="w-4 h-4" />
                  随机颜色
                </button>
                <button
                  onClick={clearAll}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 颜色格式 */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              颜色格式
            </h2>

            <div className="space-y-3">
              {colorFormats.map((format) => (
                <div
                  key={format.name}
                  className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {format.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {format.description}
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(format.value)}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                      title={ui.buttons.copy}
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="font-mono text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-2 rounded">
                    {format.value}
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
            <div className="space-y-3">
              {(() => {
                const rgb = hexToRgb(selectedColor);
                const hsl = hexToHsl(selectedColor);
                if (!rgb || !hsl) return null;
                
                return (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">红色 (R)</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{rgb.r}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">绿色 (G)</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{rgb.g}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">蓝色 (B)</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{rgb.b}</span>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-3 mt-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">色相 (H)</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{hsl.h}°</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">饱和度 (S)</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{hsl.s}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">亮度 (L)</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{hsl.l}%</span>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* 功能说明 */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">
          功能说明
        </h3>
        <ul className="space-y-2 text-blue-700 dark:text-blue-300 text-sm">
          <li>• <strong>颜色选择</strong>: 使用颜色选择器或输入颜色值</li>
          <li>• <strong>格式转换</strong>: 自动转换HEX、RGB、HSL等格式</li>
          <li>• <strong>随机生成</strong>: 一键生成随机颜色</li>
          <li>• <strong>复制功能</strong>: 点击复制按钮复制颜色值</li>
        </ul>
      </div>
    </div>
  );
} 