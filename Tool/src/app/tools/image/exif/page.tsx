'use client'

import { useRef, useState } from 'react';
import exifr from 'exifr';
import { Upload, Info, Download, Eraser, Image as ImageIcon } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';

export default function ExifToolPage() {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [metadata, setMetadata] = useState<Record<string, any> | null>(null);
  const [cleanUrl, setCleanUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const f = event.target.files?.[0];
    if (!f) return;
    setFile(f);
    const url = URL.createObjectURL(f);
    setImageUrl(url);
    setCleanUrl('');
    setMetadata(null);

    try {
      setIsProcessing(true);
      const meta = await exifr.parse(f).catch(() => null);
      setMetadata(meta || {});
    } finally {
      setIsProcessing(false);
    }
  };

  const stripMetadata = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const img = new Image();
      const url = imageUrl || URL.createObjectURL(file);
      await new Promise((resolve, reject) => {
        img.onload = () => resolve(true);
        img.onerror = reject;
        img.src = url;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 不受支持');
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const clean = URL.createObjectURL(blob);
        setCleanUrl(clean);
      }, 'image/jpeg', 0.92);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadClean = () => {
    if (!cleanUrl || !file) return;
    const a = document.createElement('a');
    a.href = cleanUrl;
    a.download = file.name.replace(/\.[^/.]+$/, '') + '_no-exif.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <ToolLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-2">
            <Info className="h-7 w-7 text-blue-600" />
            图片EXIF查看与清除
          </h1>
          <p className="text-gray-600 dark:text-gray-400">读取真实EXIF元数据，并通过重新编码去除隐私信息</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleSelect}
                className="hidden"
              />
              {!file ? (
                <div className="space-y-4">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    选择图片
                  </button>
                  <p className="text-xs text-gray-500 dark:text-gray-400">支持 JPEG/PNG/WebP 等常见格式</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <img src={imageUrl} alt="原图" className="max-w-full max-h-64 object-contain rounded-lg mx-auto" />
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <div><strong>文件名:</strong> {file.name}</div>
                    <div><strong>大小:</strong> {(file.size / 1024 / 1024).toFixed(2)} MB</div>
                    <div><strong>类型:</strong> {file.type}</div>
                  </div>
                </div>
              )}
            </div>

            {file && (
              <button
                onClick={stripMetadata}
                disabled={isProcessing}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Eraser className="h-5 w-5" /> {isProcessing ? '处理中...' : '清除EXIF(重新编码)'}
              </button>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">EXIF 元数据</h3>
              <div className="max-h-80 overflow-auto text-sm bg-gray-50 dark:bg-gray-900 rounded p-4">
                {isProcessing && <div className="text-gray-500">读取中...</div>}
                {!isProcessing && !metadata && <div className="text-gray-500">选择图片后显示</div>}
                {metadata && Object.keys(metadata).length === 0 && (
                  <div className="text-gray-500">未检测到EXIF元数据</div>
                )}
                {metadata && Object.keys(metadata).length > 0 && (
                  <pre className="whitespace-pre-wrap text-gray-900 dark:text-gray-100">{JSON.stringify(metadata, null, 2)}</pre>
                )}
              </div>
            </div>

            {cleanUrl && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" /> 已清除EXIF的图片
                </h3>
                <img src={cleanUrl} alt="无EXIF图" className="max-w-full max-h-64 object-contain rounded-lg mx-auto" />
                <div className="mt-4">
                  <button onClick={downloadClean} className="btn btn-primary flex items-center gap-2">
                    <Download className="h-4 w-4" /> 下载JPEG
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">说明</h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• 仅在本地读取与处理，不上传服务器</li>
            <li>• 清除EXIF通过Canvas重新编码生成新文件</li>
            <li>• 某些格式可能不含EXIF或读取有限</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}