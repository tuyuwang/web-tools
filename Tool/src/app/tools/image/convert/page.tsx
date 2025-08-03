'use client';

import { useState, useRef } from 'react';
import { Upload, Download, RotateCcw } from 'lucide-react';
import { useToolTranslations } from '@/components/tool-translations';

export default function ImageConvertPage() {
  const { getToolTranslation } = useToolTranslations();
  const toolTranslation = getToolTranslation('image-convert');
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string>('');
  const [convertedUrl, setConvertedUrl] = useState<string>('');
  const [isConverting, setIsConverting] = useState(false);
  const [quality, setQuality] = useState(0.8);
  const [format, setFormat] = useState('image/jpeg');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formats = [
    { value: 'image/jpeg', label: 'JPEG' },
    { value: 'image/png', label: 'PNG' },
    { value: 'image/webp', label: 'WebP' },
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setOriginalImage(file);
      setOriginalUrl(URL.createObjectURL(file));
      setConvertedUrl('');
    }
  };

  const convertImage = () => {
    if (!originalImage) return;

    setIsConverting(true);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setConvertedUrl(url);
          }
          setIsConverting(false);
        },
        format,
        quality
      );
    };

    img.src = originalUrl;
  };

  const downloadImage = () => {
    if (convertedUrl) {
      const link = document.createElement('a');
      link.href = convertedUrl;
      link.download = `converted.${format.split('/')[1]}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const clearAll = () => {
    setOriginalImage(null);
    setOriginalUrl('');
    setConvertedUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {toolTranslation.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {toolTranslation.description}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 输入区域 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              选择图片
            </h2>
            <button
              onClick={clearAll}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-colors"
            >
              清空
            </button>
          </div>

          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {!originalImage ? (
              <div className="space-y-4">
                <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  选择图片文件
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <img
                  src={originalUrl}
                  alt="原始图片"
                  className="max-w-full h-auto rounded-lg mx-auto"
                />
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>文件名: {originalImage.name}</p>
                  <p>大小: {(originalImage.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 输出区域 */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            转换结果
          </h2>

          {convertedUrl ? (
            <div className="space-y-4">
              <img
                src={convertedUrl}
                alt="转换后的图片"
                className="max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700"
              />
              <button
                onClick={downloadImage}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Download className="h-5 w-5" />
                <span>下载转换后的图片</span>
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                转换后的图片将显示在这里
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 转换设置 */}
      {originalImage && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            转换设置
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                目标格式
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {formats.map((fmt) => (
                  <option key={fmt.value} value={fmt.value}>
                    {fmt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                图片质量: {Math.round(quality * 100)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={convertImage}
              disabled={isConverting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {isConverting ? (
                <RotateCcw className="h-5 w-5 animate-spin" />
              ) : (
                <Upload className="h-5 w-5" />
              )}
              <span>{isConverting ? '转换中...' : '开始转换'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 