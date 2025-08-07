'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Copy, Download, Eye, Palette, Shuffle } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';
import { useLanguage } from '@/components/language-provider';

interface Color {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  name?: string;
}

type PaletteType = 'analogous' | 'complementary' | 'triadic' | 'tetradic' | 'monochromatic' | 'split-complementary' | 'random';

// 色彩转换工具函数
const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
};

const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h: number, s: number, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
};

const hslToHex = (h: number, s: number, l: number): string => {
  h /= 360;
  s /= 100;
  l /= 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  const toHex = (c: number) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const createColor = (hex: string): Color => {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  return { hex, rgb, hsl };
};

// 调色板生成算法
const generatePalette = (baseColor: string, type: PaletteType, count: number = 5): Color[] => {
  const base = createColor(baseColor);
  const { h, s, l } = base.hsl;

  switch (type) {
    case 'analogous':
      return Array.from({ length: count }, (_, i) => {
        const newH = (h + (i * 30) - (count - 1) * 15) % 360;
        return createColor(hslToHex(newH, s, l));
      });

    case 'complementary':
      return [
        base,
        createColor(hslToHex((h + 180) % 360, s, l)),
        createColor(hslToHex(h, s * 0.7, l * 1.1)),
        createColor(hslToHex((h + 180) % 360, s * 0.7, l * 1.1)),
        createColor(hslToHex(h, s * 0.5, l * 0.9)),
      ].slice(0, count);

    case 'triadic':
      return [
        base,
        createColor(hslToHex((h + 120) % 360, s, l)),
        createColor(hslToHex((h + 240) % 360, s, l)),
        createColor(hslToHex(h, s * 0.7, l * 1.1)),
        createColor(hslToHex((h + 120) % 360, s * 0.7, l * 1.1)),
      ].slice(0, count);

    case 'tetradic':
      return [
        base,
        createColor(hslToHex((h + 90) % 360, s, l)),
        createColor(hslToHex((h + 180) % 360, s, l)),
        createColor(hslToHex((h + 270) % 360, s, l)),
        createColor(hslToHex(h, s * 0.8, l * 1.05)),
      ].slice(0, count);

    case 'monochromatic':
      return Array.from({ length: count }, (_, i) => {
        const newL = Math.max(10, Math.min(90, l + (i - Math.floor(count / 2)) * 15));
        return createColor(hslToHex(h, s, newL));
      });

    case 'split-complementary':
      return [
        base,
        createColor(hslToHex((h + 150) % 360, s, l)),
        createColor(hslToHex((h + 210) % 360, s, l)),
        createColor(hslToHex(h, s * 0.7, l * 1.1)),
        createColor(hslToHex((h + 180) % 360, s * 0.5, l * 0.9)),
      ].slice(0, count);

    case 'random':
      return Array.from({ length: count }, () => {
        const randomH = Math.floor(Math.random() * 360);
        const randomS = Math.floor(Math.random() * 40) + 40; // 40-80%
        const randomL = Math.floor(Math.random() * 40) + 30; // 30-70%
        return createColor(hslToHex(randomH, randomS, randomL));
      });

    default:
      return [base];
  }
};

// 获取随机颜色
const getRandomColor = (): string => {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
};

export default function ColorPalettePage() {
  const { t } = useLanguage();
  const [baseColor, setBaseColor] = useState('#3B82F6');
  const [paletteType, setPaletteType] = useState<PaletteType>('analogous');
  const [colorCount, setColorCount] = useState(5);
  const [palette, setPalette] = useState<Color[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // 调色板类型选项
  const paletteTypes = [
    { id: 'analogous', name: '类似色', description: '色轮上相邻的颜色' },
    { id: 'complementary', name: '互补色', description: '色轮上相对的颜色' },
    { id: 'triadic', name: '三角色', description: '色轮上等距的三个颜色' },
    { id: 'tetradic', name: '四角色', description: '色轮上的四个颜色' },
    { id: 'monochromatic', name: '单色调', description: '同一色相的不同明度' },
    { id: 'split-complementary', name: '分离互补色', description: '一个颜色加上互补色两侧的颜色' },
    { id: 'random', name: '随机', description: '随机生成的颜色组合' },
  ];

  // 生成调色板
  const generateNewPalette = () => {
    const newPalette = generatePalette(baseColor, paletteType, colorCount);
    setPalette(newPalette);
  };

  // 复制颜色值
  const copyColor = async (color: Color, index: number) => {
    try {
      await navigator.clipboard.writeText(color.hex);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  // 导出调色板
  const exportPalette = () => {
    const colors = palette.map(color => color.hex).join('\n');
    const blob = new Blob([colors], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `color-palette-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 生成随机基色
  const randomizeBaseColor = () => {
    setBaseColor(getRandomColor());
  };

  // 当设置变化时重新生成调色板
  useEffect(() => {
    generateNewPalette();
  }, [baseColor, paletteType, colorCount]);

  // 获取文本颜色（根据背景色的亮度）
  const getTextColor = (bgColor: string): string => {
    const rgb = hexToRgb(bgColor);
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  };

  return (
    <ToolLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* 标题区域 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            调色板生成器
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            智能生成和谐的色彩搭配方案，支持多种色彩理论
          </p>
        </div>

        {/* 控制面板 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* 基础颜色选择 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                基础颜色
              </label>
              <div className="flex space-x-2">
                <input
                  type="color"
                  value={baseColor}
                  onChange={(e) => setBaseColor(e.target.value)}
                  className="w-12 h-10 rounded border border-gray-300 dark:border-gray-600"
                />
                <input
                  type="text"
                  value={baseColor}
                  onChange={(e) => setBaseColor(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <button
                  onClick={randomizeBaseColor}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md transition-colors"
                  title="随机颜色"
                >
                  <Shuffle className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 调色板类型 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                调色板类型
              </label>
              <select
                value={paletteType}
                onChange={(e) => setPaletteType(e.target.value as PaletteType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {paletteTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 颜色数量 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                颜色数量: {colorCount}
              </label>
              <input
                type="range"
                min="3"
                max="8"
                value={colorCount}
                onChange={(e) => setColorCount(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* 操作按钮 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                操作
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={generateNewPalette}
                  className="flex items-center space-x-1 px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>生成</span>
                </button>
                <button
                  onClick={exportPalette}
                  className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>导出</span>
                </button>
              </div>
            </div>
          </div>

          {/* 调色板类型说明 */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>{paletteTypes.find(t => t.id === paletteType)?.name}：</strong>
              {paletteTypes.find(t => t.id === paletteType)?.description}
            </p>
          </div>
        </div>

        {/* 调色板展示 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Palette className="w-5 h-5 mr-2" />
            调色板预览
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {palette.map((color, index) => (
              <div
                key={index}
                className="group relative bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden transition-transform hover:scale-105"
              >
                {/* 颜色预览 */}
                <div
                  className="h-32 w-full cursor-pointer relative"
                  style={{ backgroundColor: color.hex }}
                  onClick={() => copyColor(color, index)}
                >
                  <div
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: getTextColor(color.hex) }}
                  >
                    {copiedIndex === index ? (
                      <span className="text-sm font-medium">已复制!</span>
                    ) : (
                      <Copy className="w-6 h-6" />
                    )}
                  </div>
                </div>

                {/* 颜色信息 */}
                <div className="p-3 space-y-2">
                  <div className="text-center">
                    <div className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                      {color.hex.toUpperCase()}
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <div>RGB: {color.rgb.r}, {color.rgb.g}, {color.rgb.b}</div>
                    <div>
                      HSL: {Math.round(color.hsl.h)}°, {Math.round(color.hsl.s)}%, {Math.round(color.hsl.l)}%
                    </div>
                  </div>

                  <button
                    onClick={() => copyColor(color, index)}
                    className="w-full px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 rounded transition-colors"
                  >
                    点击复制
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 色彩应用示例 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Eye className="w-5 h-5 mr-2" />
            应用示例
          </h3>
          
          {palette.length > 0 && (
            <div className="space-y-6">
              {/* 网站布局示例 */}
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                <div
                  className="h-16 flex items-center px-6"
                  style={{ backgroundColor: palette[0]?.hex, color: getTextColor(palette[0]?.hex || '#ffffff') }}
                >
                  <div className="font-semibold">网站标题</div>
                  <div className="ml-auto space-x-4">
                    <span>首页</span>
                    <span>关于</span>
                    <span>联系</span>
                  </div>
                </div>
                <div className="p-6" style={{ backgroundColor: palette[4]?.hex || '#f9f9f9' }}>
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold" style={{ color: palette[1]?.hex }}>
                      主要内容标题
                    </h2>
                    <p className="text-gray-600">
                      这是一个使用生成调色板的网站布局示例。主色调和辅助色的搭配创造了和谐的视觉效果。
                    </p>
                    <div className="flex space-x-2">
                      <button
                        className="px-4 py-2 rounded text-white font-medium"
                        style={{ backgroundColor: palette[2]?.hex }}
                      >
                        主要按钮
                      </button>
                      <button
                        className="px-4 py-2 rounded border font-medium"
                        style={{ 
                          borderColor: palette[2]?.hex, 
                          color: palette[2]?.hex 
                        }}
                      >
                        次要按钮
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 卡片示例 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {palette.slice(0, 3).map((color, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg"
                    style={{ backgroundColor: color.hex, color: getTextColor(color.hex) }}
                  >
                    <h3 className="font-semibold mb-2">卡片 {index + 1}</h3>
                    <p className="text-sm opacity-90">
                      使用调色板中的颜色创建的卡片设计示例。
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 使用说明 */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            使用说明
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>• 选择基础颜色作为调色板的起点</li>
            <li>• 选择不同的调色板类型来创建不同的色彩关系</li>
            <li>• 调整颜色数量来获得更多或更少的颜色</li>
            <li>• 点击颜色块复制十六进制颜色值</li>
            <li>• 使用导出功能保存调色板</li>
            <li>• 参考应用示例了解如何在设计中使用这些颜色</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}