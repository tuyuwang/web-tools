'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, Download, RotateCw, RotateCcw, Crop, Palette, 
  Sliders, RefreshCw, Eye, Settings, Scissors 
} from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';

interface FilterSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  sepia: number;
  grayscale: number;
  hueRotate: number;
}

export default function ImageEditorPage() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);
  const [activeTab, setActiveTab] = useState<'filters' | 'crop' | 'rotate'>('filters');
  
  const [filters, setFilters] = useState<FilterSettings>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    sepia: 0,
    grayscale: 0,
    hueRotate: 0,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setOriginalImage(imageUrl);
        setEditedImage(imageUrl);
        resetSettings();
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'],
    },
    multiple: false,
  });

  const resetSettings = () => {
    setRotation(0);
    setFlipHorizontal(false);
    setFlipVertical(false);
    setFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      sepia: 0,
      grayscale: 0,
      hueRotate: 0,
    });
  };

  const applyEdits = useCallback(async () => {
    if (!originalImage || !canvasRef.current) return;

    setIsProcessing(true);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        // 计算旋转后的画布尺寸
        const angle = (rotation * Math.PI) / 180;
        const sin = Math.abs(Math.sin(angle));
        const cos = Math.abs(Math.cos(angle));
        const newWidth = img.width * cos + img.height * sin;
        const newHeight = img.width * sin + img.height * cos;

        canvas.width = newWidth;
        canvas.height = newHeight;

        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 保存当前状态
        ctx.save();

        // 移动到画布中心
        ctx.translate(canvas.width / 2, canvas.height / 2);

        // 应用旋转
        ctx.rotate(angle);

        // 应用翻转
        ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1);

        // 应用滤镜
        const filterString = [
          `brightness(${filters.brightness}%)`,
          `contrast(${filters.contrast}%)`,
          `saturate(${filters.saturation}%)`,
          `blur(${filters.blur}px)`,
          `sepia(${filters.sepia}%)`,
          `grayscale(${filters.grayscale}%)`,
          `hue-rotate(${filters.hueRotate}deg)`,
        ].join(' ');
        
        ctx.filter = filterString;

        // 绘制图片
        ctx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);

        // 恢复状态
        ctx.restore();

        // 生成编辑后的图片URL
        const editedDataUrl = canvas.toDataURL('image/png');
        setEditedImage(editedDataUrl);
        setIsProcessing(false);
      };

      img.src = originalImage;
    } catch (error) {
      console.error('Error applying edits:', error);
      setIsProcessing(false);
    }
  }, [originalImage, rotation, flipHorizontal, flipVertical, filters]);

  useEffect(() => {
    if (originalImage) {
      applyEdits();
    }
  }, [originalImage, rotation, flipHorizontal, flipVertical, filters, applyEdits]);

  const handleFilterChange = (filterName: keyof FilterSettings, value: number) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      sepia: 0,
      grayscale: 0,
      hueRotate: 0,
    });
  };

  const rotateImage = (degrees: number) => {
    setRotation(prev => (prev + degrees) % 360);
  };

  const downloadImage = () => {
    if (editedImage) {
      const link = document.createElement('a');
      link.href = editedImage;
      link.download = 'edited-image.png';
      link.click();
    }
  };

  const resetImage = () => {
    setOriginalImage(null);
    setEditedImage(null);
    resetSettings();
  };

  const presets = {
    vintage: { brightness: 110, contrast: 120, saturation: 80, sepia: 30, blur: 0, grayscale: 0, hueRotate: 0 },
    bw: { brightness: 100, contrast: 110, saturation: 0, sepia: 0, blur: 0, grayscale: 100, hueRotate: 0 },
    warm: { brightness: 105, contrast: 105, saturation: 110, sepia: 10, blur: 0, grayscale: 0, hueRotate: 20 },
    cool: { brightness: 100, contrast: 100, saturation: 110, sepia: 0, blur: 0, grayscale: 0, hueRotate: 200 },
    dramatic: { brightness: 90, contrast: 140, saturation: 120, sepia: 0, blur: 0, grayscale: 0, hueRotate: 0 },
  };

  return (
    <ToolLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 标题 */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            在线图片编辑器
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            功能强大的图片编辑工具，支持滤镜、旋转、翻转等操作，完全客户端处理
          </p>
        </div>

        {!originalImage ? (
          /* 文件上传区域 */
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
              {isDragActive ? '松开鼠标上传图片' : '拖拽图片到这里开始编辑'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              支持PNG、JPG、JPEG、GIF、BMP、WebP格式
            </p>
          </div>
        ) : (
          /* 编辑界面 */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* 工具面板 */}
            <div className="lg:col-span-1 space-y-6">
              {/* 工具选项卡 */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => setActiveTab('filters')}
                    className={`p-3 rounded-lg flex items-center space-x-2 transition-colors ${
                      activeTab === 'filters'
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Sliders className="h-5 w-5" />
                    <span>滤镜</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('rotate')}
                    className={`p-3 rounded-lg flex items-center space-x-2 transition-colors ${
                      activeTab === 'rotate'
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <RotateCw className="h-5 w-5" />
                    <span>旋转翻转</span>
                  </button>
                </div>
              </div>

              {/* 滤镜面板 */}
              {activeTab === 'filters' && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">滤镜调整</h3>
                    <button
                      onClick={resetFilters}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm"
                    >
                      重置
                    </button>
                  </div>

                  {/* 预设滤镜 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      预设效果
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(presets).map(([name, preset]) => (
                        <button
                          key={name}
                          onClick={() => setFilters(preset)}
                          className="p-2 text-xs bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          {name === 'vintage' && '复古'}
                          {name === 'bw' && '黑白'}
                          {name === 'warm' && '暖色'}
                          {name === 'cool' && '冷色'}
                          {name === 'dramatic' && '戏剧'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 滤镜滑块 */}
                  {Object.entries(filters).map(([name, value]) => (
                    <div key={name}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {name === 'brightness' && '亮度'}
                        {name === 'contrast' && '对比度'}
                        {name === 'saturation' && '饱和度'}
                        {name === 'blur' && '模糊'}
                        {name === 'sepia' && '褐色调'}
                        {name === 'grayscale' && '灰度'}
                        {name === 'hueRotate' && '色相旋转'}
                        : {value}{name === 'blur' ? 'px' : name === 'hueRotate' ? '°' : '%'}
                      </label>
                      <input
                        type="range"
                        min={name === 'brightness' || name === 'contrast' || name === 'saturation' ? 0 : 0}
                        max={name === 'blur' ? 10 : name === 'hueRotate' ? 360 : name === 'brightness' || name === 'contrast' || name === 'saturation' ? 200 : 100}
                        value={value}
                        onChange={(e) => handleFilterChange(name as keyof FilterSettings, parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* 旋转翻转面板 */}
              {activeTab === 'rotate' && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 space-y-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">旋转和翻转</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        旋转
                      </label>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => rotateImage(-90)}
                          className="flex-1 btn btn-secondary text-sm"
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          -90°
                        </button>
                        <button
                          onClick={() => rotateImage(90)}
                          className="flex-1 btn btn-secondary text-sm"
                        >
                          <RotateCw className="h-4 w-4 mr-1" />
                          +90°
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        翻转
                      </label>
                      <div className="space-y-2">
                        <button
                          onClick={() => setFlipHorizontal(!flipHorizontal)}
                          className={`w-full btn text-sm ${
                            flipHorizontal ? 'btn-primary' : 'btn-outline'
                          }`}
                        >
                          水平翻转
                        </button>
                        <button
                          onClick={() => setFlipVertical(!flipVertical)}
                          className={`w-full btn text-sm ${
                            flipVertical ? 'btn-primary' : 'btn-outline'
                          }`}
                        >
                          垂直翻转
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 space-y-3">
                <button
                  onClick={downloadImage}
                  disabled={!editedImage}
                  className="w-full btn btn-primary disabled:opacity-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  下载图片
                </button>
                
                <button
                  onClick={resetImage}
                  className="w-full btn btn-outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  重新选择
                </button>
              </div>
            </div>

            {/* 图片预览区域 */}
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                    <Eye className="h-5 w-5 mr-2" />
                    图片预览
                  </h3>
                  {isProcessing && (
                    <div className="flex items-center text-blue-600 dark:text-blue-400">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
                      <span className="text-sm">处理中...</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 原图 */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">原图</h4>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 aspect-square flex items-center justify-center">
                      <img
                        src={originalImage}
                        alt="原图"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  </div>

                  {/* 编辑后 */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">编辑后</h4>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 aspect-square flex items-center justify-center">
                      {editedImage ? (
                        <img
                          src={editedImage}
                          alt="编辑后"
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <div className="text-gray-500 dark:text-gray-400">
                          编辑中...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 隐藏的canvas */}
        <canvas ref={canvasRef} className="hidden" />
        <canvas ref={originalCanvasRef} className="hidden" />

        {/* 使用说明 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">使用说明：</h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
            <li>• 支持常见图片格式：PNG、JPG、JPEG、GIF、BMP、WebP</li>
            <li>• 滤镜功能：调整亮度、对比度、饱和度、模糊等效果</li>
            <li>• 预设效果：复古、黑白、暖色、冷色、戏剧等一键应用</li>
            <li>• 旋转翻转：支持90度旋转和水平/垂直翻转</li>
            <li>• 实时预览：所有调整都会实时显示效果</li>
            <li>• 所有处理都在浏览器中进行，保护您的隐私</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}