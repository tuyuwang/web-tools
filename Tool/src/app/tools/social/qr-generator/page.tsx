'use client';

import { useState, useEffect } from 'react';
import { Download, Copy, Share2, Wifi, CreditCard, MessageSquare } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';
import { useLanguage } from '@/components/language-provider';

type QRType = 'text' | 'url' | 'wifi' | 'email' | 'phone' | 'sms';

interface QRConfig {
  size: number;
  margin: number;
  colorDark: string;
  colorLight: string;
}

const defaultConfig: QRConfig = {
  size: 256,
  margin: 4,
  colorDark: '#000000',
  colorLight: '#ffffff',
};

// 模拟QR码生成
const generateQRCodeDataURL = (text: string, config: QRConfig): string => {
  const size = config.size;
  const modules = 25;
  const moduleSize = (size - config.margin * 2) / modules;
  
  let svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<rect width="${size}" height="${size}" fill="${config.colorLight}"/>`;
  
  for (let i = 0; i < modules; i++) {
    for (let j = 0; j < modules; j++) {
      if ((i + j) % 3 === 0 || (i === 0 || i === modules - 1) || (j === 0 || j === modules - 1)) {
        const x = config.margin + j * moduleSize;
        const y = config.margin + i * moduleSize;
        svg += `<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}" fill="${config.colorDark}"/>`;
      }
    }
  }
  svg += '</svg>';
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

export default function QRGeneratorPage() {
  const { t } = useLanguage();
  const [qrType, setQrType] = useState<QRType>('text');
  const [qrContent, setQrContent] = useState('Hello World!');
  const [qrConfig, setQrConfig] = useState<QRConfig>(defaultConfig);
  const [qrDataURL, setQrDataURL] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // WiFi配置
  const [wifiConfig, setWifiConfig] = useState({
    ssid: '',
    password: '',
    security: 'WPA',
    hidden: false,
  });

  // 生成不同类型的内容
  const generateContent = (): string => {
    switch (qrType) {
      case 'text':
        return qrContent;
      case 'url':
        return qrContent.startsWith('http') ? qrContent : `https://${qrContent}`;
      case 'wifi':
        return `WIFI:T:${wifiConfig.security};S:${wifiConfig.ssid};P:${wifiConfig.password};H:${wifiConfig.hidden};`;
      case 'email':
        return `mailto:${qrContent}`;
      case 'phone':
        return `tel:${qrContent}`;
      case 'sms':
        return `sms:${qrContent}`;
      default:
        return qrContent;
    }
  };

  // 生成二维码
  const generateQR = () => {
    const content = generateContent();
    if (content.trim()) {
      const dataURL = generateQRCodeDataURL(content, qrConfig);
      setQrDataURL(dataURL);
    }
  };

  // 下载二维码
  const downloadQR = () => {
    if (qrDataURL) {
      const link = document.createElement('a');
      link.download = `qrcode-${Date.now()}.png`;
      link.href = qrDataURL;
      link.click();
    }
  };

  // 复制二维码
  const copyQR = async () => {
    if (qrDataURL) {
      try {
        const response = await fetch(qrDataURL);
        const blob = await response.blob();
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        alert('二维码已复制到剪贴板');
      } catch (error) {
        console.error('复制失败:', error);
        alert('复制失败，请手动保存图片');
      }
    }
  };

  // 当配置或内容变化时重新生成
  useEffect(() => {
    const content = generateContent();
    if (content.trim()) {
      generateQR();
    }
  }, [qrType, qrContent, wifiConfig, qrConfig]);

  const renderInputForm = () => {
    switch (qrType) {
      case 'text':
      case 'url':
        return (
          <textarea
            value={qrContent}
            onChange={(e) => setQrContent(e.target.value)}
            placeholder={qrType === 'url' ? '输入网址，如：https://example.com' : '输入要生成二维码的文本'}
            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
          />
        );

      case 'wifi':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                网络名称 (SSID)
              </label>
              <input
                type="text"
                value={wifiConfig.ssid}
                onChange={(e) => setWifiConfig({...wifiConfig, ssid: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                密码
              </label>
              <input
                type="password"
                value={wifiConfig.password}
                onChange={(e) => setWifiConfig({...wifiConfig, password: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                安全类型
              </label>
              <select
                value={wifiConfig.security}
                onChange={(e) => setWifiConfig({...wifiConfig, security: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">无密码</option>
              </select>
            </div>
          </div>
        );

      case 'email':
        return (
          <input
            type="email"
            value={qrContent}
            onChange={(e) => setQrContent(e.target.value)}
            placeholder="输入邮箱地址"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        );

      case 'phone':
        return (
          <input
            type="tel"
            value={qrContent}
            onChange={(e) => setQrContent(e.target.value)}
            placeholder="输入电话号码"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        );

      case 'sms':
        return (
          <input
            type="tel"
            value={qrContent}
            onChange={(e) => setQrContent(e.target.value)}
            placeholder="输入手机号码"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        );

      default:
        return null;
    }
  };

  const qrTypes = [
    { id: 'text', name: '文本', icon: MessageSquare },
    { id: 'url', name: '网址', icon: Share2 },
    { id: 'wifi', name: 'WiFi', icon: Wifi },
    { id: 'email', name: '邮箱', icon: MessageSquare },
    { id: 'phone', name: '电话', icon: MessageSquare },
    { id: 'sms', name: '短信', icon: MessageSquare },
  ];

  return (
    <ToolLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* 标题区域 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            二维码生成器
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            生成各种类型的二维码，支持文本、链接、WiFi等
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：设置区域 */}
          <div className="space-y-6">
            {/* 类型选择 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                选择类型
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {qrTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setQrType(type.id as QRType)}
                      className={`flex flex-col items-center p-3 rounded-lg border-2 transition-colors ${
                        qrType === type.id
                          ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                          : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500'
                      }`}
                    >
                      <IconComponent className="w-6 h-6 mb-2" />
                      <span className="text-sm font-medium">{type.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 内容输入 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                输入内容
              </h3>
              {renderInputForm()}
            </div>

            {/* 高级设置 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  高级设置
                </h3>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-primary-600 hover:text-primary-700 text-sm"
                >
                  {showAdvanced ? '隐藏' : '显示'}
                </button>
              </div>
              
              {showAdvanced && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      尺寸: {qrConfig.size}px
                    </label>
                    <input
                      type="range"
                      min="128"
                      max="512"
                      step="32"
                      value={qrConfig.size}
                      onChange={(e) => setQrConfig({...qrConfig, size: parseInt(e.target.value)})}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        前景色
                      </label>
                      <input
                        type="color"
                        value={qrConfig.colorDark}
                        onChange={(e) => setQrConfig({...qrConfig, colorDark: e.target.value})}
                        className="w-full h-10 rounded border border-gray-300 dark:border-gray-600"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        背景色
                      </label>
                      <input
                        type="color"
                        value={qrConfig.colorLight}
                        onChange={(e) => setQrConfig({...qrConfig, colorLight: e.target.value})}
                        className="w-full h-10 rounded border border-gray-300 dark:border-gray-600"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 右侧：预览和操作区域 */}
          <div className="space-y-6">
            {/* 二维码预览 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                二维码预览
              </h3>
              <div className="flex justify-center">
                {qrDataURL ? (
                  <div className="text-center">
                    <img
                      src={qrDataURL}
                      alt="QR Code"
                      className="mx-auto border border-gray-200 dark:border-gray-600 rounded-lg"
                      style={{ width: qrConfig.size, height: qrConfig.size }}
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      {qrConfig.size} × {qrConfig.size} 像素
                    </p>
                  </div>
                ) : (
                  <div className="w-64 h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500 dark:text-gray-400">
                      <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>输入内容生成二维码</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 操作按钮 */}
            {qrDataURL && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  操作
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={downloadQR}
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>下载</span>
                  </button>
                  
                  <button
                    onClick={copyQR}
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    <span>复制</span>
                  </button>
                </div>
              </div>
            )}

            {/* 使用说明 */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
                使用说明
              </h3>
              <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <li>• 选择要生成的二维码类型</li>
                <li>• 输入相应的内容信息</li>
                <li>• 调整高级设置（可选）</li>
                <li>• 预览并下载二维码</li>
                <li>• 支持多种格式和自定义样式</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}