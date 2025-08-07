'use client';

import { useState } from 'react';
import { Link, Copy, QrCode, BarChart3, ExternalLink, Trash2 } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';
import QRCode from 'qrcode';

interface ShortUrl {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  createdAt: Date;
  clicks: number;
  qrCode?: string;
}

export default function URLShortenerPage() {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [shortUrls, setShortUrls] = useState<ShortUrl[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // 简单的URL验证
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // 生成随机短码
  const generateShortCode = (length = 6) => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // 生成短链接
  const generateShortUrl = async () => {
    if (!originalUrl.trim()) {
      alert('请输入要缩短的URL');
      return;
    }

    if (!isValidUrl(originalUrl)) {
      alert('请输入有效的URL（包含http://或https://）');
      return;
    }

    setIsGenerating(true);

    try {
      const shortCode = customCode.trim() || generateShortCode();
      
      // 检查短码是否已存在
      if (shortUrls.some(url => url.shortCode === shortCode)) {
        alert('该短码已存在，请使用其他短码');
        setIsGenerating(false);
        return;
      }

      const shortUrl = `https://short.ly/${shortCode}`;
      
      // 生成二维码
      const qrCode = await QRCode.toDataURL(shortUrl, {
        width: 200,
        margin: 2,
      });

      const newShortUrl: ShortUrl = {
        id: Date.now().toString(),
        originalUrl,
        shortCode,
        shortUrl,
        createdAt: new Date(),
        clicks: 0,
        qrCode,
      };

      setShortUrls(prev => [newShortUrl, ...prev]);
      setOriginalUrl('');
      setCustomCode('');
    } catch (error) {
      console.error('Error generating short URL:', error);
      alert('生成短链接时出错，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('已复制到剪贴板');
    } catch (error) {
      // 降级方案
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('已复制到剪贴板');
    }
  };

  // 删除短链接
  const deleteShortUrl = (id: string) => {
    setShortUrls(prev => prev.filter(url => url.id !== id));
  };

  // 模拟点击统计
  const simulateClick = (id: string) => {
    setShortUrls(prev => prev.map(url => 
      url.id === id ? { ...url, clicks: url.clicks + 1 } : url
    ));
  };

  return (
    <ToolLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 标题 */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            URL短链生成器
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            生成短链接，支持自定义短码和二维码，方便分享和管理
          </p>
        </div>

        {/* 生成表单 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                原始URL
              </label>
              <input
                type="url"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                placeholder="https://example.com/very-long-url-that-needs-to-be-shortened"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                自定义短码 (可选)
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400">
                  short.ly/
                </span>
                <input
                  type="text"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                  placeholder="custom-code"
                  maxLength={20}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                留空将自动生成随机短码
              </p>
            </div>

            <button
              onClick={generateShortUrl}
              disabled={isGenerating || !originalUrl.trim()}
              className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  生成中...
                </>
              ) : (
                <>
                  <Link className="h-4 w-4 mr-2" />
                  生成短链接
                </>
              )}
            </button>
          </div>
        </div>

        {/* 短链接列表 */}
        {shortUrls.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                我的短链接 ({shortUrls.length})
              </h2>
              <button
                onClick={() => setShortUrls([])}
                className="text-red-600 hover:text-red-700 dark:text-red-400 text-sm"
              >
                清空所有
              </button>
            </div>

            <div className="space-y-4">
              {shortUrls.map((urlData) => (
                <div
                  key={urlData.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* 链接信息 */}
                    <div className="lg:col-span-3 space-y-4">
                      {/* 短链接 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          短链接
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={urlData.shortUrl}
                            readOnly
                            className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-blue-600 dark:text-blue-400 text-sm"
                          />
                          <button
                            onClick={() => copyToClipboard(urlData.shortUrl)}
                            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            title="复制短链接"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => simulateClick(urlData.id)}
                            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            title="打开链接"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* 原始链接 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          原始链接
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={urlData.originalUrl}
                            readOnly
                            className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm"
                          />
                          <button
                            onClick={() => copyToClipboard(urlData.originalUrl)}
                            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            title="复制原始链接"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* 统计信息 */}
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <BarChart3 className="h-4 w-4 mr-1" />
                            点击: {urlData.clicks}
                          </span>
                          <span>
                            创建: {urlData.createdAt.toLocaleDateString()}
                          </span>
                        </div>
                        <button
                          onClick={() => deleteShortUrl(urlData.id)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400"
                          title="删除"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* 二维码 */}
                    <div className="flex flex-col items-center space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        二维码
                      </label>
                      {urlData.qrCode && (
                        <div className="bg-white p-2 rounded border">
                          <img
                            src={urlData.qrCode}
                            alt="QR Code"
                            className="w-24 h-24"
                          />
                        </div>
                      )}
                      <button
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = urlData.qrCode || '';
                          link.download = `qr-${urlData.shortCode}.png`;
                          link.click();
                        }}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-xs"
                      >
                        下载二维码
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">使用说明：</h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
            <li>• 输入完整的URL（必须包含http://或https://）</li>
            <li>• 可以自定义短码，留空则自动生成随机短码</li>
            <li>• 自动生成二维码，方便移动设备扫码访问</li>
            <li>• 点击统计仅为演示，实际使用需要后端支持</li>
            <li>• 所有数据仅存储在本地浏览器中</li>
            <li>• 这是一个演示工具，生成的短链接并不能真正访问</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}