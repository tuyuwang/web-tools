'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument, PageSizes } from 'pdf-lib';
import { Download, Image as ImageIcon, X, ArrowUp, ArrowDown, Trash2, Upload, Settings } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';

interface ImageFile {
  id: string;
  file: File;
  name: string;
  preview: string;
  width: number;
  height: number;
}

export default function ImagesToPDFPage() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState<'fit' | 'a4' | 'letter'>('fit');
  const [quality, setQuality] = useState(0.8);
  const [showSettings, setShowSettings] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const imageFiles: ImageFile[] = [];
    
    for (const file of acceptedFiles) {
      if (file.type.startsWith('image/')) {
        const preview = URL.createObjectURL(file);
        
        // 获取图片尺寸
        const img = new Image();
        img.src = preview;
        
        await new Promise((resolve) => {
          img.onload = () => {
            imageFiles.push({
              id: Math.random().toString(36).substr(2, 9),
              file,
              name: file.name,
              preview,
              width: img.width,
              height: img.height,
            });
            resolve(void 0);
          };
        });
      }
    }
    
    setImages(prev => [...prev, ...imageFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'],
    },
    multiple: true,
  });

  const removeImage = (id: string) => {
    const image = images.find(img => img.id === id);
    if (image) {
      URL.revokeObjectURL(image.preview);
    }
    setImages(images.filter(img => img.id !== id));
    
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  };

  const moveImage = (id: string, direction: 'up' | 'down') => {
    const index = images.findIndex(img => img.id === id);
    if (index === -1) return;
    
    const newImages = [...images];
    if (direction === 'up' && index > 0) {
      [newImages[index], newImages[index - 1]] = [newImages[index - 1], newImages[index]];
    } else if (direction === 'down' && index < images.length - 1) {
      [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
    }
    
    setImages(newImages);
  };

  const imageToBytes = async (imageFile: ImageFile): Promise<Uint8Array> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        canvas.toBlob(async (blob) => {
          if (blob) {
            const arrayBuffer = await blob.arrayBuffer();
            resolve(new Uint8Array(arrayBuffer));
          } else {
            reject(new Error('Failed to convert image to blob'));
          }
        }, 'image/jpeg', quality);
      };
      
      img.onerror = reject;
      img.src = imageFile.preview;
    });
  };

  const createPDF = async () => {
    if (images.length === 0) return;
    
    setIsProcessing(true);
    
    try {
      const pdfDoc = await PDFDocument.create();
      
      for (const imageFile of images) {
        const imageBytes = await imageToBytes(imageFile);
        let image;
        
        if (imageFile.file.type === 'image/png') {
          image = await pdfDoc.embedPng(imageBytes);
        } else {
          image = await pdfDoc.embedJpg(imageBytes);
        }
        
        const imageDims = image.scale(1);
        let pageWidth, pageHeight;
        
        if (pageSize === 'fit') {
          pageWidth = imageDims.width;
          pageHeight = imageDims.height;
        } else if (pageSize === 'a4') {
          pageWidth = PageSizes.A4[0];
          pageHeight = PageSizes.A4[1];
        } else {
          pageWidth = PageSizes.Letter[0];
          pageHeight = PageSizes.Letter[1];
        }
        
        const page = pdfDoc.addPage([pageWidth, pageHeight]);
        
        // 计算图片在页面中的位置和大小
        let drawWidth = imageDims.width;
        let drawHeight = imageDims.height;
        
        if (pageSize !== 'fit') {
          const scaleX = pageWidth / imageDims.width;
          const scaleY = pageHeight / imageDims.height;
          const scale = Math.min(scaleX, scaleY);
          
          drawWidth = imageDims.width * scale;
          drawHeight = imageDims.height * scale;
        }
        
        const x = (pageWidth - drawWidth) / 2;
        const y = (pageHeight - drawHeight) / 2;
        
        page.drawImage(image, {
          x,
          y,
          width: drawWidth,
          height: drawHeight,
        });
      }
      
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
      
      setPdfUrl(url);
    } catch (error) {
      console.error('Error creating PDF:', error);
      alert('创建PDF时出错，请检查图片文件是否有效。');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadPDF = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = 'images-to-pdf.pdf';
      link.click();
    }
  };

  const clearAll = () => {
    images.forEach(img => URL.revokeObjectURL(img.preview));
    setImages([]);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  };

  return (
    <ToolLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* 标题 */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            图片转PDF工具
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            将多张图片合并成一个PDF文件，支持多种图片格式，完全客户端处理
          </p>
        </div>

        {/* 设置面板 */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">转换设置</h3>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
          
          {showSettings && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  页面尺寸
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="fit">适应图片尺寸</option>
                  <option value="a4">A4页面</option>
                  <option value="letter">Letter页面</option>
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
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* 文件上传区域 */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {isDragActive ? '松开鼠标上传图片' : '拖拽图片到这里'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            支持PNG、JPG、JPEG、GIF、BMP、WebP格式
          </p>
        </div>

        {/* 图片预览 */}
        {images.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                已选择的图片 ({images.length}张)
              </h3>
              <button
                onClick={clearAll}
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
              >
                清空所有
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div
                  key={image.id}
                  className="relative bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
                >
                  <img
                    src={image.preview}
                    alt={image.name}
                    className="w-full h-40 object-cover"
                  />
                  
                  <div className="p-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {image.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {image.width} × {image.height}
                    </p>
                  </div>
                  
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <button
                      onClick={() => moveImage(image.id, 'up')}
                      disabled={index === 0}
                      className="p-1 bg-black bg-opacity-50 text-white rounded disabled:opacity-30"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => moveImage(image.id, 'down')}
                      disabled={index === images.length - 1}
                      className="p-1 bg-black bg-opacity-50 text-white rounded disabled:opacity-30"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => removeImage(image.id)}
                      className="p-1 bg-red-500 bg-opacity-80 text-white rounded hover:bg-opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  
                  <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
            
            {/* 创建PDF按钮 */}
            <div className="flex justify-center">
              <button
                onClick={createPDF}
                disabled={images.length === 0 || isProcessing}
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    创建中...
                  </>
                ) : (
                  `创建PDF (${images.length}张图片)`
                )}
              </button>
            </div>
          </div>
        )}

        {/* 下载区域 */}
        {pdfUrl && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
            <div className="text-green-600 dark:text-green-400 mb-4">
              <ImageIcon className="h-12 w-12 mx-auto mb-2" />
              <p className="text-lg font-semibold">PDF创建完成！</p>
            </div>
            <button
              onClick={downloadPDF}
              className="btn btn-primary"
            >
              <Download className="h-4 w-4 mr-2" />
              下载PDF文件
            </button>
          </div>
        )}

        {/* 使用说明 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">使用说明：</h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
            <li>• 支持PNG、JPG、JPEG、GIF、BMP、WebP等常见图片格式</li>
            <li>• 可以调整图片顺序，图片将按顺序添加到PDF中</li>
            <li>• 可选择页面尺寸：适应图片、A4或Letter</li>
            <li>• 可调整图片质量以控制PDF文件大小</li>
            <li>• 所有处理都在浏览器中进行，保护您的隐私</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}