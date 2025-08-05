'use client';

import { useState, useEffect, useCallback } from 'react';
import { Copy, RotateCcw, Palette, Eye, Download, Upload, Shuffle } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';
import { useToolTranslations } from '@/components/tool-translations';
import { useLanguage } from '@/components/language-provider';

interface ColorFormat {
  name: string;
  value: string;
  description: string;
}

interface ColorPalette {
  name: string;
  colors: string[];
}

export default function ColorPickerPage() {
  const { getToolTranslation, getUITranslation, getToolPageTranslation } = useToolTranslations();
  const { t } = useLanguage();
  const toolTranslation = getToolTranslation('dev-color');
  const ui = getUITranslation();
  const pageTranslation = getToolPageTranslation('dev-color');
  
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  const [colorFormats, setColorFormats] = useState<ColorFormat[]>([]);
  const [colorHistory, setColorHistory] = useState<string[]>([]);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [colorPalettes, setColorPalettes] = useState<ColorPalette[]>([]);
  const [customPalette, setCustomPalette] = useState<string[]>([]);

  // 预设调色板
  const presetPalettes: ColorPalette[] = [
    {
      name: '经典蓝色',
      colors: ['#E3F2FD', '#BBDEFB', '#90CAF9', '#64B5F6', '#42A5F5', '#2196F3', '#1E88E5', '#1976D2', '#1565C0', '#0D47A1']
    },
    {
      name: '温暖橙色',
      colors: ['#FFF3E0', '#FFE0B2', '#FFCC80', '#FFB74D', '#FFA726', '#FF9800', '#FB8C00', '#F57C00', '#EF6C00', '#E65100']
    },
    {
      name: '自然绿色',
      colors: ['#E8F5E8', '#C8E6C8', '#A5D6A7', '#81C784', '#66BB6A', '#4CAF50', '#43A047', '#388E3C', '#2E7D32', '#1B5E20']
    },
    {
      name: '优雅紫色',
      colors: ['#F3E5F5', '#E1BEE7', '#CE93D8', '#BA68C8', '#AB47BC', '#9C27B0', '#8E24AA', '#7B1FA2', '#6A1B9A', '#4A148C']
    },
    {
      name: '现代灰色',
      colors: ['#FAFAFA', '#F5F5F5', '#EEEEEE', '#E0E0E0', '#BDBDBD', '#9E9E9E', '#757575', '#616161', '#424242', '#212121']
    }
  ];

  // 颜色转换函数
  const hexToRgb = useCallback((hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }, []);

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
  }, [hexToRgb]);

  const generateColorVariations = useCallback((baseColor: string) => {
    const hsl = hexToHsl(baseColor);
    if (!hsl) return [];

    const variations = [];
    // 生成亮度变化
    for (let i = 10; i <= 90; i += 10) {
      const newColor = hslToHex(hsl.h, hsl.s, i);
      variations.push(newColor);
    }
    return variations;
  }, [hexToHsl]);

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

  const rgbToHex = (r: number, g: number, b: number) => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
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
          name: 'CSS Variable',
          value: `--color: ${selectedColor.toUpperCase()};`,
          description: 'CSS自定义属性'
        }
      ];
      
      setColorFormats(formats);
    }
  }, [selectedColor, hexToRgb, hexToHsl]);

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    // 添加到历史记录
    setColorHistory(prev => {
      const newHistory = [color, ...prev.filter(c => c !== color)];
      return newHistory.slice(0, 10); // 只保留最近10个颜色
    });
  };

  const copyToClipboard = async (text: string, format: string) => {
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedFormat(format);
        setTimeout(() => setCopiedFormat(null), 2000);
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
    handleColorChange(color);
  };

  const addToCustomPalette = () => {
    if (!customPalette.includes(selectedColor)) {
      setCustomPalette(prev => [...prev, selectedColor]);
    }
  };

  const removeFromCustomPalette = (color: string) => {
    setCustomPalette(prev => prev.filter(c => c !== color));
  };

  const exportPalette = () => {
    const paletteData = {
      name: '自定义调色板',
      colors: customPalette,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(paletteData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'color-palette.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setSelectedColor('#3B82F6');
    setColorHistory([]);
    setCustomPalette([]);
  };

  return (
    <ToolLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            颜色工具箱
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            专业的颜色选择器、格式转换和调色板工具，支持多种颜色格式和调色板管理
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* 颜色选择器 */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                颜色选择
              </h2>

              <div className="space-y-6">
                {/* 主颜色预览 */}
                <div className="text-center">
                  <div
                    className="w-32 h-32 rounded-2xl border-4 border-gray-300 dark:border-gray-600 mx-auto mb-4 shadow-lg"
                    style={{ backgroundColor: selectedColor }}
                  />
                  <div className="text-lg font-mono font-semibold text-gray-900 dark:text-white">
                    {selectedColor.toUpperCase()}
                  </div>
                </div>

                {/* 颜色输入 */}
                <div className="space-y-4">
                  <input
                    type="color"
                    value={selectedColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-full h-12 rounded-lg cursor-pointer border border-gray-300 dark:border-gray-600"
                  />
                  
                  <input
                    type="text"
                    value={selectedColor}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                        setSelectedColor(value);
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-center"
                    placeholder="#3B82F6"
                  />
                </div>

                {/* 操作按钮 */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={generateRandomColor}
                    className="flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <Shuffle className="w-4 h-4 mr-2" />
                    随机
                  </button>
                  <button
                    onClick={addToCustomPalette}
                    className="flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <Palette className="w-4 h-4 mr-2" />
                    收藏
                  </button>
                </div>
              </div>
            </div>

            {/* 颜色历史 */}
            {colorHistory.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  最近使用
                </h3>
                <div className="grid grid-cols-5 gap-2">
                  {colorHistory.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedColor(color)}
                      className="w-10 h-10 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 颜色格式 */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
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
                        onClick={() => copyToClipboard(format.value, format.name)}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                        title="复制"
                      >
                        {copiedFormat === format.name ? (
                          <Eye className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
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
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
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
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-red-500">{rgb.r}</div>
                          <div className="text-xs text-gray-500">Red</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-500">{rgb.g}</div>
                          <div className="text-xs text-gray-500">Green</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-blue-500">{rgb.b}</div>
                          <div className="text-xs text-gray-500">Blue</div>
                        </div>
                      </div>
                      <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-lg font-semibold text-purple-500">{hsl.h}°</div>
                            <div className="text-xs text-gray-500">Hue</div>
                          </div>
                          <div>
                            <div className="text-lg font-semibold text-pink-500">{hsl.s}%</div>
                            <div className="text-xs text-gray-500">Saturation</div>
                          </div>
                          <div>
                            <div className="text-lg font-semibold text-yellow-500">{hsl.l}%</div>
                            <div className="text-xs text-gray-500">Lightness</div>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* 调色板 */}
          <div className="space-y-6">
            {/* 自定义调色板 */}
            {customPalette.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    自定义调色板
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={exportPalette}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                      title="导出调色板"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCustomPalette([])}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                      title="清空调色板"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {customPalette.map((color, index) => (
                    <div key={index} className="relative group">
                      <button
                        onClick={() => setSelectedColor(color)}
                        className="w-full h-10 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                      <button
                        onClick={() => removeFromCustomPalette(color)}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 预设调色板 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                预设调色板
              </h3>
              <div className="space-y-4">
                {presetPalettes.map((palette, index) => (
                  <div key={index}>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {palette.name}
                    </div>
                    <div className="grid grid-cols-10 gap-1">
                      {palette.colors.map((color, colorIndex) => (
                        <button
                          key={colorIndex}
                          onClick={() => handleColorChange(color)}
                          className="w-full h-8 rounded hover:scale-110 transition-transform border border-gray-200 dark:border-gray-600"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 功能说明 */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4 flex items-center">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-sm">🎨</span>
            </div>
            功能说明
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-blue-700 dark:text-blue-300 text-sm">
            <div>
              <h4 className="font-medium mb-2">颜色选择：</h4>
              <ul className="space-y-1">
                <li>• 使用颜色选择器或直接输入HEX值</li>
                <li>• 支持随机颜色生成</li>
                <li>• 自动保存使用历史</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">格式转换：</h4>
              <ul className="space-y-1">
                <li>• 支持HEX、RGB、HSL等格式</li>
                <li>• 一键复制所需格式</li>
                <li>• 实时显示颜色信息</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">调色板管理：</h4>
              <ul className="space-y-1">
                <li>• 收藏喜欢的颜色</li>
                <li>• 预设经典调色板</li>
                <li>• 支持导出调色板数据</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
} 