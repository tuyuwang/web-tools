'use client';

import { ToolLayout } from '@/components/tool-layout';
import { useState, useEffect, useCallback } from 'react';
import { Palette, Copy, Eye, EyeOff, Download, Zap, RefreshCw, Heart, Save, Upload } from 'lucide-react';

interface ColorFormat {
  name: string;
  value: string;
  description: string;
}

interface ColorHistory {
  id: string;
  color: string;
  timestamp: Date;
  name?: string;
}

interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
  description: string;
}

interface ColorHarmony {
  name: string;
  description: string;
  colors: string[];
}

export default function ColorPickerPage() {
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [colorHistory, setColorHistory] = useState<ColorHistory[]>([]);
  const [savedPalettes, setSavedPalettes] = useState<ColorPalette[]>([]);
  const [currentPalette, setCurrentPalette] = useState<string[]>([]);
  const [showPalettePanel, setShowPalettePanel] = useState(false);
  const [showHarmonyPanel, setShowHarmonyPanel] = useState(false);
  const [gradientStart, setGradientStart] = useState('#FF6B6B');
  const [gradientEnd, setGradientEnd] = useState('#4ECDC4');
  const [gradientSteps, setGradientSteps] = useState(5);

  // 预设调色板
  const presetPalettes: ColorPalette[] = [
    {
      id: 'material',
      name: 'Material Design',
      colors: ['#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4'],
      description: 'Google Material Design 调色板'
    },
    {
      id: 'rainbow',
      name: '彩虹色',
      colors: ['#FF0000', '#FF8000', '#FFFF00', '#80FF00', '#00FF00', '#00FF80', '#00FFFF', '#0080FF'],
      description: '彩虹渐变色彩'
    },
    {
      id: 'sunset',
      name: '日落',
      colors: ['#FF6B6B', '#FF8E53', '#FF6B9D', '#C44569', '#F8B500', '#FFA726', '#FF7043', '#8E24AA'],
      description: '温暖的日落色调'
    },
    {
      id: 'ocean',
      name: '海洋',
      colors: ['#0077BE', '#00A8CC', '#0085A3', '#4FC3F7', '#29B6F6', '#03DAC6', '#00ACC1', '#0097A7'],
      description: '清新的海洋色彩'
    },
    {
      id: 'forest',
      name: '森林',
      colors: ['#2E7D32', '#388E3C', '#43A047', '#4CAF50', '#66BB6A', '#81C784', '#A5D6A7', '#C8E6C9'],
      description: '自然的森林绿色'
    },
    {
      id: 'monochrome',
      name: '单色调',
      colors: ['#000000', '#212121', '#424242', '#616161', '#757575', '#9E9E9E', '#BDBDBD', '#E0E0E0'],
      description: '经典黑白灰色调'
    }
  ];

  const colorFormats: ColorFormat[] = [
    { name: 'HEX', value: selectedColor, description: '十六进制颜色值' },
    { name: 'RGB', value: hexToRgb(selectedColor), description: 'RGB颜色值' },
    { name: 'HSL', value: hexToHsl(selectedColor), description: 'HSL颜色值' },
    { name: 'CMYK', value: hexToCmyk(selectedColor), description: 'CMYK颜色值' },
    { name: 'HSV', value: hexToHsv(selectedColor), description: 'HSV颜色值' },
  ];

  // 颜色转换函数
  function hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return 'rgb(0, 0, 0)';
    return `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})`;
  }

  function hexToHsl(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return 'hsl(0, 0%, 0%)';
    
    const r = parseInt(result[1], 16) / 255;
    const g = parseInt(result[2], 16) / 255;
    const b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  }

  function hexToCmyk(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return 'cmyk(0%, 0%, 0%, 100%)';
    
    const r = parseInt(result[1], 16) / 255;
    const g = parseInt(result[2], 16) / 255;
    const b = parseInt(result[3], 16) / 255;

    const k = 1 - Math.max(r, g, b);
    const c = k === 1 ? 0 : (1 - r - k) / (1 - k);
    const m = k === 1 ? 0 : (1 - g - k) / (1 - k);
    const y = k === 1 ? 0 : (1 - b - k) / (1 - k);

    return `cmyk(${Math.round(c * 100)}%, ${Math.round(m * 100)}%, ${Math.round(y * 100)}%, ${Math.round(k * 100)}%)`;
  }

  function hexToHsv(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return 'hsv(0, 0%, 0%)';
    
    const r = parseInt(result[1], 16) / 255;
    const g = parseInt(result[2], 16) / 255;
    const b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const v = max;
    const d = max - min;
    const s = max === 0 ? 0 : d / max;
    let h = 0;

    if (max !== min) {
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return `hsv(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(v * 100)}%)`;
  }

  // 生成颜色和谐
  const generateColorHarmony = useCallback((baseColor: string): ColorHarmony[] => {
    const hsl = hexToHslValues(baseColor);
    const harmonies: ColorHarmony[] = [];

    // 互补色
    const complementary = hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l);
    harmonies.push({
      name: '互补色',
      description: '色轮上相对的颜色，形成强烈对比',
      colors: [baseColor, complementary]
    });

    // 三角色
    const triadic1 = hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l);
    const triadic2 = hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l);
    harmonies.push({
      name: '三角色',
      description: '色轮上等距的三种颜色',
      colors: [baseColor, triadic1, triadic2]
    });

    // 类似色
    const analogous1 = hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l);
    const analogous2 = hslToHex((hsl.h - 30 + 360) % 360, hsl.s, hsl.l);
    harmonies.push({
      name: '类似色',
      description: '色轮上相邻的颜色，和谐统一',
      colors: [analogous2, baseColor, analogous1]
    });

    // 分裂互补色
    const splitComp1 = hslToHex((hsl.h + 150) % 360, hsl.s, hsl.l);
    const splitComp2 = hslToHex((hsl.h + 210) % 360, hsl.s, hsl.l);
    harmonies.push({
      name: '分裂互补色',
      description: '基色与互补色两侧的颜色',
      colors: [baseColor, splitComp1, splitComp2]
    });

    // 单色调
    const monochrome = [
      hslToHex(hsl.h, hsl.s, Math.max(10, hsl.l - 30)),
      hslToHex(hsl.h, hsl.s, Math.max(5, hsl.l - 15)),
      baseColor,
      hslToHex(hsl.h, hsl.s, Math.min(95, hsl.l + 15)),
      hslToHex(hsl.h, hsl.s, Math.min(90, hsl.l + 30))
    ];
    harmonies.push({
      name: '单色调',
      description: '同一色相的不同明度变化',
      colors: monochrome
    });

    return harmonies;
  }, []);

  // HSL转换辅助函数
  function hexToHslValues(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return { h: 0, s: 0, l: 0 };
    
    const r = parseInt(result[1], 16) / 255;
    const g = parseInt(result[2], 16) / 255;
    const b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  function hslToHex(h: number, s: number, l: number): string {
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

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  // 生成渐变色
  const generateGradient = useCallback(() => {
    const start = hexToHslValues(gradientStart);
    const end = hexToHslValues(gradientEnd);
    const colors = [];

    for (let i = 0; i < gradientSteps; i++) {
      const ratio = i / (gradientSteps - 1);
      const h = start.h + (end.h - start.h) * ratio;
      const s = start.s + (end.s - start.s) * ratio;
      const l = start.l + (end.l - start.l) * ratio;
      colors.push(hslToHex(h, s, l));
    }

    return colors;
  }, [gradientStart, gradientEnd, gradientSteps]);

  const copyToClipboard = async (text: string, format: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedFormat(format);
      setTimeout(() => setCopiedFormat(null), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  // 添加到历史记录
  const addToHistory = (color: string) => {
    const newItem: ColorHistory = {
      id: Date.now().toString(),
      color,
      timestamp: new Date()
    };
    setColorHistory(prev => [newItem, ...prev.slice(0, 19)]); // 保留最近20个
  };

  // 添加到当前调色板
  const addToPalette = (color: string) => {
    if (!currentPalette.includes(color)) {
      setCurrentPalette(prev => [...prev, color]);
    }
  };

  // 保存调色板
  const savePalette = () => {
    if (currentPalette.length === 0) return;
    
    const name = prompt('请输入调色板名称:');
    if (name) {
      const newPalette: ColorPalette = {
        id: Date.now().toString(),
        name,
        colors: [...currentPalette],
        description: `自定义调色板 - ${new Date().toLocaleDateString()}`
      };
      setSavedPalettes(prev => [...prev, newPalette]);
    }
  };

  // 导出调色板
  const exportPalette = (palette: ColorPalette, format: 'css' | 'json' | 'ase') => {
    let content = '';
    let filename = '';
    let mimeType = '';

    switch (format) {
      case 'css':
        content = `:root {\n${palette.colors.map((color, index) => `  --color-${index + 1}: ${color};`).join('\n')}\n}`;
        filename = `${palette.name}.css`;
        mimeType = 'text/css';
        break;
      case 'json':
        content = JSON.stringify({
          name: palette.name,
          description: palette.description,
          colors: palette.colors
        }, null, 2);
        filename = `${palette.name}.json`;
        mimeType = 'application/json';
        break;
      case 'ase':
        // 简化的ASE格式（实际应用中需要二进制处理）
        content = `Adobe Swatch Exchange\n${palette.name}\n${palette.colors.join('\n')}`;
        filename = `${palette.name}.ase`;
        mimeType = 'text/plain';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 随机颜色生成
  const generateRandomColor = () => {
    const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    setSelectedColor(randomColor);
    addToHistory(randomColor);
  };

  // 当颜色改变时添加到历史记录
  useEffect(() => {
    addToHistory(selectedColor);
  }, [selectedColor]);

  const predefinedColors = [
    '#FF0000', '#FF4500', '#FF8C00', '#FFD700', '#FFFF00',
    '#ADFF2F', '#00FF00', '#00FA9A', '#00CED1', '#00BFFF',
    '#1E90FF', '#4169E1', '#8A2BE2', '#9370DB', '#FF69B4',
    '#FF1493', '#DC143C', '#B22222', '#8B0000', '#000000',
    '#FFFFFF', '#F5F5F5', '#D3D3D3', '#A9A9A9', '#696969',
  ];

  const colorHarmonies = generateColorHarmony(selectedColor);
  const gradientColors = generateGradient();

  return (
    <ToolLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            颜色选择器
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            专业的颜色选择工具，支持调色板、色彩和谐、渐变生成等功能
          </p>
        </div>

        {/* 工具栏 */}
        <div className="flex flex-wrap gap-4 justify-center items-center">
          <button
            onClick={() => setShowPalettePanel(!showPalettePanel)}
            className="btn bg-purple-600 hover:bg-purple-700 text-white text-sm"
          >
            <Palette className="w-4 h-4 mr-1" />
            调色板
          </button>

          <button
            onClick={() => setShowHarmonyPanel(!showHarmonyPanel)}
            className="btn bg-green-600 hover:bg-green-700 text-white text-sm"
          >
            <Heart className="w-4 h-4 mr-1" />
            色彩和谐
          </button>

          <button
            onClick={generateRandomColor}
            className="btn bg-blue-600 hover:bg-blue-700 text-white text-sm"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            随机颜色
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 颜色选择区域 */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                选择颜色
              </h2>
              
              <div className="space-y-4">
                {/* 主颜色选择器 */}
                <div className="flex items-center gap-4">
                  <div
                    className="w-20 h-20 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer shadow-lg"
                    style={{ backgroundColor: selectedColor }}
                    onClick={() => setShowColorPicker(!showColorPicker)}
                  />
                  <div className="flex-1">
                    <input
                      type="color"
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      className="w-full h-12 rounded-lg cursor-pointer border border-gray-300 dark:border-gray-600"
                    />
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      点击色块或拖动滑块选择颜色
                    </div>
                  </div>
                </div>

                {/* 颜色格式 */}
                <div className="space-y-3">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    颜色格式
                  </h3>
                  {colorFormats.map((format) => (
                    <div key={format.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {format.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {format.description}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded text-sm font-mono">
                          {format.value}
                        </code>
                        <button
                          onClick={() => copyToClipboard(format.value, format.name)}
                          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                          title="复制到剪贴板"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 复制成功提示 */}
                {copiedFormat && (
                  <div className="p-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg text-sm">
                    {copiedFormat} 格式已复制到剪贴板
                  </div>
                )}
              </div>
            </div>

            {/* 预定义颜色 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                预设颜色
              </h2>
              
              <div className="grid grid-cols-5 gap-3">
                {predefinedColors.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedColor(color)}
                    className={`w-12 h-12 rounded-lg border-2 transition-all hover:scale-110 ${
                      selectedColor === color
                        ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 颜色信息和历史 */}
          <div className="space-y-6">
            {/* 颜色信息 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                颜色信息
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">亮度:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {getBrightness(selectedColor)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">对比度 (vs 白):</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {getContrast(selectedColor, '#FFFFFF')}:1
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">对比度 (vs 黑):</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {getContrast(selectedColor, '#000000')}:1
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">可读性:</span>
                  <span className={`font-medium ${
                    isReadable(selectedColor) 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {isReadable(selectedColor) ? '良好' : '较差'}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="flex gap-2">
                  <button
                    onClick={() => addToPalette(selectedColor)}
                    className="flex-1 btn bg-purple-600 hover:bg-purple-700 text-white text-sm"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    添加到调色板
                  </button>
                </div>
              </div>
            </div>

            {/* 历史记录 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                历史记录
              </h2>
              
              {colorHistory.length > 0 ? (
                <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto">
                  {colorHistory.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedColor(item.color)}
                      className={`w-8 h-8 rounded border-2 transition-all hover:scale-110 ${
                        selectedColor === item.color
                          ? 'border-blue-500 ring-1 ring-blue-200'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      style={{ backgroundColor: item.color }}
                      title={`${item.color} - ${item.timestamp.toLocaleTimeString()}`}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                  暂无历史记录
                </div>
              )}
            </div>
          </div>

          {/* 当前调色板 */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  当前调色板
                </h2>
                <div className="flex gap-2">
                  {currentPalette.length > 0 && (
                    <button
                      onClick={savePalette}
                      className="btn bg-green-600 hover:bg-green-700 text-white text-sm"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      保存
                    </button>
                  )}
                  <button
                    onClick={() => setCurrentPalette([])}
                    className="btn bg-red-600 hover:bg-red-700 text-white text-sm"
                  >
                    清空
                  </button>
                </div>
              </div>
              
              {currentPalette.length > 0 ? (
                <div className="grid grid-cols-4 gap-3">
                  {currentPalette.map((color, index) => (
                    <div key={index} className="relative group">
                      <button
                        onClick={() => setSelectedColor(color)}
                        className="w-full h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                      <button
                        onClick={() => setCurrentPalette(prev => prev.filter((_, i) => i !== index))}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                  点击"添加到调色板"按钮添加颜色
                </div>
              )}
            </div>

            {/* 渐变生成器 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                渐变生成器
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      起始色
                    </label>
                    <input
                      type="color"
                      value={gradientStart}
                      onChange={(e) => setGradientStart(e.target.value)}
                      className="w-full h-10 rounded border border-gray-300 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      结束色
                    </label>
                    <input
                      type="color"
                      value={gradientEnd}
                      onChange={(e) => setGradientEnd(e.target.value)}
                      className="w-full h-10 rounded border border-gray-300 dark:border-gray-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    步数: {gradientSteps}
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="10"
                    value={gradientSteps}
                    onChange={(e) => setGradientSteps(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {gradientColors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedColor(color)}
                      className="w-full h-8 rounded border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPalette(gradientColors)}
                  className="w-full btn bg-blue-600 hover:bg-blue-700 text-white text-sm"
                >
                  添加渐变到调色板
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 调色板面板 */}
        {showPalettePanel && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              调色板库
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 预设调色板 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  预设调色板
                </h3>
                <div className="space-y-4">
                  {presetPalettes.map((palette) => (
                    <div key={palette.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {palette.name}
                        </h4>
                        <button
                          onClick={() => setCurrentPalette(palette.colors)}
                          className="btn bg-blue-600 hover:bg-blue-700 text-white text-xs"
                        >
                          使用
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {palette.description}
                      </p>
                      <div className="flex gap-1">
                        {palette.colors.map((color, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedColor(color)}
                            className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 保存的调色板 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  保存的调色板
                </h3>
                {savedPalettes.length > 0 ? (
                  <div className="space-y-4">
                    {savedPalettes.map((palette) => (
                      <div key={palette.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {palette.name}
                          </h4>
                          <div className="flex gap-1">
                            <button
                              onClick={() => setCurrentPalette(palette.colors)}
                              className="btn bg-blue-600 hover:bg-blue-700 text-white text-xs"
                            >
                              使用
                            </button>
                            <button
                              onClick={() => exportPalette(palette, 'json')}
                              className="btn bg-green-600 hover:bg-green-700 text-white text-xs"
                            >
                              <Download className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {palette.description}
                        </p>
                        <div className="flex gap-1">
                          {palette.colors.map((color, index) => (
                            <button
                              key={index}
                              onClick={() => setSelectedColor(color)}
                              className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                    暂无保存的调色板
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 色彩和谐面板 */}
        {showHarmonyPanel && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              色彩和谐方案
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {colorHarmonies.map((harmony, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    {harmony.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {harmony.description}
                  </p>
                  <div className="flex gap-1 mb-3">
                    {harmony.colors.map((color, colorIndex) => (
                      <button
                        key={colorIndex}
                        onClick={() => setSelectedColor(color)}
                        className="flex-1 h-8 rounded border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPalette(harmony.colors)}
                    className="w-full btn bg-purple-600 hover:bg-purple-700 text-white text-xs"
                  >
                    使用此方案
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );

  function getBrightness(hex: string): number {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return 0;
    
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    
    return Math.round((r * 299 + g * 587 + b * 114) / 1000 / 255 * 100);
  }

  function getContrast(hex1: string, hex2: string): number {
    const brightness1 = getBrightness(hex1) / 100;
    const brightness2 = getBrightness(hex2) / 100;
    
    const l1 = Math.max(brightness1, brightness2);
    const l2 = Math.min(brightness1, brightness2);
    
    return Math.round(((l1 + 0.05) / (l2 + 0.05)) * 10) / 10;
  }

  function isReadable(hex: string): boolean {
    const brightness = getBrightness(hex);
    return brightness > 50; // 简化的可读性判断
  }
} 