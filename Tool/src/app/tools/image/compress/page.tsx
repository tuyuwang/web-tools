'use client';

import { useState, useRef } from 'react';
import { Upload, Download, RotateCcw, Image as ImageIcon } from 'lucide-react';

export default function ImageCompressPage() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [quality, setQuality] = useState(80);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setOriginalFile(file);
      setOriginalSize(file.size);
      setCompressedFile(null);
      setCompressedSize(0);
    }
  };

  const compressImage = () => {
    if (!originalFile) return;

    setIsCompressing(true);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // 计算新的尺寸，保持宽高比
      const maxWidth = 1920;
      const maxHeight = 1080;
      let { width, height } = img;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], originalFile.name, {
                type: 'image/jpeg',
              });
              setCompressedFile(compressedFile);
              setCompressedSize(blob.size);
            }
            setIsCompressing(false);
          },
          'image/jpeg',
          quality / 100
        );
      }
    };

    img.src = URL.createObjectURL(originalFile);
  };

  const handleDownload = () => {
    if (compressedFile) {
      const url = URL.createObjectURL(compressedFile);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compressed_${compressedFile.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleClear = () => {
    setOriginalFile(null);
    setCompressedFile(null);
    setOriginalSize(0);
    setCompressedSize(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const compressionRatio = originalSize > 0 ? ((originalSize - compressedSize) / originalSize * 100).toFixed(1) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          图片压缩工具
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          在线压缩图片，减小文件大小，保持图片质量
        </p>
      </div>

      {/* 质量控制 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border">
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            压缩质量: {quality}%
          </label>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {quality >= 80 ? '高质量' : quality >= 60 ? '中等质量' : '低质量'}
          </span>
        </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 左侧：原始图片 */}
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              原始图片
            </h3>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              {originalFile ? (
                <div className="space-y-4">
                  <img
                    src={URL.createObjectURL(originalFile)}
                    alt="原始图片"
                    className="max-w-full max-h-64 mx-auto rounded"
                  />
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    文件大小: {formatBytes(originalSize)}
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    点击选择图片或拖拽到此处
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="btn btn-primary"
                  >
                    选择图片
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 右侧：压缩后图片 */}
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              压缩后图片
            </h3>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8">
              {compressedFile ? (
                <div className="space-y-4">
                  <img
                    src={URL.createObjectURL(compressedFile)}
                    alt="压缩后图片"
                    className="max-w-full max-h-64 mx-auto rounded"
                  />
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    文件大小: {formatBytes(compressedSize)}
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">
                    压缩率: {compressionRatio}%
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    压缩后的图片将显示在这里
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={compressImage}
          disabled={!originalFile || isCompressing}
          className="btn btn-primary flex items-center gap-2"
        >
          {isCompressing ? '压缩中...' : '开始压缩'}
        </button>
        <button
          onClick={handleDownload}
          disabled={!compressedFile}
          className="btn btn-primary flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          下载压缩图片
        </button>
        <button
          onClick={handleClear}
          className="btn btn-outline flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          清空
        </button>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          使用说明
        </h3>
        <ul className="space-y-2 text-gray-600 dark:text-gray-400">
          <li>• 点击"选择图片"按钮上传要压缩的图片</li>
          <li>• 调整压缩质量滑块来控制压缩程度</li>
          <li>• 点击"开始压缩"按钮进行图片压缩</li>
          <li>• 压缩完成后可以预览和下载压缩后的图片</li>
          <li>• 支持JPG、PNG、WebP等常见图片格式</li>
        </ul>
      </div>
    </div>
  );
}

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
