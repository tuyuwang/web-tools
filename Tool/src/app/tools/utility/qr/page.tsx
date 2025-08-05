'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Download, RotateCcw, Copy, Upload, Palette, Zap, Plus, X, Eye, Settings, BarChart } from 'lucide-react';
import QRCode from 'qrcode';
import { ToolLayout } from '@/components/tool-layout';
import { useToolTranslations } from '@/components/tool-translations';
import { useLanguage } from '@/components/language-provider';

interface QRCodeItem {
  id: string;
  text: string;
  url: string;
  style: QRStyle;
  timestamp: Date;
  downloadCount: number;
}

interface QRStyle {
  size: number;
  errorLevel: 'L' | 'M' | 'Q' | 'H';
  foregroundColor: string;
  backgroundColor: string;
  margin: number;
  logoUrl?: string;
  logoSize: number;
  cornerRadius: number;
  dotStyle: 'square' | 'dots' | 'rounded';
}

interface QRTemplate {
  name: string;
  description: string;
  style: Partial<QRStyle>;
}

export default function QRCodePage() {
  const [text, setText] = useState('');
  const [qrCodes, setQrCodes] = useState<QRCodeItem[]>([]);
  const [batchTexts, setBatchTexts] = useState<string[]>(['']);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showStylePanel, setShowStylePanel] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  
  const [style, setStyle] = useState<QRStyle>({
    size: 256,
    errorLevel: 'M',
    foregroundColor: '#000000',
    backgroundColor: '#FFFFFF',
    margin: 2,
    logoSize: 0.2,
    cornerRadius: 0,
    dotStyle: 'square'
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const { getToolTranslation, getUITranslation, getToolPageTranslation } = useToolTranslations();
  const { t } = useLanguage();
  const toolTranslation = getToolTranslation('utility-qr');
  const ui = getUITranslation();
  const pageTranslation = getToolPageTranslation('utility-qr');

  // QR码模板
  const templates: QRTemplate[] = [
    {
      name: '经典黑白',
      description: '传统黑白二维码',
      style: { foregroundColor: '#000000', backgroundColor: '#FFFFFF', dotStyle: 'square' }
    },
    {
      name: '蓝色主题',
      description: '蓝色渐变风格',
      style: { foregroundColor: '#1E40AF', backgroundColor: '#EFF6FF', dotStyle: 'rounded' }
    },
    {
      name: '绿色环保',
      description: '绿色环保主题',
      style: { foregroundColor: '#059669', backgroundColor: '#ECFDF5', dotStyle: 'dots' }
    },
    {
      name: '紫色科技',
      description: '紫色科技感',
      style: { foregroundColor: '#7C3AED', backgroundColor: '#F3E8FF', dotStyle: 'rounded' }
    },
    {
      name: '橙色活力',
      description: '橙色活力风格',
      style: { foregroundColor: '#EA580C', backgroundColor: '#FFF7ED', dotStyle: 'dots' }
    },
    {
      name: '高对比度',
      description: '高对比度设计',
      style: { foregroundColor: '#FFFFFF', backgroundColor: '#000000', dotStyle: 'square' }
    }
  ];

  // 处理Logo上传
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 生成QR码
  const generateQRCode = useCallback(async (inputText: string, customStyle?: Partial<QRStyle>): Promise<string> => {
    const currentStyle = { ...style, ...customStyle };
    
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      // 生成基础QR码
      const qrDataUrl = await QRCode.toDataURL(inputText, {
        width: currentStyle.size,
        margin: currentStyle.margin,
        errorCorrectionLevel: currentStyle.errorLevel,
        color: {
          dark: currentStyle.foregroundColor,
          light: currentStyle.backgroundColor,
        },
      });

      // 如果没有Logo，直接返回
      if (!logoPreview) {
        return qrDataUrl;
      }

      // 在QR码上添加Logo
      return new Promise((resolve, reject) => {
        const qrImg = new Image();
        const logoImg = new Image();
        
        qrImg.onload = () => {
          canvas.width = currentStyle.size;
          canvas.height = currentStyle.size;
          
          // 绘制QR码
          ctx.drawImage(qrImg, 0, 0);
          
          if (logoPreview) {
            logoImg.onload = () => {
              const logoSize = currentStyle.size * currentStyle.logoSize;
              const logoX = (currentStyle.size - logoSize) / 2;
              const logoY = (currentStyle.size - logoSize) / 2;
              
              // 绘制白色背景圆形
              ctx.fillStyle = currentStyle.backgroundColor;
              ctx.beginPath();
              ctx.arc(currentStyle.size / 2, currentStyle.size / 2, logoSize / 2 + 5, 0, 2 * Math.PI);
              ctx.fill();
              
              // 绘制Logo
              ctx.save();
              ctx.beginPath();
              ctx.arc(currentStyle.size / 2, currentStyle.size / 2, logoSize / 2, 0, 2 * Math.PI);
              ctx.clip();
              ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
              ctx.restore();
              
              resolve(canvas.toDataURL());
            };
            logoImg.onerror = () => resolve(qrDataUrl);
            logoImg.src = logoPreview;
          } else {
            resolve(qrDataUrl);
          }
        };
        
        qrImg.onerror = () => reject(new Error('Failed to load QR code'));
        qrImg.src = qrDataUrl;
      });
    } catch (error) {
      console.error('生成二维码失败:', error);
      throw error;
    }
  }, [style, logoPreview]);

  // 处理单个生成
  const handleSingleGenerate = async () => {
    if (!text.trim()) return;
    
    setIsGenerating(true);
    try {
      const url = await generateQRCode(text);
      const newQRCode: QRCodeItem = {
        id: Date.now().toString(),
        text,
        url,
        style: { ...style },
        timestamp: new Date(),
        downloadCount: 0
      };
      setQrCodes([newQRCode]);
    } catch (error) {
      console.error('生成失败:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // 处理批量生成
  const handleBatchGenerate = async () => {
    const validTexts = batchTexts.filter(t => t.trim());
    if (validTexts.length === 0) return;
    
    setIsGenerating(true);
    const newQRCodes: QRCodeItem[] = [];
    
    try {
      for (let i = 0; i < validTexts.length; i++) {
        const url = await generateQRCode(validTexts[i]);
        newQRCodes.push({
          id: `${Date.now()}-${i}`,
          text: validTexts[i],
          url,
          style: { ...style },
          timestamp: new Date(),
          downloadCount: 0
        });
      }
      setQrCodes(newQRCodes);
    } catch (error) {
      console.error('批量生成失败:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // 下载单个QR码
  const downloadQRCode = (qrCode: QRCodeItem) => {
    const link = document.createElement('a');
    link.href = qrCode.url;
    link.download = `qrcode-${qrCode.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 更新下载次数
    setQrCodes(prev => prev.map(qr => 
      qr.id === qrCode.id ? { ...qr, downloadCount: qr.downloadCount + 1 } : qr
    ));
  };

  // 批量下载
  const downloadAllQRCodes = async () => {
    for (const qrCode of qrCodes) {
      downloadQRCode(qrCode);
      // 添加延迟避免浏览器阻止多个下载
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  };

  // 复制到剪贴板
  const copyToClipboard = async (qrCode: QRCodeItem) => {
    if (navigator.clipboard) {
      try {
        const response = await fetch(qrCode.url);
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

  // 清空所有
  const clearAll = () => {
    setText('');
    setBatchTexts(['']);
    setQrCodes([]);
    setLogoFile(null);
    setLogoPreview('');
  };

  // 应用模板
  const applyTemplate = (template: QRTemplate) => {
    setStyle(prev => ({ ...prev, ...template.style }));
  };

  // 批量文本管理
  const addBatchText = () => {
    setBatchTexts([...batchTexts, '']);
  };

  const removeBatchText = (index: number) => {
    setBatchTexts(batchTexts.filter((_, i) => i !== index));
  };

  const updateBatchText = (index: number, value: string) => {
    const newTexts = [...batchTexts];
    newTexts[index] = value;
    setBatchTexts(newTexts);
  };

  // 错误纠正级别选项
  const errorLevels = [
    { value: 'L', label: '低 (L)', description: '约7%纠错能力' },
    { value: 'M', label: '中 (M)', description: '约15%纠错能力' },
    { value: 'Q', label: '高 (Q)', description: '约25%纠错能力' },
    { value: 'H', label: '最高 (H)', description: '约30%纠错能力' },
  ];

  // 快速输入选项
  const quickInputs = [
    { name: '网址', text: 'https://example.com', icon: '🌐' },
    { name: '邮箱', text: 'contact@example.com', icon: '📧' },
    { name: '电话', text: 'tel:+1234567890', icon: '📞' },
    { name: 'WiFi', text: 'WIFI:T:WPA;S:MyWiFi;P:password123;;', icon: '📶' },
    { name: '短信', text: 'sms:+1234567890', icon: '💬' },
    { name: '地理位置', text: 'geo:37.7749,-122.4194', icon: '📍' },
  ];

  // 统计数据
  const getAnalytics = () => {
    const totalGenerated = qrCodes.length;
    const totalDownloads = qrCodes.reduce((sum, qr) => sum + qr.downloadCount, 0);
    const mostPopular = qrCodes.length > 0 ? qrCodes.reduce((max, qr) => 
      qr.downloadCount > max.downloadCount ? qr : max
    ) : null;
    
    return { totalGenerated, totalDownloads, mostPopular };
  };

  const analytics = getAnalytics();

  return (
    <ToolLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {toolTranslation.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            支持样式自定义、批量生成、Logo嵌入等高级功能
          </p>
        </div>

        {/* 工具栏 */}
        <div className="flex flex-wrap gap-4 justify-center items-center">
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
            onClick={() => setShowStylePanel(!showStylePanel)}
            className="btn bg-purple-600 hover:bg-purple-700 text-white text-sm"
          >
            <Palette className="w-4 h-4 mr-1" />
            样式设置
          </button>

          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="btn bg-green-600 hover:bg-green-700 text-white text-sm"
          >
            <BarChart className="w-4 h-4 mr-1" />
            数据统计
          </button>
        </div>

        {/* 样式设置面板 */}
        {showStylePanel && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              样式自定义
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 基础设置 */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 dark:text-white">基础设置</h3>
                
                {/* 尺寸 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    尺寸: {style.size}px
                  </label>
                  <input
                    type="range"
                    min="128"
                    max="512"
                    step="32"
                    value={style.size}
                    onChange={(e) => setStyle({ ...style, size: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>

                {/* 边距 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    边距: {style.margin}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={style.margin}
                    onChange={(e) => setStyle({ ...style, margin: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>

                {/* 错误纠正级别 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    错误纠正级别
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {errorLevels.map((level) => (
                      <button
                        key={level.value}
                        onClick={() => setStyle({ ...style, errorLevel: level.value as any })}
                        className={`p-2 border rounded-lg text-left transition-colors text-sm ${
                          style.errorLevel === level.value
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
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
              </div>

              {/* 颜色和Logo设置 */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 dark:text-white">外观设置</h3>
                
                {/* 颜色设置 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      前景色
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={style.foregroundColor}
                        onChange={(e) => setStyle({ ...style, foregroundColor: e.target.value })}
                        className="w-12 h-8 rounded border border-gray-300 dark:border-gray-600"
                      />
                      <input
                        type="text"
                        value={style.foregroundColor}
                        onChange={(e) => setStyle({ ...style, foregroundColor: e.target.value })}
                        className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      背景色
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={style.backgroundColor}
                        onChange={(e) => setStyle({ ...style, backgroundColor: e.target.value })}
                        className="w-12 h-8 rounded border border-gray-300 dark:border-gray-600"
                      />
                      <input
                        type="text"
                        value={style.backgroundColor}
                        onChange={(e) => setStyle({ ...style, backgroundColor: e.target.value })}
                        className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Logo设置 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Logo嵌入
                  </label>
                  <div className="space-y-2">
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => logoInputRef.current?.click()}
                      className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 transition-colors text-center"
                    >
                      <Upload className="w-5 h-5 mx-auto mb-1 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {logoFile ? logoFile.name : '点击上传Logo'}
                      </span>
                    </button>
                    
                    {logoPreview && (
                      <div className="flex items-center gap-3">
                        <img src={logoPreview} alt="Logo预览" className="w-12 h-12 object-contain rounded" />
                        <div className="flex-1">
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                            Logo大小: {Math.round(style.logoSize * 100)}%
                          </label>
                          <input
                            type="range"
                            min="0.1"
                            max="0.4"
                            step="0.05"
                            value={style.logoSize}
                            onChange={(e) => setStyle({ ...style, logoSize: Number(e.target.value) })}
                            className="w-full"
                          />
                        </div>
                        <button
                          onClick={() => {
                            setLogoFile(null);
                            setLogoPreview('');
                          }}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 样式模板 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    预设模板
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {templates.map((template, index) => (
                      <button
                        key={index}
                        onClick={() => applyTemplate(template)}
                        className="p-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 transition-colors text-left"
                      >
                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                          {template.name}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {template.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 数据统计面板 */}
        {showAnalytics && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <BarChart className="w-5 h-5 mr-2" />
              使用统计
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {analytics.totalGenerated}
                </div>
                <div className="text-sm text-blue-800 dark:text-blue-300">
                  总生成数量
                </div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {analytics.totalDownloads}
                </div>
                <div className="text-sm text-green-800 dark:text-green-300">
                  总下载次数
                </div>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <div className="text-sm font-medium text-purple-800 dark:text-purple-300">
                  最受欢迎
                </div>
                <div className="text-xs text-purple-600 dark:text-purple-400 truncate">
                  {analytics.mostPopular?.text || '暂无数据'}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 输入区域 */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                内容输入
              </h2>

              {!isBatchMode ? (
                /* 单个输入 */
                <div className="space-y-4">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="输入要生成二维码的内容..."
                    className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    字符数: {text.length}
                  </div>

                  <button
                    onClick={handleSingleGenerate}
                    disabled={!text.trim() || isGenerating}
                    className="w-full btn bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <Zap className="w-4 h-4 mr-2" />
                    )}
                    {isGenerating ? '生成中...' : '生成二维码'}
                  </button>
                </div>
              ) : (
                /* 批量输入 */
                <div className="space-y-4">
                  <div className="space-y-2">
                    {batchTexts.map((text, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={text}
                          onChange={(e) => updateBatchText(index, e.target.value)}
                          placeholder={`内容 ${index + 1}`}
                          className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        />
                        {batchTexts.length > 1 && (
                          <button
                            onClick={() => removeBatchText(index)}
                            className="p-2 text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={addBatchText}
                      className="btn bg-gray-600 hover:bg-gray-700 text-white text-sm"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      添加
                    </button>
                    
                    <button
                      onClick={handleBatchGenerate}
                      disabled={!batchTexts.some(t => t.trim()) || isGenerating}
                      className="flex-1 btn bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <Zap className="w-4 h-4 mr-2" />
                      )}
                      {isGenerating ? '生成中...' : `批量生成 (${batchTexts.filter(t => t.trim()).length})`}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 快速输入 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                快速输入
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {quickInputs.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => isBatchMode ? 
                      updateBatchText(0, item.text) : 
                      setText(item.text)
                    }
                    className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{item.icon}</span>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                          {item.name}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {item.text}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 结果区域 */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  生成结果 ({qrCodes.length})
                </h2>
                <div className="flex gap-2">
                  {qrCodes.length > 0 && (
                    <>
                      <button
                        onClick={downloadAllQRCodes}
                        className="btn bg-green-600 hover:bg-green-700 text-white text-sm"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        全部下载
                      </button>
                      <button
                        onClick={clearAll}
                        className="btn bg-gray-600 hover:bg-gray-700 text-white text-sm"
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        清空
                      </button>
                    </>
                  )}
                </div>
              </div>

              {qrCodes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {qrCodes.map((qrCode) => (
                    <div key={qrCode.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <div className="text-center mb-3">
                        <img
                          src={qrCode.url}
                          alt="QR Code"
                          className="mx-auto rounded"
                          style={{ width: Math.min(qrCode.style.size, 150), height: Math.min(qrCode.style.size, 150) }}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {qrCode.text}
                        </div>
                        
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          {qrCode.timestamp.toLocaleString()}
                          {qrCode.downloadCount > 0 && (
                            <span className="ml-2">• 下载 {qrCode.downloadCount} 次</span>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => downloadQRCode(qrCode)}
                            className="flex-1 btn bg-blue-600 hover:bg-blue-700 text-white text-xs"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            下载
                          </button>
                          <button
                            onClick={() => copyToClipboard(qrCode)}
                            className="flex-1 btn bg-gray-600 hover:bg-gray-700 text-white text-xs"
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            复制
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl">📱</span>
                  </div>
                  <p>输入内容后点击生成按钮</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">
            使用说明
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">基本功能</h4>
              <ul className="space-y-1 text-blue-700 dark:text-blue-300 text-sm">
                <li>• 支持文本、网址、WiFi等多种内容</li>
                <li>• 批量生成多个二维码</li>
                <li>• 自定义颜色和样式</li>
                <li>• 嵌入Logo增强品牌效果</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">高级功能</h4>
              <ul className="space-y-1 text-blue-700 dark:text-blue-300 text-sm">
                <li>• 多种错误纠正级别选择</li>
                <li>• 预设样式模板快速应用</li>
                <li>• 下载统计和使用分析</li>
                <li>• 一键复制和批量下载</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 隐藏的canvas用于处理 */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </ToolLayout>
  );
}
