'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { createWorker } from 'tesseract.js';
import { Download, Upload, ScanLine, Copy, Settings, Eye } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';

export default function OCRPage() {
  const [image, setImage] = useState<string | null>(null);
  const [recognizedText, setRecognizedText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [language, setLanguage] = useState('chi_sim+eng');
  const [showSettings, setShowSettings] = useState(false);
  const [confidence, setConfidence] = useState<number | null>(null);

  const languages = [
    { code: 'eng', name: '英语' },
    { code: 'chi_sim', name: '简体中文' },
    { code: 'chi_tra', name: '繁体中文' },
    { code: 'chi_sim+eng', name: '中英混合' },
    { code: 'jpn', name: '日语' },
    { code: 'kor', name: '韩语' },
    { code: 'fra', name: '法语' },
    { code: 'deu', name: '德语' },
    { code: 'spa', name: '西班牙语' },
    { code: 'rus', name: '俄语' },
    { code: 'ara', name: '阿拉伯语' },
  ];

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
        setRecognizedText('');
        setConfidence(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.tiff'],
    },
    multiple: false,
  });

  const performOCR = async () => {
    if (!image) return;

    setIsProcessing(true);
    setProgress(0);
    setRecognizedText('');
    setConfidence(null);

    try {
      const worker = await createWorker(language, 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      const { data: { text, confidence: conf } } = await worker.recognize(image);
      
      setRecognizedText(text.trim());
      setConfidence(Math.round(conf));
      
      await worker.terminate();
    } catch (error) {
      console.error('OCR Error:', error);
      alert('文字识别失败，请重试或更换图片。');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const copyToClipboard = async () => {
    if (recognizedText) {
      try {
        await navigator.clipboard.writeText(recognizedText);
        alert('文本已复制到剪贴板');
      } catch (error) {
        console.error('Copy failed:', error);
        // 降级方案
        const textArea = document.createElement('textarea');
        textArea.value = recognizedText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('文本已复制到剪贴板');
      }
    }
  };

  const downloadText = () => {
    if (recognizedText) {
      const blob = new Blob([recognizedText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'ocr-result.txt';
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const resetTool = () => {
    setImage(null);
    setRecognizedText('');
    setConfidence(null);
    setProgress(0);
  };

  return (
    <ToolLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* 标题 */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            OCR文字识别工具
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            从图片中识别和提取文字，支持多种语言，完全客户端处理
          </p>
        </div>

        {/* 设置面板 */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">识别设置</h3>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
          
          {showSettings && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                识别语言
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                disabled={isProcessing}
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                选择合适的语言可以提高识别准确度
              </p>
            </div>
          )}
        </div>

        {!image ? (
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
              {isDragActive ? '松开鼠标上传图片' : '拖拽包含文字的图片到这里'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              支持PNG、JPG、JPEG、GIF、BMP、WebP、TIFF格式
            </p>
          </div>
        ) : (
          /* 图片和结果区域 */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 图片预览 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  图片预览
                </h3>
                <button
                  onClick={resetTool}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm"
                >
                  重新选择
                </button>
              </div>
              
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                <img
                  src={image}
                  alt="待识别图片"
                  className="w-full h-auto max-h-96 object-contain mx-auto rounded"
                />
              </div>

              {/* 识别按钮 */}
              <div className="flex justify-center">
                <button
                  onClick={performOCR}
                  disabled={isProcessing}
                  className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      识别中... {progress}%
                    </>
                  ) : (
                    <>
                      <ScanLine className="h-4 w-4 mr-2" />
                      开始识别文字
                    </>
                  )}
                </button>
              </div>

              {/* 进度条 */}
              {isProcessing && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>

            {/* 识别结果 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  识别结果
                  {confidence !== null && (
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                      (置信度: {confidence}%)
                    </span>
                  )}
                </h3>
                
                {recognizedText && (
                  <div className="flex space-x-2">
                    <button
                      onClick={copyToClipboard}
                      className="btn btn-sm btn-secondary"
                      title="复制到剪贴板"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={downloadText}
                      className="btn btn-sm btn-secondary"
                      title="下载文本文件"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 min-h-96">
                {recognizedText ? (
                  <div className="space-y-4">
                    <textarea
                      value={recognizedText}
                      onChange={(e) => setRecognizedText(e.target.value)}
                      className="w-full h-80 p-3 border border-gray-300 dark:border-gray-600 rounded-md resize-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="识别的文字将显示在这里..."
                    />
                    
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      字符数: {recognizedText.length} | 行数: {recognizedText.split('\n').length}
                    </div>
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center text-gray-500 dark:text-gray-400">
                    {isProcessing ? '正在识别文字，请稍候...' : '识别的文字将显示在这里'}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">使用说明：</h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
            <li>• 支持识别图片中的文字，包括扫描文档、截图、照片等</li>
            <li>• 支持中文、英文、日文、韩文等多种语言识别</li>
            <li>• 图片清晰度越高，文字识别准确度越高</li>
            <li>• 可以编辑识别结果，然后复制或下载</li>
            <li>• 所有处理都在浏览器中进行，保护您的隐私</li>
            <li>• 首次使用某种语言需要下载识别模型，请耐心等待</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}