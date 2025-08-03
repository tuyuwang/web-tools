'use client';

import { useState, useRef } from 'react';
import { Upload, Download, RotateCcw, Image as ImageIcon } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';

export default function ImageCompressPage() {
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [compressedImage, setCompressedImage] = useState<string | null>(null);
  const [quality, setQuality] = useState(80);
  const [isCompressing, setIsCompressing] = useState(false);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setOriginalImage(file);
      setOriginalSize(file.size);
      setCompressedImage(null);
      setCompressedSize(0);
    }
  };

  const compressImage = () => {
    if (!originalImage) return;

    setIsCompressing(true);
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
            setCompressedImage(url);
            setCompressedSize(blob.size);
          }
          setIsCompressing(false);
        },
        'image/jpeg',
        quality / 100
      );
    };

    img.src = URL.createObjectURL(originalImage);
  };

  const downloadImage = () => {
    if (compressedImage) {
      const link = document.createElement('a');
      link.href = compressedImage;
      link.download = `compressed_${originalImage?.name || 'image.jpg'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const clearAll = () => {
    setOriginalImage(null);
    setCompressedImage(null);
    setOriginalSize(0);
    setCompressedSize(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const compressionRatio = originalSize > 0 ? ((originalSize - compressedSize) / originalSize * 100).toFixed(1) : 0;

  return (
    <ToolLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            图片压缩工具
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            压缩图片文件大小，保持图片质量
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：上传和设置 */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                上传图片
              </h2>
              
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center space-y-4"
                >
                  <Upload className="w-12 h-12 text-gray-400" />
                  <div>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      点击上传图片
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      支持 JPG、PNG、GIF 等格式
                    </p>
                  </div>
                </button>
              </div>

              {originalImage && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <ImageIcon className="w-8 h-8 text-blue-500" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {originalImage.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        原始大小: {formatFileSize(originalSize)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 压缩设置 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                压缩设置
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    图片质量: {quality}%
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>10%</span>
                    <span>100%</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={compressImage}
                    disabled={!originalImage || isCompressing}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    {isCompressing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        压缩中...
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-4 h-4" />
                        开始压缩
                      </>
                    )}
                  </button>
                  <button
                    onClick={clearAll}
                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    清空
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：结果展示 */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                压缩结果
              </h2>
              
              {compressedImage ? (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                    <img
                      src={compressedImage}
                      alt="压缩后的图片"
                      className="w-full h-auto max-h-64 object-contain"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">原始大小:</span>
                      <span className="font-medium">{formatFileSize(originalSize)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">压缩后大小:</span>
                      <span className="font-medium">{formatFileSize(compressedSize)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">压缩比例:</span>
                      <span className="font-medium text-green-600">{compressionRatio}%</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={downloadImage}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    下载压缩图片
                  </button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    压缩后的图片将显示在这里
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">
            使用说明
          </h3>
          <ul className="space-y-2 text-blue-700 dark:text-blue-300">
            <li>• 点击上传区域选择要压缩的图片</li>
            <li>• 调整图片质量滑块，数值越低压缩率越高</li>
            <li>• 点击"开始压缩"按钮进行压缩</li>
            <li>• 查看压缩结果和文件大小对比</li>
            <li>• 点击"下载压缩图片"保存结果</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}
