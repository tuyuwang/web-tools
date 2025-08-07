'use client';

import { useState } from 'react';
import { Copy, Download, Eye, Code } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';
import { useLanguage } from '@/components/language-provider';

interface BoxShadowConfig {
  horizontal: number;
  vertical: number;
  blur: number;
  spread: number;
  color: string;
  inset: boolean;
}

interface BorderConfig {
  width: number;
  style: string;
  color: string;
  radius: number;
}

interface GradientConfig {
  type: 'linear' | 'radial';
  direction: number;
  colors: Array<{ color: string; position: number }>;
}

export default function CSSGeneratorPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'shadow' | 'border' | 'gradient'>('shadow');
  const [showPreview, setShowPreview] = useState(true);

  // Box Shadow 配置
  const [boxShadow, setBoxShadow] = useState<BoxShadowConfig>({
    horizontal: 0,
    vertical: 4,
    blur: 8,
    spread: 0,
    color: '#000000',
    inset: false,
  });

  // Border 配置
  const [border, setBorder] = useState<BorderConfig>({
    width: 1,
    style: 'solid',
    color: '#000000',
    radius: 8,
  });

  // Gradient 配置
  const [gradient, setGradient] = useState<GradientConfig>({
    type: 'linear',
    direction: 45,
    colors: [
      { color: '#ff6b6b', position: 0 },
      { color: '#4ecdc4', position: 100 },
    ],
  });

  // 生成 CSS 代码
  const generateBoxShadowCSS = () => {
    const { horizontal, vertical, blur, spread, color, inset } = boxShadow;
    const insetStr = inset ? 'inset ' : '';
    return `box-shadow: ${insetStr}${horizontal}px ${vertical}px ${blur}px ${spread}px ${color};`;
  };

  const generateBorderCSS = () => {
    const { width, style, color, radius } = border;
    return `border: ${width}px ${style} ${color};\nborder-radius: ${radius}px;`;
  };

  const generateGradientCSS = () => {
    const { type, direction, colors } = gradient;
    const colorStops = colors
      .map(c => `${c.color} ${c.position}%`)
      .join(', ');
    
    if (type === 'linear') {
      return `background: linear-gradient(${direction}deg, ${colorStops});`;
    } else {
      return `background: radial-gradient(circle, ${colorStops});`;
    }
  };

  const getCurrentCSS = () => {
    switch (activeTab) {
      case 'shadow':
        return generateBoxShadowCSS();
      case 'border':
        return generateBorderCSS();
      case 'gradient':
        return generateGradientCSS();
      default:
        return '';
    }
  };

  const copyCSS = async () => {
    await navigator.clipboard.writeText(getCurrentCSS());
  };

  const downloadCSS = () => {
    const css = getCurrentCSS();
    const blob = new Blob([css], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}-style.css`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getPreviewStyle = () => {
    const baseStyle: React.CSSProperties = {
      width: '200px',
      height: '120px',
      margin: '20px auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: activeTab === 'gradient' ? 'transparent' : '#f0f0f0',
      color: '#333',
      fontSize: '14px',
      fontWeight: 'bold',
    };

    switch (activeTab) {
      case 'shadow':
        return {
          ...baseStyle,
          boxShadow: boxShadow.inset 
            ? `inset ${boxShadow.horizontal}px ${boxShadow.vertical}px ${boxShadow.blur}px ${boxShadow.spread}px ${boxShadow.color}`
            : `${boxShadow.horizontal}px ${boxShadow.vertical}px ${boxShadow.blur}px ${boxShadow.spread}px ${boxShadow.color}`,
        };
      case 'border':
        return {
          ...baseStyle,
          border: `${border.width}px ${border.style} ${border.color}`,
          borderRadius: `${border.radius}px`,
        };
      case 'gradient':
        const { type, direction, colors } = gradient;
        const colorStops = colors.map(c => `${c.color} ${c.position}%`).join(', ');
        return {
          ...baseStyle,
          background: type === 'linear' 
            ? `linear-gradient(${direction}deg, ${colorStops})`
            : `radial-gradient(circle, ${colorStops})`,
        };
      default:
        return baseStyle;
    }
  };

  return (
    <ToolLayout
      title="CSS代码生成器"
      description="可视化生成CSS代码，包括阴影、边框、渐变等效果"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 标签页 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'shadow', label: 'Box Shadow', icon: '🎯' },
                { key: 'border', label: 'Border', icon: '⭕' },
                { key: 'gradient', label: 'Gradient', icon: '🌈' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 控制面板 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    参数设置
                  </h3>
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                  >
                    <Eye className="w-4 h-4" />
                    <span>{showPreview ? '隐藏' : '显示'}预览</span>
                  </button>
                </div>

                {/* Box Shadow 控制 */}
                {activeTab === 'shadow' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          水平偏移 ({boxShadow.horizontal}px)
                        </label>
                        <input
                          type="range"
                          min="-50"
                          max="50"
                          value={boxShadow.horizontal}
                          onChange={(e) => setBoxShadow({...boxShadow, horizontal: parseInt(e.target.value)})}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          垂直偏移 ({boxShadow.vertical}px)
                        </label>
                        <input
                          type="range"
                          min="-50"
                          max="50"
                          value={boxShadow.vertical}
                          onChange={(e) => setBoxShadow({...boxShadow, vertical: parseInt(e.target.value)})}
                          className="w-full"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          模糊半径 ({boxShadow.blur}px)
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="50"
                          value={boxShadow.blur}
                          onChange={(e) => setBoxShadow({...boxShadow, blur: parseInt(e.target.value)})}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          扩展半径 ({boxShadow.spread}px)
                        </label>
                        <input
                          type="range"
                          min="-20"
                          max="20"
                          value={boxShadow.spread}
                          onChange={(e) => setBoxShadow({...boxShadow, spread: parseInt(e.target.value)})}
                          className="w-full"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          阴影颜色
                        </label>
                        <input
                          type="color"
                          value={boxShadow.color}
                          onChange={(e) => setBoxShadow({...boxShadow, color: e.target.value})}
                          className="w-full h-10 rounded border border-gray-300 dark:border-gray-600"
                        />
                      </div>
                      <div className="flex items-end">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={boxShadow.inset}
                            onChange={(e) => setBoxShadow({...boxShadow, inset: e.target.checked})}
                            className="rounded border-gray-300 dark:border-gray-600"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">内阴影</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Border 控制 */}
                {activeTab === 'border' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          边框宽度 ({border.width}px)
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="20"
                          value={border.width}
                          onChange={(e) => setBorder({...border, width: parseInt(e.target.value)})}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          圆角半径 ({border.radius}px)
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="50"
                          value={border.radius}
                          onChange={(e) => setBorder({...border, radius: parseInt(e.target.value)})}
                          className="w-full"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          边框样式
                        </label>
                        <select
                          value={border.style}
                          onChange={(e) => setBorder({...border, style: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                          <option value="solid">实线</option>
                          <option value="dashed">虚线</option>
                          <option value="dotted">点线</option>
                          <option value="double">双线</option>
                          <option value="groove">凹槽</option>
                          <option value="ridge">山脊</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          边框颜色
                        </label>
                        <input
                          type="color"
                          value={border.color}
                          onChange={(e) => setBorder({...border, color: e.target.value})}
                          className="w-full h-10 rounded border border-gray-300 dark:border-gray-600"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Gradient 控制 */}
                {activeTab === 'gradient' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          渐变类型
                        </label>
                        <select
                          value={gradient.type}
                          onChange={(e) => setGradient({...gradient, type: e.target.value as 'linear' | 'radial'})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                          <option value="linear">线性渐变</option>
                          <option value="radial">径向渐变</option>
                        </select>
                      </div>
                      {gradient.type === 'linear' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            方向 ({gradient.direction}°)
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="360"
                            value={gradient.direction}
                            onChange={(e) => setGradient({...gradient, direction: parseInt(e.target.value)})}
                            className="w-full"
                          />
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        颜色停止点
                      </label>
                      {gradient.colors.map((color, index) => (
                        <div key={index} className="grid grid-cols-3 gap-2 items-center">
                          <input
                            type="color"
                            value={color.color}
                            onChange={(e) => {
                              const newColors = [...gradient.colors];
                              newColors[index].color = e.target.value;
                              setGradient({...gradient, colors: newColors});
                            }}
                            className="w-full h-8 rounded border border-gray-300 dark:border-gray-600"
                          />
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={color.position}
                            onChange={(e) => {
                              const newColors = [...gradient.colors];
                              newColors[index].position = parseInt(e.target.value);
                              setGradient({...gradient, colors: newColors});
                            }}
                            className="w-full"
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {color.position}%
                          </span>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          if (gradient.colors.length < 5) {
                            setGradient({
                              ...gradient,
                              colors: [...gradient.colors, { color: '#000000', position: 100 }]
                            });
                          }
                        }}
                        disabled={gradient.colors.length >= 5}
                        className="w-full px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        添加颜色
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 预览和代码 */}
              <div className="space-y-4">
                {showPreview && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      效果预览
                    </h3>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8">
                      <div style={getPreviewStyle()}>
                        预览效果
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      CSS 代码
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={copyCSS}
                        className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        <Copy className="w-4 h-4" />
                        <span>复制</span>
                      </button>
                      <button
                        onClick={downloadCSS}
                        className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        <Download className="w-4 h-4" />
                        <span>下载</span>
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre>{getCurrentCSS()}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            使用说明
          </h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>• <strong>Box Shadow:</strong> 调整阴影的偏移、模糊、扩展和颜色，支持内阴影效果</p>
            <p>• <strong>Border:</strong> 设置边框宽度、样式、颜色和圆角半径</p>
            <p>• <strong>Gradient:</strong> 创建线性或径向渐变，支持多个颜色停止点</p>
            <p>• 实时预览效果，一键复制或下载生成的CSS代码</p>
            <p>• 所有操作都在浏览器本地完成，无需上传任何数据</p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}