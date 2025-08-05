'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Download, RotateCcw, Image as ImageIcon, Settings, Plus, X, FileImage, Zap } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';
import { useToolTranslations } from '@/components/tool-translations';
import { useLanguage } from '@/components/language-provider';

interface ResizeSettings {
  width: number;
  height: number;
  maintainAspectRatio: boolean;
  quality: number;
  format: 'jpeg' | 'png' | 'webp';
}

interface ImageFile {
  id: string;
  file: File;
  originalUrl: string;
  processedUrl?: string;
  originalDimensions: { width: number; height: number };
  processedDimensions?: { width: number; height: number };
  originalSize: number;
  processedSize?: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
}

export default function ImageResizePage() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [settings, setSettings] = useState<ResizeSettings>({
    width: 800,
    height: 600,
    maintainAspectRatio: true,
    quality: 0.8,
    format: 'jpeg',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { getToolTranslation, getUITranslation } = useToolTranslations();
  const { t } = useLanguage();
  const toolTranslation = getToolTranslation('image-resize') || {};
  const ui = getUITranslation();

  // 拖拽处理
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    handleFiles(files);
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []).filter(file => 
      file.type.startsWith('image/')
    );
    handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    const newImages: ImageFile[] = [];
    
    for (const file of files) {
      const imageFile: ImageFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        file,
        originalUrl: URL.createObjectURL(file),
        originalSize: file.size,
        originalDimensions: { width: 0, height: 0 },
        status: 'pending'
      };

      // 获取原始尺寸
      const img = new Image();
      img.onload = () => {
        imageFile.originalDimensions = { width: img.width, height: img.height };
        if (settings.maintainAspectRatio && images.length === 0 && newImages.length === 1) {
          const aspectRatio = img.width / img.height;
          setSettings(prev => ({
            ...prev,
            width: img.width,
            height: Math.round(img.width / aspectRatio),
          }));
        }
      };
      img.src = imageFile.originalUrl;
      
      newImages.push(imageFile);
    }

    setImages(prev => [...prev, ...newImages]);
    setIsBatchMode(files.length > 1 || images.length > 0);
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const updated = prev.filter(img => img.id !== id);
      if (updated.length <= 1) {
        setIsBatchMode(false);
      }
      return updated;
    });
  };

  const processImage = useCallback(async (imageFile: ImageFile): Promise<ImageFile> => {
    return new Promise((resolve) => {
      if (!canvasRef.current) {
        resolve({ ...imageFile, status: 'error', error: 'Canvas not available' });
        return;
      }

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve({ ...imageFile, status: 'error', error: 'Canvas context not available' });
        return;
      }

      const img = new Image();
      img.onload = () => {
        try {
          // 计算新尺寸
          let newWidth = settings.width;
          let newHeight = settings.height;

          if (settings.maintainAspectRatio) {
            const aspectRatio = img.width / img.height;
            if (newWidth / newHeight > aspectRatio) {
              newWidth = Math.round(newHeight * aspectRatio);
            } else {
              newHeight = Math.round(newWidth / aspectRatio);
            }
          }

          // 设置画布尺寸
          canvas.width = newWidth;
          canvas.height = newHeight;

          // 绘制调整后的图片
          ctx.drawImage(img, 0, 0, newWidth, newHeight);

          // 转换为图片URL
          const mimeType = `image/${settings.format}`;
          canvas.toBlob((blob) => {
            if (blob) {
              const processedUrl = URL.createObjectURL(blob);
              resolve({
                ...imageFile,
                processedUrl,
                processedDimensions: { width: newWidth, height: newHeight },
                processedSize: blob.size,
                status: 'completed'
              });
            } else {
              resolve({ ...imageFile, status: 'error', error: 'Failed to create blob' });
            }
          }, mimeType, settings.quality);
        } catch (error) {
          resolve({ ...imageFile, status: 'error', error: 'Processing failed' });
        }
      };

      img.onerror = () => {
        resolve({ ...imageFile, status: 'error', error: 'Failed to load image' });
      };

      img.src = imageFile.originalUrl;
    });
  }, [settings]);

  const processAllImages = async () => {
    setIsProcessing(true);
    
    // 更新所有图片状态为处理中
    setImages(prev => prev.map(img => ({ ...img, status: 'processing' as const })));

    // 批量处理图片
    const processedImages: ImageFile[] = [];
    for (const imageFile of images) {
      const processed = await processImage(imageFile);
      processedImages.push(processed);
      
      // 实时更新处理进度
      setImages(prev => prev.map(img => 
        img.id === processed.id ? processed : img
      ));
    }

    setIsProcessing(false);
  };

  const processSingleImage = async () => {
    if (images.length === 0) return;
    
    setIsProcessing(true);
    const imageFile = images[0];
    
    setImages(prev => prev.map(img => 
      img.id === imageFile.id ? { ...img, status: 'processing' } : img
    ));

    const processed = await processImage(imageFile);
    
    setImages(prev => prev.map(img => 
      img.id === processed.id ? processed : img
    ));
    
    setIsProcessing(false);
  };

  const downloadImage = (imageFile: ImageFile) => {
    if (!imageFile.processedUrl) return;

    const link = document.createElement('a');
    link.href = imageFile.processedUrl;
    link.download = `resized-${imageFile.file.name.split('.')[0]}.${settings.format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllImages = async () => {
    const completedImages = images.filter(img => img.processedUrl);
    
    if (completedImages.length === 1) {
      downloadImage(completedImages[0]);
      return;
    }

    // 批量下载 - 创建ZIP文件（简化版本，实际项目中应使用JSZip）
    for (const imageFile of completedImages) {
      downloadImage(imageFile);
      // 添加延迟避免浏览器阻止多个下载
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  };

  const clearAll = () => {
    images.forEach(img => {
      URL.revokeObjectURL(img.originalUrl);
      if (img.processedUrl) {
        URL.revokeObjectURL(img.processedUrl);
      }
    });
    setImages([]);
    setIsBatchMode(false);
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
      if (prev.maintainAspectRatio && images.length > 0) {
        const firstImage = images[0];
        if (firstImage.originalDimensions.width > 0) {
          const aspectRatio = firstImage.originalDimensions.width / firstImage.originalDimensions.height;
          newSettings.height = Math.round(value / aspectRatio);
        }
      }
      return newSettings;
    });
  };

  const handleHeightChange = (value: number) => {
    setSettings(prev => {
      const newSettings = { ...prev, height: value };
      if (prev.maintainAspectRatio && images.length > 0) {
        const firstImage = images[0];
        if (firstImage.originalDimensions.height > 0) {
          const aspectRatio = firstImage.originalDimensions.width / firstImage.originalDimensions.height;
          newSettings.width = Math.round(value * aspectRatio);
        }
      }
      return newSettings;
    });
  };

  const presetSizes = [
    { name: '小尺寸', width: 400, height: 300 },
    { name: '中等尺寸', width: 800, height: 600 },
    { name: '大尺寸', width: 1200, height: 900 },
    { name: '高清', width: 1920, height: 1080 },
    { name: '4K', width: 3840, height: 2160 },
    { name: '正方形小', width: 256, height: 256 },
    { name: '正方形中', width: 512, height: 512 },
    { name: '正方形大', width: 1024, height: 1024 },
    { name: '手机竖屏', width: 375, height: 667 },
    { name: '手机横屏', width: 667, height: 375 },
    { name: '平板', width: 768, height: 1024 },
    { name: '桌面', width: 1366, height: 768 },
  ];

  const formatOptions = [
    { value: 'jpeg', label: 'JPEG', description: '适合照片，文件较小', extension: '.jpg' },
    { value: 'png', label: 'PNG', description: '支持透明，文件较大', extension: '.png' },
    { value: 'webp', label: 'WebP', description: '现代格式，压缩率高', extension: '.webp' },
  ];

  const compressionPresets = [
    { name: '高质量', quality: 0.95, description: '最佳质量，文件较大' },
    { name: '标准', quality: 0.8, description: '质量与大小平衡' },
    { name: '压缩', quality: 0.6, description: '较小文件，质量降低' },
    { name: '高压缩', quality: 0.4, description: '最小文件，质量较差' },
  ];

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCompressionRatio = (original: number, processed: number) => {
    if (original === 0) return 0;
    return ((original - processed) / original * 100).toFixed(1);
  };

  return (
    <ToolLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            图片尺寸调整工具
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            支持批量处理、格式转换、压缩优化等功能
          </p>
        </div>

        {/* 上传区域 */}
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Upload className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                拖拽图片到此处或点击上传
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                支持 JPG、PNG、WebP 格式，可同时上传多张图片
              </p>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                选择图片
              </button>
            </div>
          </div>
        </div>

        {/* 图片列表 */}
        {images.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                图片列表 ({images.length})
              </h2>
              <div className="flex gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="batchMode"
                    checked={isBatchMode}
                    onChange={(e) => setIsBatchMode(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="batchMode" className="text-sm text-gray-700 dark:text-gray-300">
                    批量模式
                  </label>
                </div>
                <button
                  onClick={clearAll}
                  className="btn bg-red-600 hover:bg-red-700 text-white text-sm"
                >
                  <X className="w-4 h-4 mr-1" />
                  清空全部
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((imageFile) => (
                <div key={imageFile.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="aspect-video bg-gray-100 dark:bg-gray-700 relative">
                    <img
                      src={imageFile.processedUrl || imageFile.originalUrl}
                      alt={imageFile.file.name}
                      className="w-full h-full object-contain"
                    />
                    
                    {imageFile.status === 'processing' && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="text-white text-sm">处理中...</div>
                      </div>
                    )}
                    
                    {imageFile.status === 'error' && (
                      <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                        <div className="text-red-600 text-sm text-center p-2">
                          处理失败<br/>{imageFile.error}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => removeImage(imageFile.id)}
                      className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="font-medium text-gray-900 dark:text-white truncate">
                      {imageFile.file.name}
                    </div>
                    
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <div>原始: {imageFile.originalDimensions.width} × {imageFile.originalDimensions.height}</div>
                      <div>大小: {formatFileSize(imageFile.originalSize)}</div>
                      
                      {imageFile.processedDimensions && imageFile.processedSize && (
                        <>
                          <div>处理后: {imageFile.processedDimensions.width} × {imageFile.processedDimensions.height}</div>
                          <div>新大小: {formatFileSize(imageFile.processedSize)}</div>
                          <div className="text-green-600 dark:text-green-400">
                            压缩: {getCompressionRatio(imageFile.originalSize, imageFile.processedSize)}%
                          </div>
                        </>
                      )}
                    </div>

                    {imageFile.status === 'completed' && imageFile.processedUrl && (
                      <button
                        onClick={() => downloadImage(imageFile)}
                        className="w-full btn bg-green-600 hover:bg-green-700 text-white text-sm"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        下载
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 设置面板 */}
        {images.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 尺寸设置 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
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
                    max="4000"
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
                    max="4000"
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

                {/* 预设尺寸 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    预设尺寸
                  </label>
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
                        className="p-2 text-left bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm"
                      >
                        <div className="font-medium text-gray-700 dark:text-gray-300">
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
            </div>

            {/* 格式和质量设置 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FileImage className="w-5 h-5 mr-2" />
                格式与质量
              </h2>

              <div className="space-y-4">
                {/* 格式选择 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    输出格式
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {formatOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSettings({ ...settings, format: option.value as any })}
                        className={`p-3 border rounded-lg text-left transition-colors ${
                          settings.format === option.value
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <div className="font-medium text-gray-900 dark:text-white">
                          {option.label}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {option.description}
                        </div>
                      </button>
                    ))}
                  </div>
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
                  
                  {/* 质量预设 */}
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {compressionPresets.map((preset, index) => (
                      <button
                        key={index}
                        onClick={() => setSettings({ ...settings, quality: preset.quality })}
                        className={`p-2 text-left rounded-lg transition-colors text-sm ${
                          Math.abs(settings.quality - preset.quality) < 0.05
                            ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700'
                            : 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600'
                        }`}
                      >
                        <div className="font-medium text-gray-700 dark:text-gray-300">
                          {preset.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {preset.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={isBatchMode ? processAllImages : processSingleImage}
              disabled={isProcessing}
              className="btn bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Zap className="w-4 h-4 mr-2" />
              )}
              {isProcessing ? '处理中...' : (isBatchMode ? '批量处理' : '处理图片')}
            </button>

            {images.some(img => img.status === 'completed') && (
              <button
                onClick={downloadAllImages}
                className="btn bg-green-600 hover:bg-green-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                下载{isBatchMode ? '全部' : '图片'}
              </button>
            )}

            <button
              onClick={clearAll}
              className="btn bg-gray-600 hover:bg-gray-700 text-white"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              重置
            </button>
          </div>
        )}

        {/* 使用说明 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">
            使用说明
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">基本功能</h4>
              <ul className="space-y-1 text-blue-700 dark:text-blue-300 text-sm">
                <li>• 支持拖拽上传和批量处理</li>
                <li>• 智能保持图片宽高比</li>
                <li>• 实时预览处理效果</li>
                <li>• 多种预设尺寸快速选择</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">高级功能</h4>
              <ul className="space-y-1 text-blue-700 dark:text-blue-300 text-sm">
                <li>• 格式转换 (JPEG/PNG/WebP)</li>
                <li>• 质量压缩和优化</li>
                <li>• 文件大小对比分析</li>
                <li>• 批量下载处理结果</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 隐藏的canvas用于处理图片 */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </ToolLayout>
  );
} 