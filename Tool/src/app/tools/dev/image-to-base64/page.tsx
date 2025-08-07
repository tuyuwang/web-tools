'use client';

import { ToolLayout } from '@/components/tool-layout';
import { useState, useCallback, useRef } from 'react';
import { Upload, Copy, Download, Image as ImageIcon, FileText, Eye, Trash2 } from 'lucide-react';

interface ImageData {
  file: File;
  dataUrl: string;
  base64: string;
  size: number;
  type: string;
  dimensions?: { width: number; height: number };
}

export default function ImageToBase64Page() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const processFile = async (file: File): Promise<ImageData> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        const base64 = dataUrl.split(',')[1];
        const dimensions = await getImageDimensions(file);
        
        resolve({
          file,
          dataUrl,
          base64,
          size: file.size,
          type: file.type,
          dimensions,
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = async (files: FileList) => {
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      alert('请选择图片文件');
      return;
    }

    const newImages = await Promise.all(imageFiles.map(processFile));
    setImages(prev => [...prev, ...newImages]);
    
    if (!selectedImage && newImages.length > 0) {
      setSelectedImage(newImages[0]);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const downloadBase64 = (imageData: ImageData) => {
    const element = document.createElement('a');
    const file = new Blob([imageData.base64], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${imageData.file.name.split('.')[0]}_base64.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    
    if (selectedImage === images[index]) {
      setSelectedImage(newImages[0] || null);
    }
  };

  const clearAll = () => {
    setImages([]);
    setSelectedImage(null);
  };

  const generateHtmlCode = (imageData: ImageData) => {
    return `<img src="${imageData.dataUrl}" alt="${imageData.file.name}" />`;
  };

  const generateCssCode = (imageData: ImageData) => {
    return `.background-image {
  background-image: url('${imageData.dataUrl}');
  background-size: cover;
  background-position: center;
}`;
  };

  const generateReactCode = (imageData: ImageData) => {
    return `const imageData = "${imageData.dataUrl}";

function MyComponent() {
  return (
    <img 
      src={imageData} 
      alt="${imageData.file.name}"
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  );
}`;
  };

  return (
    <ToolLayout>
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          图片转Base64编码
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          将图片转换为Base64编码，便于在网页中嵌入使用
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 上传区域 */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              上传图片
            </h2>
            
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Upload className="w-12 h-12 text-gray-400" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    点击或拖拽图片到此处
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    支持 JPG、PNG、GIF、WEBP 等格式
                  </p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  选择文件
                </button>
              </div>
            </div>
          </div>

          {/* 图片列表 */}
          {images.length > 0 && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  已上传图片 ({images.length})
                </h3>
                <button
                  onClick={clearAll}
                  className="flex items-center gap-1 px-3 py-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  清空
                </button>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {images.map((imageData, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedImage === imageData
                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                        : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                    onClick={() => setSelectedImage(imageData)}
                  >
                    <img
                      src={imageData.dataUrl}
                      alt={imageData.file.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {imageData.file.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(imageData.size)}
                        {imageData.dimensions && 
                          ` • ${imageData.dimensions.width}×${imageData.dimensions.height}`
                        }
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(index);
                      }}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 预览和代码区域 */}
        <div className="lg:col-span-2 space-y-6">
          {selectedImage ? (
            <>
              {/* 图片预览 */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    图片预览
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedImage.file.name}
                    </span>
                  </div>
                </div>
                
                <div className="text-center">
                  <img
                    src={selectedImage.dataUrl}
                    alt={selectedImage.file.name}
                    className="max-w-full max-h-64 mx-auto rounded-lg border border-gray-200 dark:border-gray-600"
                  />
                  <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                    <div>文件大小: {formatFileSize(selectedImage.size)}</div>
                    {selectedImage.dimensions && (
                      <div>尺寸: {selectedImage.dimensions.width} × {selectedImage.dimensions.height}</div>
                    )}
                    <div>类型: {selectedImage.type}</div>
                    <div>Base64长度: {selectedImage.base64.length.toLocaleString()} 字符</div>
                  </div>
                </div>
              </div>

              {/* Base64编码 */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Base64编码
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(selectedImage.base64, 'base64')}
                      className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                      复制Base64
                    </button>
                    <button
                      onClick={() => downloadBase64(selectedImage)}
                      className="flex items-center gap-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      下载
                    </button>
                  </div>
                </div>
                
                <textarea
                  readOnly
                  value={selectedImage.base64}
                  className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-xs resize-none"
                />
              </div>

              {/* 代码示例 */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  代码示例
                </h2>
                
                <div className="space-y-4">
                  {/* HTML */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        HTML
                      </label>
                      <button
                        onClick={() => copyToClipboard(generateHtmlCode(selectedImage), 'html')}
                        className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <Copy className="w-3 h-3" />
                        复制
                      </button>
                    </div>
                    <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
                      <code>{generateHtmlCode(selectedImage)}</code>
                    </pre>
                  </div>

                  {/* CSS */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        CSS
                      </label>
                      <button
                        onClick={() => copyToClipboard(generateCssCode(selectedImage), 'css')}
                        className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <Copy className="w-3 h-3" />
                        复制
                      </button>
                    </div>
                    <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
                      <code>{generateCssCode(selectedImage)}</code>
                    </pre>
                  </div>

                  {/* React */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        React
                      </label>
                      <button
                        onClick={() => copyToClipboard(generateReactCode(selectedImage), 'react')}
                        className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <Copy className="w-3 h-3" />
                        复制
                      </button>
                    </div>
                    <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
                      <code>{generateReactCode(selectedImage)}</code>
                    </pre>
                  </div>
                </div>

                {copied && (
                  <div className="mt-4 p-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg text-sm">
                    {copied} 代码已复制到剪贴板
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-center py-12">
                <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  请选择图片
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  上传图片后，您可以在这里查看预览和获取Base64编码
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 使用说明 */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          使用说明
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">优点：</h4>
            <ul className="space-y-1">
              <li>• 减少HTTP请求</li>
              <li>• 图片与代码一体化</li>
              <li>• 不依赖外部资源</li>
              <li>• 适合小图标和logo</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">注意事项：</h4>
            <ul className="space-y-1">
              <li>• 文件大小会增加约33%</li>
              <li>• 不适合大图片</li>
              <li>• 无法被浏览器缓存</li>
              <li>• 建议小于100KB的图片使用</li>
            </ul>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}