'use client';

import { ToolLayout } from '@/components/tool-layout';
import { useState } from 'react';
import { Palette, Copy, Eye, EyeOff } from 'lucide-react';

interface ColorFormat {
  name: string;
  value: string;
  description: string;
}

export default function ColorPickerPage() {
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const colorFormats: ColorFormat[] = [
    { name: 'HEX', value: selectedColor, description: '十六进制颜色值' },
    { name: 'RGB', value: hexToRgb(selectedColor), description: 'RGB颜色值' },
    { name: 'HSL', value: hexToHsl(selectedColor), description: 'HSL颜色值' },
    { name: 'CMYK', value: hexToCmyk(selectedColor), description: 'CMYK颜色值' },
  ];

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
    const c = (1 - r - k) / (1 - k);
    const m = (1 - g - k) / (1 - k);
    const y = (1 - b - k) / (1 - k);

    return `cmyk(${Math.round(c * 100)}%, ${Math.round(m * 100)}%, ${Math.round(y * 100)}%, ${Math.round(k * 100)}%)`;
  }

  const copyToClipboard = async (text: string, format: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedFormat(format);
      setTimeout(() => setCopiedFormat(null), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const predefinedColors = [
    '#FF0000', '#FF4500', '#FF8C00', '#FFD700', '#FFFF00',
    '#ADFF2F', '#00FF00', '#00FA9A', '#00CED1', '#00BFFF',
    '#1E90FF', '#4169E1', '#8A2BE2', '#9370DB', '#FF69B4',
    '#FF1493', '#DC143C', '#B22222', '#8B0000', '#000000',
    '#FFFFFF', '#F5F5F5', '#D3D3D3', '#A9A9A9', '#696969',
  ];

  return (
    <ToolLayout>
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          颜色选择器
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          选择颜色并获取不同格式的颜色值
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 颜色选择区域 */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              选择颜色
            </h2>
            
            <div className="space-y-4">
              {/* 颜色选择器 */}
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
                  style={{ backgroundColor: selectedColor }}
                  onClick={() => setShowColorPicker(!showColorPicker)}
                />
                <div className="flex-1">
                  <input
                    type="color"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-full h-10 rounded-lg cursor-pointer"
                  />
                </div>
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition-colors"
                >
                  {showColorPicker ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showColorPicker ? '隐藏' : '显示'}选择器
                </button>
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
                      <code className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded text-sm">
                        {format.value}
                      </code>
                      <button
                        onClick={() => copyToClipboard(format.value, format.name)}
                        className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
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
        </div>

        {/* 预设颜色 */}
        <div className="space-y-6">
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
                <span className="text-gray-600 dark:text-gray-400">对比度:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {getContrast(selectedColor)}:1
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
          </div>
        </div>
      </div>
    </ToolLayout>
  );

  function getBrightness(hex: string): number {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return 0;
    
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    
    return Math.round((r * 299 + g * 587 + b * 114) / 1000);
  }

  function getContrast(hex: string): number {
    const brightness = getBrightness(hex);
    const whiteBrightness = 255;
    const blackBrightness = 0;
    
    const contrast1 = (Math.max(brightness, whiteBrightness) + 0.05) / (Math.min(brightness, whiteBrightness) + 0.05);
    const contrast2 = (Math.max(brightness, blackBrightness) + 0.05) / (Math.min(brightness, blackBrightness) + 0.05);
    
    return Math.round(Math.max(contrast1, contrast2) * 10) / 10;
  }

  function isReadable(hex: string): boolean {
    const brightness = getBrightness(hex);
    return brightness > 128;
  }
} 