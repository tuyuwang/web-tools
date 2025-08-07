'use client';

import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Download, Upload, Scissors, Settings, RefreshCw } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';

export default function BackgroundRemovePage() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [threshold, setThreshold] = useState(30);
  const [smoothing, setSmoothing] = useState(2);
  const [showSettings, setShowSettings] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setOriginalImage(e.target?.result as string);
        setProcessedImage(null);
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

  // 简单的背景移除算法 - 基于颜色相似度
  const removeBackground = async () => {
    if (!originalImage || !canvasRef.current) return;

    setIsProcessing(true);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // 获取四个角落的颜色作为背景色参考
        const corners = [
          [0, 0], // 左上
          [canvas.width - 1, 0], // 右上
          [0, canvas.height - 1], // 左下
          [canvas.width - 1, canvas.height - 1], // 右下
        ];

        const backgroundColors: number[][] = [];
        corners.forEach(([x, y]) => {
          const index = (y * canvas.width + x) * 4;
          backgroundColors.push([
            data[index],     // R
            data[index + 1], // G
            data[index + 2], // B
          ]);
        });

        // 计算平均背景色
        const avgBgColor = [
          Math.round(backgroundColors.reduce((sum, color) => sum + color[0], 0) / backgroundColors.length),
          Math.round(backgroundColors.reduce((sum, color) => sum + color[1], 0) / backgroundColors.length),
          Math.round(backgroundColors.reduce((sum, color) => sum + color[2], 0) / backgroundColors.length),
        ];

        // 移除背景
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // 计算与背景色的距离
          const distance = Math.sqrt(
            Math.pow(r - avgBgColor[0], 2) +
            Math.pow(g - avgBgColor[1], 2) +
            Math.pow(b - avgBgColor[2], 2)
          );

          // 如果颜色与背景色相似，设为透明
          if (distance < threshold) {
            data[i + 3] = 0; // 设置alpha为0 (透明)
          } else if (distance < threshold + smoothing) {
            // 边缘平滑处理
            const alpha = ((distance - threshold) / smoothing) * 255;
            data[i + 3] = Math.min(255, Math.max(0, alpha));
          }
        }

        ctx.putImageData(imageData, 0, 0);
        
        // 转换为PNG格式以保持透明度
        const processedDataUrl = canvas.toDataURL('image/png');
        setProcessedImage(processedDataUrl);
        setIsProcessing(false);
      };

      img.src = originalImage;
    } catch (error) {
      console.error('Error processing image:', error);
      setIsProcessing(false);
    }
  };

  const downloadImage = () => {
    if (processedImage) {
      const link = document.createElement('a');
      link.href = processedImage;
      link.download = 'background-removed.png';
      link.click();
    }
  };

  const resetImage = () => {
    setOriginalImage(null);
    setProcessedImage(null);
  };

  return (
    <ToolLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* 标题 */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            背景移除工具
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            智能移除图片背景，适用于纯色背景图片，完全客户端处理
          </p>
        </div>

        {/* 设置面板 */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">处理设置</h3>
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
                  检测阈值: {threshold}
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={threshold}
                  onChange={(e) => setThreshold(parseInt(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  值越小，检测越精确
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  边缘平滑: {smoothing}
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={smoothing}
                  onChange={(e) => setSmoothing(parseInt(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  值越大，边缘越平滑
                </p>
              </div>
            </div>
          )}
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
              {isDragActive ? '松开鼠标上传图片' : '拖拽图片到这里'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              支持PNG、JPG、JPEG、GIF、BMP、WebP格式，建议使用纯色背景图片
            </p>
          </div>
        ) : (
          /* 图片处理区域 */
          <div className="space-y-6">
            {/* 图片对比 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 原图 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">原图</h3>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                  <img
                    src={originalImage}
                    alt="原图"
                    className="w-full h-auto max-h-96 object-contain mx-auto"
                  />
                </div>
              </div>

              {/* 处理结果 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">处理结果</h3>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4" style={{
                  backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                }}>
                  {processedImage ? (
                    <img
                      src={processedImage}
                      alt="处理结果"
                      className="w-full h-auto max-h-96 object-contain mx-auto"
                    />
                  ) : (
                    <div className="h-96 flex items-center justify-center text-gray-500">
                      处理后的图片将在这里显示
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={removeBackground}
                disabled={isProcessing}
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    处理中...
                  </>
                ) : (
                  <>
                    <Scissors className="h-4 w-4 mr-2" />
                    移除背景
                  </>
                )}
              </button>

              {processedImage && (
                <button
                  onClick={downloadImage}
                  className="btn btn-secondary"
                >
                  <Download className="h-4 w-4 mr-2" />
                  下载PNG
                </button>
              )}

              <button
                onClick={resetImage}
                className="btn btn-outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                重新选择
              </button>
            </div>
          </div>
        )}

        {/* 隐藏的canvas用于图片处理 */}
        <canvas ref={canvasRef} className="hidden" />

        {/* 使用说明 */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-3">使用说明：</h4>
          <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-2">
            <li>• 本工具适用于<strong>纯色背景</strong>的图片，效果最佳</li>
            <li>• 算法基于四个角落的颜色来判断背景色</li>
            <li>• 可调整检测阈值和边缘平滑参数以获得最佳效果</li>
            <li>• 处理后的图片会自动转换为PNG格式以保持透明背景</li>
            <li>• 所有处理都在浏览器中进行，保护您的隐私</li>
            <li>• 对于复杂背景，建议使用专业的AI背景移除工具</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}