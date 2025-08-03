'use client';

import { useState, useEffect, useCallback } from 'react';
import { Download, RotateCcw, Copy } from 'lucide-react';
import QRCode from 'qrcode';
import { ToolLayout } from '@/components/tool-layout';
import { useToolTranslations } from '@/components/tool-translations';
import { useLanguage } from '@/components/language-provider';

export default function QRCodePage() {
  const [text, setText] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [size, setSize] = useState(256);
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [isGenerating, setIsGenerating] = useState(false);

  const { getToolTranslation, getUITranslation, getToolPageTranslation } = useToolTranslations();
  const { t } = useLanguage();
  const toolTranslation = getToolTranslation('utility-qr');
  const ui = getUITranslation();
  const pageTranslation = getToolPageTranslation('utility-qr');

  const generateQRCode = useCallback(async () => {
    if (!text) return;

    setIsGenerating(true);
    try {
      const url = await QRCode.toDataURL(text, {
        width: size,
        margin: 2,
        errorCorrectionLevel: errorLevel,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      setQrCodeUrl(url);
    } catch (error) {
      console.error('生成二维码失败:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [text, size, errorLevel]);

  const handleDownload = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = 'qrcode.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleCopy = async () => {
    if (qrCodeUrl && navigator.clipboard) {
      try {
        const response = await fetch(qrCodeUrl);
        const blob = await response.blob();
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob,
          }),
        ]);
      } catch (error) {
        console.error('复制失败:', error);
      }
    }
  };

  const handleClear = () => {
    setText('');
    setQrCodeUrl('');
  };

  const errorLevels = [
    { value: 'L', ...pageTranslation.errorLevels.low },
    { value: 'M', ...pageTranslation.errorLevels.medium },
    { value: 'Q', ...pageTranslation.errorLevels.high },
    { value: 'H', ...pageTranslation.errorLevels.highest },
  ];

  const sampleTexts = [
    { name: pageTranslation.sampleTexts.url, text: 'https://example.com' },
    { name: pageTranslation.sampleTexts.text, text: 'Hello World!' },
    { name: pageTranslation.sampleTexts.email, text: 'contact@example.com' },
    { name: pageTranslation.sampleTexts.phone, text: 'tel:+1234567890' },
    { name: pageTranslation.sampleTexts.wifi, text: 'WIFI:T:WPA;S:MyWiFi;P:password123;;' },
  ];

  useEffect(() => {
    if (text) {
      generateQRCode();
    }
  }, [text, size, errorLevel, generateQRCode]);

  return (
    <ToolLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {toolTranslation.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {toolTranslation.description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：输入和控制 */}
          <div className="space-y-6">
            <div>
              <label htmlFor="text" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {pageTranslation.inputContent}
              </label>
              <textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={ui.placeholders.enterContent}
                className="textarea w-full h-32"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {pageTranslation.qrCodeSize}
              </label>
              <input
                type="range"
                min="128"
                max="512"
                step="32"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>128px</span>
                <span>{size}px</span>
                <span>512px</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {pageTranslation.errorCorrectionLevel}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {errorLevels.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => setErrorLevel(level.value as any)}
                    className={`p-3 border rounded-lg text-left transition-colors ${
                      errorLevel === level.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600'
                    }`}
                  >
                    <div className="font-medium text-gray-900 dark:text-white">
                      {level.label}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {level.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {pageTranslation.quickInput}
              </label>
              <div className="flex flex-wrap gap-2">
                {sampleTexts.map((sample) => (
                  <button
                    key={sample.name}
                    onClick={() => setText(sample.text)}
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                  >
                    {sample.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleClear}
                className="btn btn-outline flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                {ui.buttons.clear}
              </button>
            </div>
          </div>

          {/* 右侧：二维码显示 */}
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {pageTranslation.generatedQrCode}
              </h3>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8">
                {qrCodeUrl ? (
                  <div className="space-y-4">
                    <img
                      src={qrCodeUrl}
                      alt={pageTranslation.generatedQrCode}
                      className="mx-auto"
                      style={{ width: size, height: size }}
                    />
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {ui.labels.size}: {size}px × {size}px
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <span className="text-gray-400">QR</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      {ui.messages.processing}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {qrCodeUrl && (
              <div className="flex gap-2 justify-center">
                <button
                  onClick={handleDownload}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  {ui.buttons.download}
                </button>
                <button
                  onClick={handleCopy}
                  className="btn btn-outline flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  {ui.buttons.copy}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {pageTranslation.instructions}
          </h3>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400">
            {pageTranslation.instructionSteps.map((step: string, index: number) => (
              <li key={index}>• {step}</li>
            ))}
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}
