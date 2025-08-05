'use client';

import { useState, useRef } from 'react';
import { Upload, Download, RotateCcw, AlertCircle, CheckCircle, Info } from 'lucide-react';
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
  const [error, setError] = useState<string>('');
  const [convertedSize, setConvertedSize] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 支持的格式 - 只包含浏览器真正支持的格式
  const formats = [
    { value: 'image/jpeg', label: 'JPEG', extension: 'jpg', description: '通用压缩格式，适合照片' },
    { value: 'image/png', label: 'PNG', extension: 'png', description: '无损压缩，支持透明度' },
    { value: 'image/webp', label: 'WebP', extension: 'webp', description: '现代高效格式，体积小' },
  ];

  // 检查格式兼容性
  const checkFormatSupport = (format: string): boolean => {
    const canvas = document.createElement('canvas');
    return canvas.toDataURL(format).indexOf(format) === 5;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setError('');
      
      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        setError('请选择有效的图片文件');
        return;
      }

      // 验证文件大小 (限制20MB)
      if (file.size > 20 * 1024 * 1024) {
        setError('文件大小不能超过20MB');
        return;
      }

      setOriginalImage(file);
      setOriginalUrl(URL.createObjectURL(file));
      setConvertedUrl('');
      setConvertedSize(0);
    }
  };

  const convertImage = async () => {
    if (!originalImage) return;

    setIsConverting(true);
    setError('');

    try {
      // 检查目标格式支持
      if (!checkFormatSupport(format)) {
        throw new Error(`当前浏览器不支持${format}格式的导出`);
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('无法创建Canvas上下文');
      }

      const img = new Image();

      await new Promise((resolve, reject) => {
        img.onload = () => {
          try {
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            
            // 清空画布
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // 如果转换为JPEG，设置白色背景（因为JPEG不支持透明度）
            if (format === 'image/jpeg') {
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            
            // 绘制图片
            ctx.drawImage(img, 0, 0);
            
            resolve(true);
          } catch (err) {
            reject(new Error('图片绘制失败'));
          }
        };

        img.onerror = () => reject(new Error('图片加载失败'));
        img.src = originalUrl;
      });

      // 转换为指定格式
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setConvertedUrl(url);
            setConvertedSize(blob.size);
          } else {
            setError('图片转换失败，请尝试其他格式');
          }
          setIsConverting(false);
        },
        format,
        format === 'image/jpeg' || format === 'image/webp' ? quality : undefined
      );

    } catch (err) {
      setError(err instanceof Error ? err.message : '转换过程中发生未知错误');
      setIsConverting(false);
    }
  };

  const downloadImage = () => {
    if (convertedUrl && originalImage) {
      const link = document.createElement('a');
      link.href = convertedUrl;
      const extension = formats.find(f => f.value === format)?.extension || 'jpg';
      const baseName = originalImage.name.replace(/\.[^/.]+$/, '');
      link.download = `${baseName}_converted.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const clearAll = () => {
    setOriginalImage(null);
    setOriginalUrl('');
    setConvertedUrl('');
    setConvertedSize(0);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const compressionRatio = originalImage && convertedSize ? 
    ((originalImage.size - convertedSize) / originalImage.size * 100).toFixed(1) : '0';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          图片格式转换工具
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          支持JPEG、PNG、WebP格式之间的真实转换
        </p>
        
        {/* 功能说明 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800 dark:text-blue-200 text-left">
              <p className="font-medium mb-1">真实转换功能说明：</p>
              <ul className="space-y-1 text-xs">
                <li>• 使用浏览器原生Canvas API进行真实格式转换</li>
                <li>• 支持质量调节（JPEG/WebP格式）</li>
                <li>• 所有处理在本地完成，不上传到服务器</li>
                <li>• 仅支持浏览器原生支持的格式</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

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
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  支持 JPEG、PNG、WebP、GIF、BMP 等格式<br/>
                  最大文件大小：20MB
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <img
                  src={originalUrl}
                  alt="原始图片"
                  className="max-w-full max-h-64 object-contain rounded-lg mx-auto"
                />
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p><strong>文件名:</strong> {originalImage.name}</p>
                  <p><strong>原始大小:</strong> {formatFileSize(originalImage.size)}</p>
                  <p><strong>原始格式:</strong> {originalImage.type}</p>
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
                className="max-w-full max-h-64 object-contain rounded-lg border border-gray-200 dark:border-gray-700 mx-auto"
              />
              
              {/* 转换结果信息 */}
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="text-green-800 dark:text-green-200 font-medium">转换成功</span>
                </div>
                <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                  <p><strong>新格式:</strong> {format}</p>
                  <p><strong>转换后大小:</strong> {formatFileSize(convertedSize)}</p>
                  {originalImage && (
                    <p><strong>大小变化:</strong> 
                      {convertedSize > originalImage.size ? (
                        <span className="text-red-600"> +{compressionRatio}% (增大)</span>
                      ) : convertedSize < originalImage.size ? (
                        <span className="text-green-600"> -{compressionRatio}% (减小)</span>
                      ) : (
                        <span> 无变化</span>
                      )}
                    </p>
                  )}
                </div>
              </div>
              
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
                    {fmt.label} - {fmt.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                图片质量: {Math.round(quality * 100)}%
                {format === 'image/png' && (
                  <span className="text-xs text-gray-500 ml-2">(PNG为无损格式，质量设置无效)</span>
                )}
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                disabled={format === 'image/png'}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider disabled:opacity-50"
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