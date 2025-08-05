'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Copy, RotateCcw, Palette, Eye, Shuffle, Download, Save, Trash2, Star, RefreshCw, Zap } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';
import { useToolTranslations } from '@/components/tool-translations';
import { useLanguage } from '@/components/language-provider';

interface ColorFormat {
  name: string;
  value: string;
  description: string;
}

interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
  timestamp: number;
}

interface ColorHarmony {
  name: string;
  colors: string[];
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
  const [activeTab, setActiveTab] = useState('picker');
  const [savedPalettes, setSavedPalettes] = useState<ColorPalette[]>([]);
  const [currentPalette, setCurrentPalette] = useState<string[]>([]);
  const [colorHistory, setColorHistory] = useState<string[]>([]);
  const [harmonies, setHarmonies] = useState<ColorHarmony[]>([]);
  const [gradientColors, setGradientColors] = useState<string[]>(['#3B82F6', '#8B5CF6']);
  const [gradientDirection, setGradientDirection] = useState('to right');
  const [accessibilityInfo, setAccessibilityInfo] = useState<{
    contrast: number;
    wcagAA: boolean;
    wcagAAA: boolean;
  }>({ contrast: 0, wcagAA: false, wcagAAA: false });

  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  const hslToHex = useCallback((h: number, s: number, l: number) => {
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
    
    return `#${[rHex, gHex, bHex].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('')}`;
  }, []);

  // 生成色彩和谐方案
  const generateHarmonies = useCallback((color: string) => {
    const hsl = hexToHsl(color);
    if (!hsl) return [];

    const { h, s, l } = hsl;
    
    const harmonies: ColorHarmony[] = [
      {
        name: '单色',
        description: '基于同一色相的不同明度和饱和度',
        colors: [
          color,
          hslToHex(h, Math.max(0, s - 20), Math.min(100, l + 15)),
          hslToHex(h, Math.max(0, s - 40), Math.min(100, l + 30)),
          hslToHex(h, Math.min(100, s + 20), Math.max(0, l - 15)),
          hslToHex(h, Math.min(100, s + 40), Math.max(0, l - 30))
        ]
      },
      {
        name: '互补色',
        description: '色相环上相对的颜色',
        colors: [
          color,
          hslToHex((h + 180) % 360, s, l),
          hslToHex(h, Math.max(0, s - 20), Math.min(100, l + 10)),
          hslToHex((h + 180) % 360, Math.max(0, s - 20), Math.min(100, l + 10)),
          hslToHex(h, Math.min(100, s + 10), Math.max(0, l - 10))
        ]
      },
      {
        name: '三角色',
        description: '色相环上等距120度的三个颜色',
        colors: [
          color,
          hslToHex((h + 120) % 360, s, l),
          hslToHex((h + 240) % 360, s, l),
          hslToHex(h, Math.max(0, s - 15), Math.min(100, l + 10)),
          hslToHex((h + 120) % 360, Math.max(0, s - 15), Math.min(100, l + 10))
        ]
      },
      {
        name: '分裂互补',
        description: '主色相与其互补色两侧的颜色',
        colors: [
          color,
          hslToHex((h + 150) % 360, s, l),
          hslToHex((h + 210) % 360, s, l),
          hslToHex(h, Math.max(0, s - 10), Math.min(100, l + 5)),
          hslToHex((h + 180) % 360, Math.max(0, s - 30), Math.min(100, l + 15))
        ]
      },
      {
        name: '正方形',
        description: '色相环上等距90度的四个颜色',
        colors: [
          color,
          hslToHex((h + 90) % 360, s, l),
          hslToHex((h + 180) % 360, s, l),
          hslToHex((h + 270) % 360, s, l),
          hslToHex(h, Math.min(100, s + 15), Math.max(0, l - 10))
        ]
      },
      {
        name: '类似色',
        description: '色相环上相邻的颜色',
        colors: [
          color,
          hslToHex((h + 30) % 360, s, l),
          hslToHex((h - 30 + 360) % 360, s, l),
          hslToHex((h + 60) % 360, Math.max(0, s - 10), Math.min(100, l + 5)),
          hslToHex((h - 60 + 360) % 360, Math.max(0, s - 10), Math.min(100, l + 5))
        ]
      }
    ];

    return harmonies;
  }, [hexToHsl, hslToHex]);

  // 计算对比度
  const calculateContrast = useCallback((color1: string, color2: string = '#FFFFFF') => {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return 0;

    const getLuminance = (r: number, g: number, b: number) => {
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
    
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  }, [hexToRgb]);

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
          value: `--primary-color: ${selectedColor.toLowerCase()};`,
          description: 'CSS自定义属性'
        }
      ];
      
      setColorFormats(formats);
      
      // 更新和谐色彩
      setHarmonies(generateHarmonies(selectedColor));
      
      // 计算可访问性信息
      const contrast = calculateContrast(selectedColor);
      setAccessibilityInfo({
        contrast: Math.round(contrast * 100) / 100,
        wcagAA: contrast >= 4.5,
        wcagAAA: contrast >= 7
      });
    }
  }, [selectedColor, hexToRgb, hexToHsl, generateHarmonies, calculateContrast]);

  // 添加到历史记录
  useEffect(() => {
    if (selectedColor && !colorHistory.includes(selectedColor)) {
      setColorHistory(prev => [selectedColor, ...prev.slice(0, 19)]); // 保留最近20个
    }
  }, [selectedColor, colorHistory]);

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

  const addToPalette = () => {
    if (!currentPalette.includes(selectedColor)) {
      setCurrentPalette(prev => [...prev, selectedColor]);
    }
  };

  const savePalette = () => {
    if (currentPalette.length === 0) return;
    
    const palette: ColorPalette = {
      id: Date.now().toString(),
      name: `调色板 ${savedPalettes.length + 1}`,
      colors: [...currentPalette],
      timestamp: Date.now()
    };
    
    setSavedPalettes(prev => [palette, ...prev]);
    setCurrentPalette([]);
  };

  const deletePalette = (id: string) => {
    setSavedPalettes(prev => prev.filter(p => p.id !== id));
  };

  const exportPalette = (palette: ColorPalette) => {
    const data = {
      name: palette.name,
      colors: palette.colors,
      timestamp: palette.timestamp
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${palette.name}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateGradient = () => {
    const gradient = `linear-gradient(${gradientDirection}, ${gradientColors.join(', ')})`;
    return gradient;
  };

  const exportGradientCSS = () => {
    const css = `background: ${generateGradient()};`;
    copyToClipboard(css);
  };

  const clearAll = () => {
    setSelectedColor('#3B82F6');
    setCurrentPalette([]);
  };

  const tabs = [
    { id: 'picker', name: '颜色选择器', icon: <Palette className="w-4 h-4" /> },
    { id: 'harmonies', name: '和谐色彩', icon: <RefreshCw className="w-4 h-4" /> },
    { id: 'palettes', name: '调色板', icon: <Save className="w-4 h-4" /> },
    { id: 'gradient', name: '渐变生成', icon: <Zap className="w-4 h-4" /> },
    { id: 'accessibility', name: '可访问性', icon: <Eye className="w-4 h-4" /> }
  ];

  return (
    <ToolLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            颜色工具集
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            专业的颜色选择、调色板生成和可访问性检测工具
          </p>
        </div>

        {/* 标签页导航 */}
        <div className="card p-4">
          <div className="flex flex-wrap gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                }`}
              >
                {tab.icon}
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：主要功能区 */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'picker' && (
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  颜色选择
                </h2>

                <div className="space-y-6">
                  {/* 颜色预览和选择器 */}
                  <div className="flex items-center gap-6">
                    <div
                      className="w-24 h-24 rounded-xl border-2 border-gray-300 dark:border-gray-600 shadow-lg"
                      style={{ backgroundColor: selectedColor }}
                    />
                    <div className="flex-1 space-y-4">
                      <input
                        type="color"
                        value={selectedColor}
                        onChange={handleColorChange}
                        className="w-full h-12 rounded-lg cursor-pointer border-2 border-gray-300 dark:border-gray-600"
                      />
                      <input
                        type="text"
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className="input"
                        placeholder="#3B82F6"
                      />
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={generateRandomColor}
                      className="btn btn-primary flex items-center gap-2"
                    >
                      <Shuffle className="w-4 h-4" />
                      随机颜色
                    </button>
                    <button
                      onClick={addToPalette}
                      className="btn bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                    >
                      <Star className="w-4 h-4" />
                      添加到调色板
                    </button>
                    <button
                      onClick={clearAll}
                      className="btn bg-gray-500 hover:bg-gray-600 text-white flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      重置
                    </button>
                  </div>

                  {/* 颜色历史 */}
                  {colorHistory.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        最近使用的颜色
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {colorHistory.slice(0, 12).map((color, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedColor(color)}
                            className="w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'harmonies' && (
              <div className="space-y-6">
                {harmonies.map((harmony, index) => (
                  <div key={index} className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {harmony.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {harmony.description}
                        </p>
                      </div>
                      <button
                        onClick={() => setCurrentPalette(harmony.colors)}
                        className="btn-sm bg-blue-600 text-white"
                      >
                        使用此方案
                      </button>
                    </div>
                    <div className="flex gap-2">
                      {harmony.colors.map((color, colorIndex) => (
                        <button
                          key={colorIndex}
                          onClick={() => setSelectedColor(color)}
                          className="flex-1 h-16 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:scale-105 transition-transform relative group"
                          style={{ backgroundColor: color }}
                        >
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg flex items-center justify-center">
                            <span className="text-white font-mono text-xs opacity-0 group-hover:opacity-100">
                              {color}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'palettes' && (
              <div className="space-y-6">
                {/* 当前调色板 */}
                {currentPalette.length > 0 && (
                  <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        当前调色板
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={savePalette}
                          className="btn-sm btn-primary"
                        >
                          保存调色板
                        </button>
                        <button
                          onClick={() => setCurrentPalette([])}
                          className="btn-sm bg-red-600 text-white"
                        >
                          清空
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {currentPalette.map((color, index) => (
                        <div key={index} className="relative group">
                          <div
                            className="w-16 h-16 rounded-lg border-2 border-gray-300 dark:border-gray-600"
                            style={{ backgroundColor: color }}
                          />
                          <button
                            onClick={() => setCurrentPalette(prev => prev.filter((_, i) => i !== index))}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 保存的调色板 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    保存的调色板
                  </h3>
                  {savedPalettes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      还没有保存的调色板
                    </div>
                  ) : (
                    savedPalettes.map((palette) => (
                      <div key={palette.id} className="card p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {palette.name}
                          </h4>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setCurrentPalette(palette.colors)}
                              className="btn-sm bg-blue-600 text-white"
                            >
                              使用
                            </button>
                            <button
                              onClick={() => exportPalette(palette)}
                              className="btn-sm bg-green-600 text-white"
                            >
                              <Download className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => deletePalette(palette.id)}
                              className="btn-sm bg-red-600 text-white"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {palette.colors.map((color, index) => (
                            <button
                              key={index}
                              onClick={() => setSelectedColor(color)}
                              className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'gradient' && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  渐变生成器
                </h3>
                
                <div className="space-y-6">
                  {/* 渐变预览 */}
                  <div
                    className="w-full h-32 rounded-lg border-2 border-gray-300 dark:border-gray-600"
                    style={{ background: generateGradient() }}
                  />

                  {/* 渐变控制 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        方向
                      </label>
                      <select
                        value={gradientDirection}
                        onChange={(e) => setGradientDirection(e.target.value)}
                        className="input"
                      >
                        <option value="to right">向右</option>
                        <option value="to left">向左</option>
                        <option value="to bottom">向下</option>
                        <option value="to top">向上</option>
                        <option value="to bottom right">右下</option>
                        <option value="to bottom left">左下</option>
                        <option value="to top right">右上</option>
                        <option value="to top left">左上</option>
                        <option value="45deg">45度</option>
                        <option value="90deg">90度</option>
                        <option value="135deg">135度</option>
                        <option value="180deg">180度</option>
                      </select>
                    </div>
                  </div>

                  {/* 颜色控制 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      渐变颜色
                    </label>
                    <div className="space-y-3">
                      {gradientColors.map((color, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <input
                            type="color"
                            value={color}
                            onChange={(e) => {
                              const newColors = [...gradientColors];
                              newColors[index] = e.target.value;
                              setGradientColors(newColors);
                            }}
                            className="w-12 h-10 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={color}
                            onChange={(e) => {
                              const newColors = [...gradientColors];
                              newColors[index] = e.target.value;
                              setGradientColors(newColors);
                            }}
                            className="input flex-1"
                          />
                          {gradientColors.length > 2 && (
                            <button
                              onClick={() => setGradientColors(gradientColors.filter((_, i) => i !== index))}
                              className="btn-sm bg-red-600 text-white"
                            >
                              删除
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => setGradientColors([...gradientColors, '#000000'])}
                        className="btn-sm bg-blue-600 text-white"
                      >
                        添加颜色
                      </button>
                      <button
                        onClick={exportGradientCSS}
                        className="btn-sm bg-green-600 text-white flex items-center gap-2"
                      >
                        <Copy className="w-3 h-3" />
                        复制CSS
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'accessibility' && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  可访问性检测
                </h3>
                
                <div className="space-y-6">
                  {/* 对比度测试 */}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                      对比度测试
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div
                          className="w-full h-20 rounded-lg flex items-center justify-center text-white font-semibold border-2 border-gray-300 dark:border-gray-600"
                          style={{ backgroundColor: selectedColor }}
                        >
                          白色文字示例
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          对比度: {accessibilityInfo.contrast}:1
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div
                          className="w-full h-20 rounded-lg flex items-center justify-center text-black font-semibold border-2 border-gray-300 dark:border-gray-600"
                          style={{ backgroundColor: selectedColor }}
                        >
                          黑色文字示例
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          对比度: {calculateContrast(selectedColor, '#000000').toFixed(2)}:1
                        </div>
                      </div>
                    </div>

                    {/* WCAG 标准 */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <h5 className="font-semibold text-gray-900 dark:text-white mb-3">
                        WCAG 可访问性标准
                      </h5>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            WCAG AA (4.5:1)
                          </span>
                          <span className={`text-sm font-semibold ${
                            accessibilityInfo.wcagAA ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {accessibilityInfo.wcagAA ? '✓ 通过' : '✗ 未通过'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            WCAG AAA (7:1)
                          </span>
                          <span className={`text-sm font-semibold ${
                            accessibilityInfo.wcagAAA ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {accessibilityInfo.wcagAAA ? '✓ 通过' : '✗ 未通过'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 色盲模拟 */}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                      色盲模拟
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { name: '正常视觉', filter: 'none' },
                        { name: '红绿色盲', filter: 'sepia(100%) saturate(0%)' },
                        { name: '蓝黄色盲', filter: 'hue-rotate(180deg) saturate(50%)' },
                        { name: '全色盲', filter: 'grayscale(100%)' }
                      ].map((simulation, index) => (
                        <div key={index} className="text-center">
                          <div
                            className="w-full h-16 rounded-lg border-2 border-gray-300 dark:border-gray-600 mb-2"
                            style={{ 
                              backgroundColor: selectedColor,
                              filter: simulation.filter
                            }}
                          />
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {simulation.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 右侧：颜色格式和信息 */}
          <div className="space-y-6">
            {/* 颜色格式 */}
            <div className="card p-6">
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
            <div className="card p-6">
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

            {/* 快速操作 */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                快速操作
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => copyToClipboard(selectedColor)}
                  className="w-full btn btn-primary flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  复制HEX值
                </button>
                <button
                  onClick={generateRandomColor}
                  className="w-full btn bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center gap-2"
                >
                  <Shuffle className="w-4 h-4" />
                  随机生成
                </button>
                <button
                  onClick={addToPalette}
                  className="w-full btn bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
                >
                  <Star className="w-4 h-4" />
                  添加到调色板
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 功能说明 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">
            功能特点
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ul className="space-y-2 text-blue-700 dark:text-blue-300 text-sm">
              <li>• <strong>多格式支持</strong>: HEX、RGB、HSL、CSS变量等</li>
              <li>• <strong>和谐色彩</strong>: 自动生成配色方案</li>
              <li>• <strong>调色板管理</strong>: 保存和导出调色板</li>
              <li>• <strong>渐变生成</strong>: 创建CSS渐变代码</li>
            </ul>
            <ul className="space-y-2 text-blue-700 dark:text-blue-300 text-sm">
              <li>• <strong>可访问性检测</strong>: WCAG标准对比度测试</li>
              <li>• <strong>色盲模拟</strong>: 预览不同视觉条件下的效果</li>
              <li>• <strong>颜色历史</strong>: 记录最近使用的颜色</li>
              <li>• <strong>专业工具</strong>: 适合设计师和开发者使用</li>
            </ul>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
} 