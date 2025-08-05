'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Download, RotateCcw, Copy, Upload, Palette, Wifi, Phone, Mail, User, MessageSquare, Link, Share2, Eye, Settings } from 'lucide-react';
import QRCode from 'qrcode';
import { ToolLayout } from '@/components/tool-layout';
import { useToolTranslations } from '@/components/tool-translations';
import { useLanguage } from '@/components/language-provider';

interface QRStyle {
  foregroundColor: string;
  backgroundColor: string;
  margin: number;
  width: number;
}

interface QRTemplate {
  type: string;
  name: string;
  icon: React.ReactNode;
  fields: Array<{
    key: string;
    label: string;
    placeholder: string;
    type: 'text' | 'email' | 'tel' | 'password' | 'select';
    options?: string[];
    required?: boolean;
  }>;
  generate: (data: Record<string, string>) => string;
}

export default function QRCodePage() {
  const [activeTab, setActiveTab] = useState('text');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [size, setSize] = useState(256);
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [qrHistory, setQrHistory] = useState<Array<{url: string, type: string, content: string, timestamp: number}>>([]);
  const [batchMode, setBatchMode] = useState(false);
  const [batchData, setBatchData] = useState<string[]>(['']);
  
  // QR Style settings
  const [qrStyle, setQrStyle] = useState<QRStyle>({
    foregroundColor: '#000000',
    backgroundColor: '#FFFFFF',
    margin: 2,
    width: 256
  });
  
  // Form data for different QR types
  const [formData, setFormData] = useState<Record<string, Record<string, string>>>({
    text: { content: '' },
    url: { url: '' },
    wifi: { ssid: '', password: '', security: 'WPA', hidden: 'false' },
    vcard: { firstName: '', lastName: '', phone: '', email: '', organization: '', url: '' },
    sms: { phone: '', message: '' },
    email: { email: '', subject: '', body: '' },
    phone: { phone: '' },
  });

  const { getToolTranslation, getUITranslation, getToolPageTranslation } = useToolTranslations();
  const { t } = useLanguage();
  const toolTranslation = getToolTranslation('utility-qr');
  const ui = getUITranslation();
  const pageTranslation = getToolPageTranslation('utility-qr');

  const qrTemplates: QRTemplate[] = [
    {
      type: 'text',
      name: '纯文本',
      icon: <MessageSquare className="w-4 h-4" />,
      fields: [
        { key: 'content', label: '文本内容', placeholder: '输入要编码的文本', type: 'text', required: true }
      ],
      generate: (data) => data.content
    },
    {
      type: 'url',
      name: '网址链接',
      icon: <Link className="w-4 h-4" />,
      fields: [
        { key: 'url', label: '网址', placeholder: 'https://example.com', type: 'text', required: true }
      ],
      generate: (data) => data.url.startsWith('http') ? data.url : `https://${data.url}`
    },
    {
      type: 'wifi',
      name: 'WiFi网络',
      icon: <Wifi className="w-4 h-4" />,
      fields: [
        { key: 'ssid', label: '网络名称', placeholder: '输入WiFi名称', type: 'text', required: true },
        { key: 'password', label: '密码', placeholder: '输入WiFi密码', type: 'password' },
        { key: 'security', label: '加密方式', placeholder: '', type: 'select', options: ['WPA', 'WEP', 'nopass'], required: true },
        { key: 'hidden', label: '隐藏网络', placeholder: '', type: 'select', options: ['false', 'true'] }
      ],
      generate: (data) => `WIFI:T:${data.security};S:${data.ssid};P:${data.password};H:${data.hidden};;`
    },
    {
      type: 'vcard',
      name: '联系人名片',
      icon: <User className="w-4 h-4" />,
      fields: [
        { key: 'firstName', label: '名', placeholder: '输入名字', type: 'text', required: true },
        { key: 'lastName', label: '姓', placeholder: '输入姓氏', type: 'text' },
        { key: 'phone', label: '电话', placeholder: '+86 138 0000 0000', type: 'tel' },
        { key: 'email', label: '邮箱', placeholder: 'example@email.com', type: 'email' },
        { key: 'organization', label: '公司', placeholder: '公司名称', type: 'text' },
        { key: 'url', label: '网址', placeholder: 'https://example.com', type: 'text' }
      ],
      generate: (data) => {
        return `BEGIN:VCARD\nVERSION:3.0\nFN:${data.firstName} ${data.lastName}\nN:${data.lastName};${data.firstName};;;\n${data.phone ? `TEL:${data.phone}\n` : ''}${data.email ? `EMAIL:${data.email}\n` : ''}${data.organization ? `ORG:${data.organization}\n` : ''}${data.url ? `URL:${data.url}\n` : ''}END:VCARD`;
      }
    },
    {
      type: 'sms',
      name: '短信',
      icon: <MessageSquare className="w-4 h-4" />,
      fields: [
        { key: 'phone', label: '手机号', placeholder: '+86 138 0000 0000', type: 'tel', required: true },
        { key: 'message', label: '短信内容', placeholder: '输入短信内容', type: 'text' }
      ],
      generate: (data) => `sms:${data.phone}${data.message ? `?body=${encodeURIComponent(data.message)}` : ''}`
    },
    {
      type: 'email',
      name: '邮件',
      icon: <Mail className="w-4 h-4" />,
      fields: [
        { key: 'email', label: '邮箱地址', placeholder: 'example@email.com', type: 'email', required: true },
        { key: 'subject', label: '主题', placeholder: '邮件主题', type: 'text' },
        { key: 'body', label: '内容', placeholder: '邮件内容', type: 'text' }
      ],
      generate: (data) => `mailto:${data.email}${data.subject || data.body ? '?' : ''}${data.subject ? `subject=${encodeURIComponent(data.subject)}` : ''}${data.subject && data.body ? '&' : ''}${data.body ? `body=${encodeURIComponent(data.body)}` : ''}`
    },
    {
      type: 'phone',
      name: '电话',
      icon: <Phone className="w-4 h-4" />,
      fields: [
        { key: 'phone', label: '电话号码', placeholder: '+86 138 0000 0000', type: 'tel', required: true }
      ],
      generate: (data) => `tel:${data.phone}`
    }
  ];

  const generateQRCode = useCallback(async (content: string, customStyle?: Partial<QRStyle>) => {
    if (!content) return null;

    setIsGenerating(true);
    try {
      const style = { ...qrStyle, ...customStyle };
      const url = await QRCode.toDataURL(content, {
        width: style.width,
        margin: style.margin,
        errorCorrectionLevel: errorLevel,
        color: {
          dark: style.foregroundColor,
          light: style.backgroundColor,
        },
      });
      return url;
    } catch (error) {
      console.error('生成二维码失败:', error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [qrStyle, errorLevel]);

  const handleGenerate = async () => {
    const currentTemplate = qrTemplates.find(t => t.type === activeTab);
    if (!currentTemplate) return;

    const currentData = formData[activeTab] || {};
    const content = currentTemplate.generate(currentData);
    
    if (!content) return;

    const url = await generateQRCode(content);
    if (url) {
      setQrCodeUrl(url);
      
      // Add to history
      setQrHistory(prev => [
        {
          url,
          type: activeTab,
          content: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
          timestamp: Date.now()
        },
        ...prev.slice(0, 9) // Keep only last 10 entries
      ]);
    }
  };

  const handleBatchGenerate = async () => {
    const validData = batchData.filter(item => item.trim());
    if (validData.length === 0) return;

    const results = [];
    for (const item of validData) {
      const url = await generateQRCode(item);
      if (url) {
        results.push({ content: item, url });
      }
    }

    // Download as ZIP would require additional library
    // For now, we'll generate individual downloads
    results.forEach((result, index) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = result.url;
        link.download = `qr-code-${index + 1}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, index * 500);
    });
  };

  const handleDownload = (url: string = qrCodeUrl, filename: string = 'qrcode.png') => {
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleCopy = async (url: string = qrCodeUrl) => {
    if (url && navigator.clipboard) {
      try {
        const response = await fetch(url);
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

  const handleShare = async () => {
    if (qrCodeUrl && navigator.share) {
      try {
        const response = await fetch(qrCodeUrl);
        const blob = await response.blob();
        const file = new File([blob], 'qrcode.png', { type: blob.type });
        
        await navigator.share({
          title: '二维码分享',
          files: [file]
        });
      } catch (error) {
        console.error('分享失败:', error);
      }
    }
  };

  const handleClear = () => {
    setFormData(prev => ({
      ...prev,
      [activeTab]: qrTemplates.find(t => t.type === activeTab)?.fields.reduce((acc, field) => {
        acc[field.key] = '';
        return acc;
      }, {} as Record<string, string>) || {}
    }));
    setQrCodeUrl('');
  };

  const updateFormData = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [key]: value
      }
    }));
  };

  const errorLevels = [
    { value: 'L', ...pageTranslation.errorLevels.low },
    { value: 'M', ...pageTranslation.errorLevels.medium },
    { value: 'Q', ...pageTranslation.errorLevels.high },
    { value: 'H', ...pageTranslation.errorLevels.highest },
  ];

  // Auto-generate when form data changes
  useEffect(() => {
    const currentTemplate = qrTemplates.find(t => t.type === activeTab);
    if (!currentTemplate) return;

    const currentData = formData[activeTab] || {};
    const requiredFields = currentTemplate.fields.filter(f => f.required);
    const hasAllRequired = requiredFields.every(field => currentData[field.key]?.trim());

    if (hasAllRequired) {
      const content = currentTemplate.generate(currentData);
      if (content) {
        generateQRCode(content).then(url => {
          if (url) setQrCodeUrl(url);
        });
      }
    }
  }, [formData, activeTab, qrStyle, errorLevel, generateQRCode]);

  const currentTemplate = qrTemplates.find(t => t.type === activeTab);
  const currentData = formData[activeTab] || {};

  return (
    <ToolLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {toolTranslation.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {toolTranslation.description}
          </p>
        </div>

        {/* QR类型选择 */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              二维码类型
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setBatchMode(!batchMode)}
                className={`btn-sm ${batchMode ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'}`}
              >
                批量模式
              </button>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`btn-sm ${showAdvanced ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'}`}
              >
                <Settings className="w-4 h-4 mr-1" />
                高级设置
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {qrTemplates.map((template) => (
              <button
                key={template.type}
                onClick={() => setActiveTab(template.type)}
                className={`p-3 border rounded-lg text-center transition-all ${
                  activeTab === template.type
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600'
                }`}
              >
                <div className="flex justify-center mb-2">
                  {template.icon}
                </div>
                <div className="text-xs font-medium">
                  {template.name}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：输入和控制 */}
          <div className="lg:col-span-2 space-y-6">
            {!batchMode ? (
              /* 单个二维码生成 */
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {currentTemplate?.name} 设置
                </h3>
                
                <div className="space-y-4">
                  {currentTemplate?.fields.map((field) => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      {field.type === 'select' ? (
                        <select
                          value={currentData[field.key] || ''}
                          onChange={(e) => updateFormData(field.key, e.target.value)}
                          className="input"
                        >
                          {field.options?.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          value={currentData[field.key] || ''}
                          onChange={(e) => updateFormData(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className="input"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* 批量生成 */
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  批量生成 (纯文本)
                </h3>
                
                <div className="space-y-3">
                  {batchData.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const newBatchData = [...batchData];
                          newBatchData[index] = e.target.value;
                          setBatchData(newBatchData);
                        }}
                        placeholder={`内容 ${index + 1}`}
                        className="input flex-1"
                      />
                      {index === batchData.length - 1 && (
                        <button
                          onClick={() => setBatchData([...batchData, ''])}
                          className="btn-sm bg-blue-600 text-white"
                        >
                          +
                        </button>
                      )}
                      {batchData.length > 1 && (
                        <button
                          onClick={() => setBatchData(batchData.filter((_, i) => i !== index))}
                          className="btn-sm bg-red-600 text-white"
                        >
                          -
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={handleBatchGenerate}
                  disabled={batchData.filter(item => item.trim()).length === 0}
                  className="btn btn-primary mt-4 w-full"
                >
                  批量生成并下载
                </button>
              </div>
            )}

            {/* 高级设置 */}
            {showAdvanced && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  高级设置
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      尺寸设置
                    </label>
                    <input
                      type="range"
                      min="128"
                      max="512"
                      step="32"
                      value={qrStyle.width}
                      onChange={(e) => setQrStyle(prev => ({ ...prev, width: Number(e.target.value) }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>128px</span>
                      <span>{qrStyle.width}px</span>
                      <span>512px</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      边距设置
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="8"
                      step="1"
                      value={qrStyle.margin}
                      onChange={(e) => setQrStyle(prev => ({ ...prev, margin: Number(e.target.value) }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>0</span>
                      <span>{qrStyle.margin}</span>
                      <span>8</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      前景色
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={qrStyle.foregroundColor}
                        onChange={(e) => setQrStyle(prev => ({ ...prev, foregroundColor: e.target.value }))}
                        className="w-12 h-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={qrStyle.foregroundColor}
                        onChange={(e) => setQrStyle(prev => ({ ...prev, foregroundColor: e.target.value }))}
                        className="input flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      背景色
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={qrStyle.backgroundColor}
                        onChange={(e) => setQrStyle(prev => ({ ...prev, backgroundColor: e.target.value }))}
                        className="w-12 h-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={qrStyle.backgroundColor}
                        onChange={(e) => setQrStyle(prev => ({ ...prev, backgroundColor: e.target.value }))}
                        className="input flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    纠错级别
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
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
                        <div className="font-medium text-gray-900 dark:text-white text-sm">
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
            )}

            <div className="flex gap-2">
              <button
                onClick={handleClear}
                className="btn btn-outline flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                {ui.buttons.clear}
              </button>
              {!batchMode && (
                <button
                  onClick={handleGenerate}
                  className="btn btn-primary flex items-center gap-2"
                >
                  生成二维码
                </button>
              )}
            </div>
          </div>

          {/* 右侧：二维码显示和历史 */}
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                生成的二维码
              </h3>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8">
                {qrCodeUrl ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <img
                        src={qrCodeUrl}
                        alt="生成的二维码"
                        className="mx-auto rounded-lg shadow-md"
                        style={{ width: qrStyle.width, height: qrStyle.width }}
                      />
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
                      {ui.labels.size}: {qrStyle.width}px × {qrStyle.width}px
                    </div>
                    
                    <div className="flex flex-wrap gap-2 justify-center">
                      <button
                        onClick={() => handleDownload()}
                        className="btn-sm btn-primary flex items-center gap-2"
                      >
                        <Download className="h-3 w-3" />
                        {ui.buttons.download}
                      </button>
                      <button
                        onClick={() => handleCopy()}
                        className="btn-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 flex items-center gap-2"
                      >
                        <Copy className="h-3 w-3" />
                        {ui.buttons.copy}
                      </button>
                      {navigator.share && (
                        <button
                          onClick={handleShare}
                          className="btn-sm bg-green-100 hover:bg-green-200 dark:bg-green-800 dark:hover:bg-green-700 text-green-700 dark:text-green-200 flex items-center gap-2"
                        >
                          <Share2 className="h-3 w-3" />
                          分享
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <span className="text-gray-400 text-2xl">QR</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      {isGenerating ? '生成中...' : '填写信息后自动生成二维码'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 历史记录 */}
            {qrHistory.length > 0 && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  生成历史
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {qrHistory.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <img
                        src={item.url}
                        alt="历史二维码"
                        className="w-12 h-12 rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {qrTemplates.find(t => t.type === item.type)?.name}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {item.content}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleDownload(item.url, `qr-${item.type}-${index + 1}.png`)}
                          className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          title="下载"
                        >
                          <Download className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleCopy(item.url)}
                          className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          title="复制"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            使用说明
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>• 选择二维码类型并填写相应信息</li>
              <li>• 支持文本、网址、WiFi、联系人等多种类型</li>
              <li>• 实时预览，填写信息后自动生成</li>
              <li>• 支持自定义颜色、尺寸和纠错级别</li>
            </ul>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>• 批量模式可同时生成多个二维码</li>
              <li>• 生成历史记录便于管理和重用</li>
              <li>• 支持直接分享到其他应用</li>
              <li>• 所有处理均在本地完成，保护隐私</li>
            </ul>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
