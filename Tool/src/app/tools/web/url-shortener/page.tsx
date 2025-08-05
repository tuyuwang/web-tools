'use client';

import { useState, useEffect } from 'react';
import { ToolLayout } from '@/components/tool-layout';
import { Link, Copy, QrCode, BarChart3, ExternalLink, Check, AlertCircle } from 'lucide-react';

interface ShortenedUrl {
  id: string;
  originalUrl: string;
  shortUrl: string;
  shortCode: string;
  createdAt: string;
  clicks: number;
  qrCode?: string;
}

export default function UrlShortenerPage() {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [shortenedUrls, setShortenedUrls] = useState<ShortenedUrl[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 从localStorage加载数据
  useEffect(() => {
    const saved = localStorage.getItem('shortenedUrls');
    if (saved) {
      try {
        setShortenedUrls(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved URLs:', e);
      }
    }
  }, []);

  // 保存到localStorage
  useEffect(() => {
    localStorage.setItem('shortenedUrls', JSON.stringify(shortenedUrls));
  }, [shortenedUrls]);

  const validateUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const generateShortCode = (): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const generateQRCode = async (url: string): Promise<string> => {
    // 使用简单的方法生成QR码（实际应用中可以使用QR库）
    const size = 200;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
    return qrApiUrl;
  };

  const shortenUrl = async () => {
    if (!originalUrl.trim()) {
      setError('请输入要缩短的URL');
      return;
    }

    if (!validateUrl(originalUrl)) {
      setError('请输入有效的URL（必须包含http://或https://）');
      return;
    }

    // 检查自定义代码是否已存在
    if (customCode && shortenedUrls.some(url => url.shortCode === customCode)) {
      setError('自定义代码已存在，请使用其他代码');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const shortCode = customCode || generateShortCode();
      const shortUrl = `https://short.ly/${shortCode}`;
      const qrCode = await generateQRCode(shortUrl);

      const newUrl: ShortenedUrl = {
        id: Date.now().toString(),
        originalUrl,
        shortUrl,
        shortCode,
        createdAt: new Date().toLocaleString('zh-CN'),
        clicks: 0,
        qrCode,
      };

      setShortenedUrls(prev => [newUrl, ...prev]);
      setOriginalUrl('');
      setCustomCode('');
    } catch (err) {
      setError('生成短链接失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const deleteUrl = (id: string) => {
    setShortenedUrls(prev => prev.filter(url => url.id !== id));
  };

  const simulateClick = (id: string) => {
    setShortenedUrls(prev => 
      prev.map(url => 
        url.id === id ? { ...url, clicks: url.clicks + 1 } : url
      )
    );
  };

  const getTotalClicks = () => {
    return shortenedUrls.reduce((total, url) => total + url.clicks, 0);
  };

  const getMostClickedUrl = () => {
    if (shortenedUrls.length === 0) return null;
    return shortenedUrls.reduce((max, url) => url.clicks > max.clicks ? url : max);
  };

  return (
    <ToolLayout>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <Link className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            URL短链生成器
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            将长链接转换为简短易分享的短链接，支持自定义和统计分析
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 生成短链接 */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              生成短链接
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  原始URL *
                </label>
                <input
                  type="url"
                  value={originalUrl}
                  onChange={(e) => setOriginalUrl(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="https://www.example.com/very-long-url-that-needs-shortening"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  自定义代码 (可选)
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 text-sm">
                    short.ly/
                  </span>
                  <input
                    type="text"
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                    className="flex-1 px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-r-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="my-custom-code"
                    maxLength={20}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  只能包含字母和数字，留空则自动生成
                </p>
              </div>

              {error && (
                <div className="flex items-center p-3 text-red-700 bg-red-100 dark:bg-red-900/20 dark:text-red-400 rounded-lg">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {error}
                </div>
              )}

              <button
                onClick={shortenUrl}
                disabled={isLoading}
                className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
              >
                {isLoading ? (
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

          {/* 统计信息 */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                统计概览
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">总链接数</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {shortenedUrls.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">总点击数</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {getTotalClicks()}
                  </span>
                </div>
                {getMostClickedUrl() && (
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      最热门链接
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {getMostClickedUrl()?.shortCode}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {getMostClickedUrl()?.clicks} 次点击
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                💡 使用提示
              </h3>
              <ul className="text-blue-800 dark:text-blue-200 space-y-1 text-sm">
                <li>• 支持自定义短链接代码</li>
                <li>• 自动生成QR码方便分享</li>
                <li>• 本地存储，数据不会丢失</li>
                <li>• 点击统计帮助分析效果</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 链接列表 */}
        {shortenedUrls.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              我的短链接
            </h2>
            
            <div className="space-y-4">
              {shortenedUrls.map((url) => (
                <div key={url.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="text-lg font-medium text-blue-600 dark:text-blue-400">
                          {url.shortUrl}
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => copyToClipboard(url.shortUrl, url.id)}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            title="复制短链接"
                          >
                            {copiedId === url.id ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => simulateClick(url.id)}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            title="访问链接"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 dark:text-gray-400 truncate mb-2">
                        原链接: {url.originalUrl}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>创建时间: {url.createdAt}</span>
                        <span>点击次数: {url.clicks}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {url.qrCode && (
                        <div className="group relative">
                          <button className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                            <QrCode className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          </button>
                          <div className="absolute right-0 top-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-2 shadow-lg">
                              <img src={url.qrCode} alt="QR Code" className="w-32 h-32" />
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <button
                        onClick={() => deleteUrl(url.id)}
                        className="px-3 py-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}