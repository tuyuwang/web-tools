'use client';

import { useState, useEffect } from 'react';
import { Palette, RefreshCw, Copy, Download, Lock, Unlock } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';

interface Color {
  hex: string;
  name: string;
  locked: boolean;
}

export default function ColorPaletteGeneratorPage() {
  const [colors, setColors] = useState<Color[]>([]);
  const [colorScheme, setColorScheme] = useState<'monochromatic' | 'analogous' | 'complementary' | 'triadic' | 'tetradic' | 'random'>('complementary');
  const [baseColor, setBaseColor] = useState('#3B82F6');
  const [copied, setCopied] = useState(false);
  const [exportFormat, setExportFormat] = useState<'css' | 'scss' | 'json' | 'ase'>('css');

  // 颜色名称映射
  const colorNames = [
    '主色调', '辅助色', '强调色', '背景色', '文本色'
  ];

  // HSL转RGB
  const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
    h /= 360;
    s /= 100;
    l /= 100;

    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r, g, b;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  };

  // RGB转HEX
  const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  // HEX转HSL
  const hexToHsl = (hex: string): [number, number, number] => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return [h * 360, s * 100, l * 100];
  };

  // 生成配色方案
  const generateColorScheme = (base: string, scheme: string): string[] => {
    const [h, s, l] = hexToHsl(base);

    switch (scheme) {
      case 'monochromatic':
        return [
          base,
          rgbToHex(...hslToRgb(h, s, Math.max(10, l - 20))),
          rgbToHex(...hslToRgb(h, s, Math.min(90, l + 20))),
          rgbToHex(...hslToRgb(h, Math.max(10, s - 30), l)),
          rgbToHex(...hslToRgb(h, Math.min(100, s + 30), l))
        ];

      case 'analogous':
        return [
          base,
          rgbToHex(...hslToRgb((h + 30) % 360, s, l)),
          rgbToHex(...hslToRgb((h - 30 + 360) % 360, s, l)),
          rgbToHex(...hslToRgb((h + 60) % 360, s, l)),
          rgbToHex(...hslToRgb((h - 60 + 360) % 360, s, l))
        ];

      case 'complementary':
        return [
          base,
          rgbToHex(...hslToRgb((h + 180) % 360, s, l)),
          rgbToHex(...hslToRgb(h, s, Math.min(90, l + 30))),
          rgbToHex(...hslToRgb((h + 180) % 360, s, Math.max(10, l - 30))),
          rgbToHex(...hslToRgb(h, Math.max(10, s - 40), Math.min(90, l + 40)))
        ];

      case 'triadic':
        return [
          base,
          rgbToHex(...hslToRgb((h + 120) % 360, s, l)),
          rgbToHex(...hslToRgb((h + 240) % 360, s, l)),
          rgbToHex(...hslToRgb(h, s, Math.min(90, l + 20))),
          rgbToHex(...hslToRgb((h + 120) % 360, s, Math.max(10, l - 20)))
        ];

      case 'tetradic':
        return [
          base,
          rgbToHex(...hslToRgb((h + 90) % 360, s, l)),
          rgbToHex(...hslToRgb((h + 180) % 360, s, l)),
          rgbToHex(...hslToRgb((h + 270) % 360, s, l)),
          rgbToHex(...hslToRgb(h, Math.max(10, s - 20), Math.min(90, l + 20)))
        ];

      case 'random':
      default:
        return [
          base,
          rgbToHex(...hslToRgb(Math.random() * 360, 50 + Math.random() * 50, 30 + Math.random() * 40)),
          rgbToHex(...hslToRgb(Math.random() * 360, 50 + Math.random() * 50, 30 + Math.random() * 40)),
          rgbToHex(...hslToRgb(Math.random() * 360, 50 + Math.random() * 50, 30 + Math.random() * 40)),
          rgbToHex(...hslToRgb(Math.random() * 360, 50 + Math.random() * 50, 30 + Math.random() * 40))
        ];
    }
  };

  // 生成配色
  const generatePalette = () => {
    const newHexColors = generateColorScheme(baseColor, colorScheme);
    const newColors = newHexColors.map((hex, index) => ({
      hex,
      name: colorNames[index] || `颜色${index + 1}`,
      locked: colors[index]?.locked || false
    }));

    // 保留已锁定的颜色
    const finalColors = newColors.map((color, index) => {
      if (colors[index]?.locked) {
        return colors[index];
      }
      return color;
    });

    setColors(finalColors);
  };

  // 锁定/解锁颜色
  const toggleColorLock = (index: number) => {
    const newColors = [...colors];
    newColors[index] = { ...newColors[index], locked: !newColors[index].locked };
    setColors(newColors);
  };

  // 更新单个颜色
  const updateColor = (index: number, hex: string) => {
    const newColors = [...colors];
    newColors[index] = { ...newColors[index], hex };
    setColors(newColors);
  };

  // 复制配色方案
  const copyPalette = () => {
    const text = colors.map(color => color.hex).join(' ');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 导出配色方案
  const exportPalette = () => {
    let content = '';
    const timestamp = new Date().toISOString().slice(0, 10);

    switch (exportFormat) {
      case 'css':
        content = `:root {\n${colors.map((color, index) => 
          `  --color-${index + 1}: ${color.hex}; /* ${color.name} */`
        ).join('\n')}\n}`;
        break;

      case 'scss':
        content = colors.map((color, index) => 
          `$color-${index + 1}: ${color.hex}; // ${color.name}`
        ).join('\n');
        break;

      case 'json':
        content = JSON.stringify({
          name: `Color Palette ${timestamp}`,
          colors: colors.map((color, index) => ({
            name: color.name,
            hex: color.hex,
            rgb: color.hex.slice(1).match(/.{2}/g)?.map(x => parseInt(x, 16))
          }))
        }, null, 2);
        break;

      case 'ase':
        content = colors.map(color => `${color.name}\t${color.hex}`).join('\n');
        break;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `color-palette-${timestamp}.${exportFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 获取对比度较好的文本颜色
  const getContrastColor = (hex: string): string => {
    const [r, g, b] = [hex.slice(1, 3), hex.slice(3, 5), hex.slice(5, 7)]
      .map(x => parseInt(x, 16));
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  useEffect(() => {
    generatePalette();
  }, [baseColor, colorScheme]);

  return (
    <ToolLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-2">
            <Palette className="h-8 w-8" />
            配色方案生成器
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            根据色彩理论生成和谐的配色方案，支持多种配色规则
          </p>
        </div>

        {/* 控制面板 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                基础颜色
              </label>
              <input
                type="color"
                value={baseColor}
                onChange={(e) => setBaseColor(e.target.value)}
                className="w-full h-12 rounded-lg border border-gray-300 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                配色规则
              </label>
              <select
                value={colorScheme}
                onChange={(e) => setColorScheme(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="complementary">互补色</option>
                <option value="analogous">类似色</option>
                <option value="triadic">三角色</option>
                <option value="tetradic">四角色</option>
                <option value="monochromatic">单色调</option>
                <option value="random">随机色</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                导出格式
              </label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="css">CSS</option>
                <option value="scss">SCSS</option>
                <option value="json">JSON</option>
                <option value="ase">ASE</option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={generatePalette}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                重新生成
              </button>
            </div>
          </div>
        </div>

        {/* 配色展示 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              配色方案
            </h2>
            <div className="flex gap-2">
              <button
                onClick={copyPalette}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  copied
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-500 hover:bg-gray-600 text-white'
                }`}
              >
                <Copy className="h-4 w-4" />
                {copied ? '已复制' : '复制'}
              </button>
              <button
                onClick={exportPalette}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                导出
              </button>
            </div>
          </div>

          {/* 大色块展示 */}
          <div className="grid grid-cols-5 gap-4 mb-8">
            {colors.map((color, index) => (
              <div key={index} className="space-y-3">
                <div
                  className="aspect-square rounded-lg border-2 border-gray-200 dark:border-gray-600 relative overflow-hidden cursor-pointer group"
                  style={{ backgroundColor: color.hex }}
                >
                  <div
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50"
                    style={{ color: getContrastColor(color.hex) }}
                  >
                    <span className="font-medium">{color.hex}</span>
                  </div>
                  <button
                    onClick={() => toggleColorLock(index)}
                    className="absolute top-2 right-2 p-1 bg-white bg-opacity-80 rounded"
                  >
                    {color.locked ? (
                      <Lock className="h-3 w-3 text-gray-600" />
                    ) : (
                      <Unlock className="h-3 w-3 text-gray-600" />
                    )}
                  </button>
                </div>
                
                <div className="space-y-2">
                  <input
                    type="text"
                    value={color.name}
                    onChange={(e) => {
                      const newColors = [...colors];
                      newColors[index] = { ...newColors[index], name: e.target.value };
                      setColors(newColors);
                    }}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <input
                    type="color"
                    value={color.hex}
                    onChange={(e) => updateColor(index, e.target.value)}
                    className="w-full h-8 rounded border border-gray-300 cursor-pointer"
                  />
                  <div className="text-xs font-mono text-gray-600 dark:text-gray-400 text-center">
                    {color.hex.toUpperCase()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 配色预览应用 */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              应用预览
            </h3>
            
            {/* 网页布局预览 */}
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <div 
                className="h-16 flex items-center px-6"
                style={{ backgroundColor: colors[0]?.hex }}
              >
                <div 
                  className="text-lg font-semibold"
                  style={{ color: getContrastColor(colors[0]?.hex || '#000') }}
                >
                  网站标题
                </div>
                <div className="ml-auto flex gap-4">
                  {['首页', '关于', '联系'].map((item, index) => (
                    <span 
                      key={item}
                      className="text-sm"
                      style={{ color: getContrastColor(colors[0]?.hex || '#000') }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              
              <div 
                className="p-6"
                style={{ backgroundColor: colors[2]?.hex }}
              >
                <div 
                  className="text-2xl font-bold mb-4"
                  style={{ color: getContrastColor(colors[2]?.hex || '#000') }}
                >
                  主要内容区域
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[0, 1, 2].map((index) => (
                    <div 
                      key={index}
                      className="p-4 rounded-lg"
                      style={{ backgroundColor: colors[1]?.hex }}
                    >
                      <div 
                        className="font-medium mb-2"
                        style={{ color: getContrastColor(colors[1]?.hex || '#000') }}
                      >
                        卡片标题
                      </div>
                      <div 
                        className="text-sm"
                        style={{ color: getContrastColor(colors[1]?.hex || '#000') }}
                      >
                        这里是卡片内容的描述文字
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 按钮组预览 */}
            <div className="flex flex-wrap gap-4">
              {colors.map((color, index) => (
                <button
                  key={index}
                  className="px-6 py-2 rounded-lg font-medium"
                  style={{ 
                    backgroundColor: color.hex,
                    color: getContrastColor(color.hex)
                  }}
                >
                  {color.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 配色理论说明 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">
              互补色 (Complementary)
            </h3>
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              使用色环上相对的颜色，产生强烈对比，适合需要突出重点的设计。
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-4">
              类似色 (Analogous)
            </h3>
            <p className="text-green-700 dark:text-green-300 text-sm">
              使用色环上相邻的颜色，产生和谐统一的效果，适合舒缓的设计风格。
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-4">
              三角色 (Triadic)
            </h3>
            <p className="text-purple-700 dark:text-purple-300 text-sm">
              使用色环上等距的三个颜色，平衡对比度和和谐度，适合活泼的设计。
            </p>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">
            使用说明
          </h3>
          <ul className="space-y-2 text-blue-700 dark:text-blue-300">
            <li>• 选择基础颜色和配色规则生成配色方案</li>
            <li>• 点击锁定图标可固定喜欢的颜色</li>
            <li>• 直接编辑颜色名称和颜色值</li>
            <li>• 在应用预览中查看配色效果</li>
            <li>• 支持多种格式导出配色方案</li>
            <li>• 适用于网页设计、UI设计、品牌设计等</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}