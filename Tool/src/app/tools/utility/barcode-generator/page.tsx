'use client'

import { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import { Download, Copy, RotateCcw, Hash, Settings } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';

export default function BarcodeGeneratorPage() {
  const [text, setText] = useState('123456789012');
  const [format, setFormat] = useState<'CODE128' | 'EAN13' | 'EAN8' | 'UPC' | 'ITF' | 'MSI' | 'CODE39'>('CODE128');
  const [width, setWidth] = useState(2);
  const [height, setHeight] = useState(100);
  const [displayValue, setDisplayValue] = useState(true);
  const [background, setBackground] = useState('#ffffff');
  const [lineColor, setLineColor] = useState('#000000');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !text) return;
    try {
      JsBarcode(canvasRef.current, text, {
        format,
        width,
        height,
        displayValue,
        background,
        lineColor,
        margin: 10,
      });
    } catch (e) {
      // ignore invalid content for chosen symbology
    }
  }, [text, format, width, height, displayValue, background, lineColor]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'barcode.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopy = async () => {
    if (!canvasRef.current || !('clipboard' in navigator)) return;
    canvasRef.current.toBlob(async (blob) => {
      if (!blob) return;
      try {
        await (navigator as any).clipboard.write([
          new window.ClipboardItem({ [blob.type]: blob })
        ]);
      } catch {}
    });
  };

  const handleReset = () => {
    setText('123456789012');
    setFormat('CODE128');
    setWidth(2);
    setHeight(100);
    setDisplayValue(true);
    setBackground('#ffffff');
    setLineColor('#000000');
  };

  return (
    <ToolLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-2">
            <Hash className="h-7 w-7 text-blue-600" />
            条形码生成器
          </h1>
          <p className="text-gray-600 dark:text-gray-400">基于 JsBarcode 的真实条形码渲染，支持多种制式与下载复制</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">内容</label>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="输入要编码的内容"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">制式</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as any)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="CODE128">CODE128</option>
                  <option value="EAN13">EAN-13</option>
                  <option value="EAN8">EAN-8</option>
                  <option value="UPC">UPC</option>
                  <option value="ITF">ITF</option>
                  <option value="MSI">MSI</option>
                  <option value="CODE39">CODE39</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">显示文字</label>
                <select
                  value={String(displayValue)}
                  onChange={(e) => setDisplayValue(e.target.value === 'true')}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="true">是</option>
                  <option value="false">否</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">线宽</label>
                <input
                  type="range"
                  min={1}
                  max={4}
                  value={width}
                  onChange={(e) => setWidth(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">高度</label>
                <input
                  type="range"
                  min={50}
                  max={200}
                  value={height}
                  onChange={(e) => setHeight(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">背景色</label>
                <input type="color" value={background} onChange={(e) => setBackground(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">线条颜色</label>
                <input type="color" value={lineColor} onChange={(e) => setLineColor(e.target.value)} />
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={handleReset} className="btn btn-outline flex items-center gap-2">
                <RotateCcw className="h-4 w-4" /> 重置
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Settings className="h-4 w-4" /> 预览
            </div>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <canvas ref={canvasRef} className="mx-auto max-w-full" />
            </div>
            <div className="flex gap-2 justify-center">
              <button onClick={handleDownload} className="btn btn-primary flex items-center gap-2">
                <Download className="h-4 w-4" /> 下载PNG
              </button>
              <button onClick={handleCopy} className="btn btn-outline flex items-center gap-2">
                <Copy className="h-4 w-4" /> 复制到剪贴板
              </button>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">使用说明</h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• 输入内容并选择条形码制式</li>
            <li>• 可调整线宽、高度、显示文字与颜色</li>
            <li>• 支持下载PNG或复制到剪贴板</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}