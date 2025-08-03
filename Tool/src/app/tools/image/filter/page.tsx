'use client';

import { ToolLayout } from '@/components/tool-layout';
import { useState, useRef, useCallback } from 'react';
import { Upload, Download, RotateCcw, Image as ImageIcon } from 'lucide-react';

interface FilterOption {
  name: string;
  value: string;
  description: string;
}

export default function ImageFilterPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('none');
  const [filterIntensity, setFilterIntensity] = useState(100);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const filterOptions: FilterOption[] = [
    { name: '原图', value: 'none', description: '无滤镜效果' },
    { name: '黑白', value: 'grayscale', description: '转换为黑白效果' },
    { name: '复古', value: 'vintage', description: '复古怀旧效果' },
    { name: '冷色调', value: 'cool', description: '冷色调效果' },
    { name: '暖色调', value: 'warm', description: '暖色调效果' },
    { name: '高对比度', value: 'high-contrast', description: '增强对比度' },
    { name: '模糊', value: 'blur', description: '模糊效果' },
    { name: '锐化', value: 'sharpen', description: '锐化效果' },
    { name: '负片', value: 'invert', description: '负片效果' },
    { name: '霓虹', value: 'neon', description: '霓虹灯效果' },
  ];

  const getFilterStyle = (filterValue: string, intensity: number) => {
    const normalizedIntensity = intensity / 100;
    
    switch (filterValue) {
      case 'grayscale':
        return `grayscale(${normalizedIntensity})`;
      case 'vintage':
        return `sepia(${normalizedIntensity * 0.8}) contrast(${1 + normalizedIntensity * 0.2}) brightness(${1 - normalizedIntensity * 0.1})`;
      case 'cool':
        return `hue-rotate(${normalizedIntensity * 180}deg) saturate(${1 + normalizedIntensity * 0.2})`;
      case 'warm':
        return `sepia(${normalizedIntensity * 0.3}) saturate(${1 + normalizedIntensity * 0.3}) brightness(${1 + normalizedIntensity * 0.1})`;
      case 'high-contrast':
        return `contrast(${1 + normalizedIntensity * 0.5}) brightness(${1 + normalizedIntensity * 0.1})`;
      case 'blur':
        return `blur(${normalizedIntensity * 3}px)`;
      case 'sharpen':
        return `contrast(${1 + normalizedIntensity * 0.3}) saturate(${1 + normalizedIntensity * 0.2})`;
      case 'invert':
        return `invert(${normalizedIntensity})`;
      case 'neon':
        return `brightness(${1 + normalizedIntensity * 0.3}) contrast(${1 + normalizedIntensity * 0.4}) saturate(${1 + normalizedIntensity * 0.5}) hue-rotate(${normalizedIntensity * 180}deg)`;
      default:
        return 'none';
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadImage = useCallback(() => {
    if (!canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = imageRef.current.naturalWidth;
    canvas.height = imageRef.current.naturalHeight;

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempCtx.drawImage(imageRef.current, 0, 0);

    const imageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    if (selectedFilter === 'grayscale') {
      for (let i = 0; i < data.length; i += 4) {
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        const intensity = filterIntensity / 100;
        data[i] = data[i] * (1 - intensity) + gray * intensity;
        data[i + 1] = data[i + 1] * (1 - intensity) + gray * intensity;
        data[i + 2] = data[i + 2] * (1 - intensity) + gray * intensity;
      }
    } else if (selectedFilter === 'invert') {
      const intensity = filterIntensity / 100;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = data[i] * (1 - intensity) + (255 - data[i]) * intensity;
        data[i + 1] = data[i + 1] * (1 - intensity) + (255 - data[i + 1]) * intensity;
        data[i + 2] = data[i + 2] * (1 - intensity) + (255 - data[i + 2]) * intensity;
      }
    }

    tempCtx.putImageData(imageData, 0, 0);
    ctx.drawImage(tempCanvas, 0, 0);

    const link = document.createElement('a');
    link.download = `filtered-image-${selectedFilter}.png`;
    link.href = canvas.toDataURL();
    link.click();
  }, [selectedFilter, filterIntensity]);

  const resetImage = () => {
    setSelectedFilter('none');
    setFilterIntensity(100);
  };

  return (
    <ToolLayout>
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          图片滤镜工具
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          为图片添加各种滤镜效果，包括黑白、复古、冷色调等
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              上传图片
            </h2>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    点击上传图片或拖拽到此处
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    支持 JPG、PNG、WebP 格式
                  </p>
                </label>
              </div>

              {selectedImage && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      滤镜效果
                    </h3>
                    <button
                      onClick={resetImage}
                      className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      重置
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {filterOptions.map((filter) => (
                      <button
                        key={filter.value}
                        onClick={() => setSelectedFilter(filter.value)}
                        className={`p-3 rounded-lg border transition-colors ${
                          selectedFilter === filter.value
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <div className="text-left">
                          <div className="font-medium text-gray-900 dark:text-white text-sm">
                            {filter.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {filter.description}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {selectedFilter !== 'none' && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        滤镜强度: {filterIntensity}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={filterIntensity}
                        onChange={(e) => setFilterIntensity(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                      />
                    </div>
                  )}

                  <button
                    onClick={downloadImage}
                    disabled={!selectedImage}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    下载处理后的图片
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              预览效果
            </h2>
            
            {selectedImage ? (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    ref={imageRef}
                    src={selectedImage}
                    alt="原图"
                    className="w-full h-auto rounded-lg"
                    style={{
                      filter: getFilterStyle(selectedFilter, filterIntensity),
                    }}
                  />
                </div>
                
                <canvas ref={canvasRef} className="hidden" />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                <ImageIcon className="h-16 w-16 mb-4 text-gray-300" />
                <p>请先上传图片</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
} 