'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, Download, RotateCcw, Image as ImageIcon, Settings } from 'lucide-react';

interface ResizeSettings {
  width: number;
  height: number;
  maintainAspectRatio: boolean;
  quality: number;
  format: 'jpeg' | 'png' | 'webp';
}

export default function ImageResizePage() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resizedImage, setResizedImage] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [settings, setSettings] = useState<ResizeSettings>({
    width: 800,
    height: 600,
    maintainAspectRatio: true,
    quality: 0.8,
    format: 'jpeg',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setOriginalImage(result);
        setResizedImage(null);
        
        // 获取原始尺寸
        const img = new Image();
        img.onload = () => {
          setOriginalDimensions({ width: img.width, height: img.height });
          if (settings.maintainAspectRatio) {
            const aspectRatio = img.width / img.height;
            setSettings(prev => ({
              ...prev,
              width: img.width,
              height: Math.round(img.width / aspectRatio),
            }));
          }
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    }
  };

  const resizeImage = useCallback(() => {
    if (!originalImage || !canvasRef.current) return;

    setIsProcessing(true);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // 计算新尺寸
      let newWidth = settings.width;
      let newHeight = settings.height;

      if (settings.maintainAspectRatio) {
        const aspectRatio = img.width / img.height;
        if (newWidth > newHeight) {
          newHeight = Math.round(newWidth / aspectRatio);
        } else {
          newWidth = Math.round(newHeight * aspectRatio);
        }
      }

      // 设置画布尺寸
      canvas.width = newWidth;
      canvas.height = newHeight;

      // 绘制调整后的图片
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      // 转换为图片URL
      const mimeType = `image/${settings.format}`;
      const resizedImageUrl = canvas.toDataURL(mimeType, settings.quality);
      setResizedImage(resizedImageUrl);
      setIsProcessing(false);
    };

    img.src = originalImage;
  }, [originalImage, settings]);

  const downloadImage = () => {
    if (!resizedImage) return;

    const link = document.createElement('a');
    link.href = resizedImage;
    link.download = `resized-image.${settings.format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearAll = () => {
    setOriginalImage(null);
    setResizedImage(null);
    setOriginalDimensions(null);
    setSettings({
      width: 800,
      height: 600,
      maintainAspectRatio: true,
      quality: 0.8,
      format: 'jpeg',
    });
  };

  const handleWidthChange = (value: number) => {
    setSettings(prev => {
      const newSettings = { ...prev, width: value };
      if (prev.maintainAspectRatio && originalDimensions) {
        const aspectRatio = originalDimensions.width / originalDimensions.height;
        newSettings.height = Math.round(value / aspectRatio);
      }
      return newSettings;
    });
  };

  const handleHeightChange = (value: number) => {
    setSettings(prev => {
      const newSettings = { ...prev, height: value };
      if (prev.maintainAspectRatio && originalDimensions) {
        const aspectRatio = originalDimensions.width / originalDimensions.height;
        newSettings.width = Math.round(value * aspectRatio);
      }
      return newSettings;
    });
  };

  const presetSizes = [
    { name: '小尺寸', width: 400, height: 300 },
    { name: '中等尺寸', width: 800, height: 600 },
    { name: '大尺寸', width: 1200, height: 900 },
    { name: '高清', width: 1920, height: 1080 },
    { name: '正方形', width: 512, height: 512 },
    { name: '手机尺寸', width: 375, height: 667 },
  ];

  const formatOptions = [
    { value: 'jpeg', label: 'JPEG', description: '适合照片，文件较小' },
    { value: 'png', label: 'PNG', description: '支持透明，文件较大' },
    { value: 'webp', label: 'WebP', description: '现代格式，压缩率高' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          图片尺寸调整工具
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          调整图片尺寸，支持保持比例、批量处理等功能
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 图片上传和设置 */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              上传图片
            </h2>

            <div className="space-y-4">
              <label className="block">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 dark:hover:border-blue-500 transition-colors cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    点击上传图片或拖拽到此处
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    支持 JPG、PNG、WebP 格式
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {originalDimensions && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                    原始尺寸
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {originalDimensions.width} × {originalDimensions.height} 像素
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 尺寸设置 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              尺寸设置
            </h2>

            <div className="space-y-4">
              {/* 保持比例 */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="maintainAspectRatio"
                  checked={settings.maintainAspectRatio}
                  onChange={(e) => setSettings({ ...settings, maintainAspectRatio: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="maintainAspectRatio" className="text-sm text-gray-700 dark:text-gray-300">
                  保持宽高比
                </label>
              </div>

              {/* 宽度 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  宽度: {settings.width}px
                </label>
                <input
                  type="range"
                  min="50"
                  max="3000"
                  value={settings.width}
                  onChange={(e) => handleWidthChange(parseInt(e.target.value))}
                  className="w-full"
                />
                <input
                  type="number"
                  value={settings.width}
                  onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                  className="w-full mt-2 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                />
              </div>

              {/* 高度 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  高度: {settings.height}px
                </label>
                <input
                  type="range"
                  min="50"
                  max="3000"
                  value={settings.height}
                  onChange={(e) => handleHeightChange(parseInt(e.target.value))}
                  className="w-full"
                />
                <input
                  type="number"
                  value={settings.height}
                  onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                  className="w-full mt-2 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                />
              </div>

              {/* 质量设置 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  质量: {Math.round(settings.quality * 100)}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={settings.quality}
                  onChange={(e) => setSettings({ ...settings, quality: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>

              {/* 格式选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  输出格式
                </label>
                <select
                  value={settings.format}
                  onChange={(e) => setSettings({ ...settings, format: e.target.value as any })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  {formatOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} - {option.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* 操作按钮 */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={resizeImage}
                  disabled={!originalImage || isProcessing}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Settings className="w-4 h-4" />
                  )}
                  {isProcessing ? '处理中...' : '调整尺寸'}
                </button>
                <button
                  onClick={clearAll}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  清空
                </button>
              </div>
            </div>
          </div>

          {/* 预设尺寸 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              预设尺寸
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {presetSizes.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSettings(prev => ({
                      ...prev,
                      width: preset.width,
                      height: preset.height,
                    }));
                  }}
                  className="p-3 text-left bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {preset.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {preset.width} × {preset.height}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 结果预览 */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                处理结果
              </h2>
              {resizedImage && (
                <button
                  onClick={downloadImage}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  下载图片
                </button>
              )}
            </div>

            {resizedImage ? (
              <div className="space-y-4">
                <img
                  src={resizedImage}
                  alt="调整尺寸后的图片"
                  className="w-full max-h-96 object-contain rounded-lg border border-gray-200 dark:border-gray-600"
                />
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>新尺寸: {settings.width} × {settings.height} 像素</p>
                  <p>格式: {settings.format.toUpperCase()}</p>
                  <p>质量: {Math.round(settings.quality * 100)}%</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>上传图片并设置尺寸参数后，点击"调整尺寸"查看结果</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 隐藏的canvas用于处理图片 */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
} 