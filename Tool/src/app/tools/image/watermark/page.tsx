'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, Download, RotateCcw, Type, Image as ImageIcon } from 'lucide-react';

interface WatermarkSettings {
  text: string;
  fontSize: number;
  color: string;
  opacity: number;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  rotation: number;
}

export default function WatermarkPage() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [watermarkedImage, setWatermarkedImage] = useState<string | null>(null);
  const [settings, setSettings] = useState<WatermarkSettings>({
    text: '水印文字',
    fontSize: 24,
    color: '#000000',
    opacity: 0.5,
    position: 'bottom-right',
    rotation: 0,
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
        setWatermarkedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const applyWatermark = useCallback(() => {
    if (!originalImage || !canvasRef.current) return;

    setIsProcessing(true);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // 设置画布尺寸
      canvas.width = img.width;
      canvas.height = img.height;

      // 绘制原始图片
      ctx.drawImage(img, 0, 0);

      // 设置水印样式
      ctx.font = `${settings.fontSize}px Arial`;
      ctx.fillStyle = settings.color;
      ctx.globalAlpha = settings.opacity;

      // 计算水印位置
      const textMetrics = ctx.measureText(settings.text);
      const textWidth = textMetrics.width;
      const textHeight = settings.fontSize;

      let x = 0;
      let y = 0;

      switch (settings.position) {
        case 'top-left':
          x = 20;
          y = textHeight + 20;
          break;
        case 'top-right':
          x = canvas.width - textWidth - 20;
          y = textHeight + 20;
          break;
        case 'bottom-left':
          x = 20;
          y = canvas.height - 20;
          break;
        case 'bottom-right':
          x = canvas.width - textWidth - 20;
          y = canvas.height - 20;
          break;
        case 'center':
          x = (canvas.width - textWidth) / 2;
          y = (canvas.height + textHeight) / 2;
          break;
      }

      // 应用旋转
      if (settings.rotation !== 0) {
        ctx.save();
        ctx.translate(x + textWidth / 2, y - textHeight / 2);
        ctx.rotate((settings.rotation * Math.PI) / 180);
        ctx.fillText(settings.text, -textWidth / 2, textHeight / 2);
        ctx.restore();
      } else {
        ctx.fillText(settings.text, x, y);
      }

      // 转换为图片URL
      const watermarkedImageUrl = canvas.toDataURL('image/png');
      setWatermarkedImage(watermarkedImageUrl);
      setIsProcessing(false);
    };

    img.src = originalImage;
  }, [originalImage, settings]);

  const downloadImage = () => {
    if (!watermarkedImage) return;

    const link = document.createElement('a');
    link.href = watermarkedImage;
    link.download = 'watermarked-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearAll = () => {
    setOriginalImage(null);
    setWatermarkedImage(null);
    setSettings({
      text: '水印文字',
      fontSize: 24,
      color: '#000000',
      opacity: 0.5,
      position: 'bottom-right',
      rotation: 0,
    });
  };

  const positionOptions = [
    { value: 'top-left', label: '左上角' },
    { value: 'top-right', label: '右上角' },
    { value: 'bottom-left', label: '左下角' },
    { value: 'bottom-right', label: '右下角' },
    { value: 'center', label: '居中' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          水印添加工具
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          为图片添加文字水印，支持自定义位置、颜色、透明度等
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 图片上传区域 */}
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

              {originalImage && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    原始图片
                  </h3>
                  <img
                    src={originalImage}
                    alt="原始图片"
                    className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 水印设置 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              水印设置
            </h2>

            <div className="space-y-4">
              {/* 水印文字 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  水印文字
                </label>
                <input
                  type="text"
                  value={settings.text}
                  onChange={(e) => setSettings({ ...settings, text: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 字体大小 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  字体大小: {settings.fontSize}px
                </label>
                <input
                  type="range"
                  min="12"
                  max="72"
                  value={settings.fontSize}
                  onChange={(e) => setSettings({ ...settings, fontSize: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              {/* 颜色选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  文字颜色
                </label>
                <input
                  type="color"
                  value={settings.color}
                  onChange={(e) => setSettings({ ...settings, color: e.target.value })}
                  className="w-full h-10 rounded-lg cursor-pointer"
                />
              </div>

              {/* 透明度 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  透明度: {Math.round(settings.opacity * 100)}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={settings.opacity}
                  onChange={(e) => setSettings({ ...settings, opacity: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>

              {/* 位置选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  水印位置
                </label>
                <select
                  value={settings.position}
                  onChange={(e) => setSettings({ ...settings, position: e.target.value as any })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  {positionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 旋转角度 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  旋转角度: {settings.rotation}°
                </label>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={settings.rotation}
                  onChange={(e) => setSettings({ ...settings, rotation: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              {/* 操作按钮 */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={applyWatermark}
                  disabled={!originalImage || isProcessing}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Type className="w-4 h-4" />
                  )}
                  {isProcessing ? '处理中...' : '应用水印'}
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
        </div>

        {/* 结果预览 */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                处理结果
              </h2>
              {watermarkedImage && (
                <button
                  onClick={downloadImage}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  下载图片
                </button>
              )}
            </div>

            {watermarkedImage ? (
              <div className="space-y-4">
                <img
                  src={watermarkedImage}
                  alt="添加水印后的图片"
                  className="w-full max-h-96 object-contain rounded-lg border border-gray-200 dark:border-gray-600"
                />
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>图片尺寸: {canvasRef.current?.width} × {canvasRef.current?.height}</p>
                  <p>格式: PNG</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>上传图片并设置水印参数后，点击"应用水印"查看结果</p>
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