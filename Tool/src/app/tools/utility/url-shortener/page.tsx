'use client';

import { useState, useCallback } from 'react';
import { Link, Copy, RotateCcw, ExternalLink, BarChart3, Check } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';
import { useToolTranslations } from '@/components/tool-translations';
import { useLanguage } from '@/components/language-provider';
import { resultCache } from '@/lib/tool-cache';
import toast from 'react-hot-toast';

interface ShortenedUrl {
  originalUrl: string;
  shortUrl: string;
  shortCode: string;
  createdAt: Date;
  clicks: number;
}

export default function URLShortenerPage() {
  const [originalUrl, setOriginalUrl] = useState('');
  const [shortenedUrls, setShortenedUrls] = useState<ShortenedUrl[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  const { getToolTranslation, getUITranslation } = useToolTranslations();
  const { t } = useLanguage();
  const toolTranslation = getToolTranslation('utility-url-shortener');
  const ui = getUITranslation();

  // 验证URL格式
  const isValidUrl = useCallback((url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }, []);

  // 生成短代码
  const generateShortCode = useCallback((): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }, []);

  // 缩短URL
  const shortenUrl = useCallback(async () => {
    if (!originalUrl.trim()) {
      toast.error('请输入要缩短的URL');
      return;
    }

    if (!isValidUrl(originalUrl)) {
      toast.error('请输入有效的URL地址');
      return;
    }

    setIsProcessing(true);

    try {
      // 检查缓存
      const cacheKey = `url-shortener:${originalUrl}`;
      const cached = resultCache.get<ShortenedUrl>(cacheKey);
      
      if (cached) {
        setShortenedUrls(prev => [cached, ...prev]);
        toast.success('URL已缩短（来自缓存）');
        setOriginalUrl('');
        return;
      }

      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 500));

      const shortCode = generateShortCode();
      const shortUrl = `https://short.ly/${shortCode}`;
      
      const newShortenedUrl: ShortenedUrl = {
        originalUrl,
        shortUrl,
        shortCode,
        createdAt: new Date(),
        clicks: 0,
      };

      // 存储到缓存
      resultCache.set(cacheKey, newShortenedUrl, 24 * 60 * 60 * 1000); // 24小时

      setShortenedUrls(prev => [newShortenedUrl, ...prev]);
      toast.success('URL缩短成功！');
      setOriginalUrl('');
    } catch (error) {
      console.error('URL缩短失败:', error);
      toast.error('URL缩短失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  }, [originalUrl, isValidUrl, generateShortCode]);

  // 复制到剪贴板
  const copyToClipboard = useCallback(async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      toast.success('已复制到剪贴板');
      
      setTimeout(() => {
        setCopiedIndex(null);
      }, 2000);
    } catch (error) {
      console.error('复制失败:', error);
      toast.error('复制失败');
    }
  }, []);

  // 清空历史记录
  const clearHistory = useCallback(() => {
    setShortenedUrls([]);
    toast.success('历史记录已清空');
  }, []);

  // 模拟点击统计
  const simulateClick = useCallback((index: number) => {
    setShortenedUrls(prev => 
      prev.map((url, i) => 
        i === index ? { ...url, clicks: url.clicks + 1 } : url
      )
    );
    toast.success('点击统计已更新');
  }, []);

  return (
    <ToolLayout
      title="URL短链生成器"
      description="将长链接转换为短链接，方便分享和统计点击量"
      showBreadcrumb
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 输入区域 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                原始URL
              </label>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="url"
                    value={originalUrl}
                    onChange={(e) => setOriginalUrl(e.target.value)}
                    placeholder="https://example.com/very/long/url/that/needs/shortening"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    onKeyPress={(e) => e.key === 'Enter' && shortenUrl()}
                  />
                </div>
                <button
                  onClick={shortenUrl}
                  disabled={isProcessing || !originalUrl.trim()}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isProcessing ? '处理中...' : '缩短链接'}
                </button>
              </div>
            </div>

            {/* URL验证提示 */}
            {originalUrl.trim() && !isValidUrl(originalUrl) && (
              <div className="text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                <span>⚠️ 请输入有效的URL地址（包含 http:// 或 https://）</span>
              </div>
            )}
          </div>
        </div>

        {/* 结果展示 */}
        {shortenedUrls.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                缩短历史 ({shortenedUrls.length})
              </h2>
              <button
                onClick={clearHistory}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                清空历史
              </button>
            </div>

            <div className="space-y-4">
              {shortenedUrls.map((url, index) => (
                <div
                  key={index}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="space-y-3">
                    {/* 短链接 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <Link className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                            {url.shortUrl}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {url.originalUrl}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyToClipboard(url.shortUrl, index)}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                          title="复制短链接"
                        >
                          {copiedIndex === index ? (
                            <Check className="h-5 w-5 text-green-600" />
                          ) : (
                            <Copy className="h-5 w-5" />
                          )}
                        </button>
                        
                        <button
                          onClick={() => window.open(url.originalUrl, '_blank')}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                          title="打开原链接"
                        >
                          <ExternalLink className="h-5 w-5" />
                        </button>
                        
                        <button
                          onClick={() => simulateClick(index)}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          title="模拟点击"
                        >
                          <BarChart3 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* 统计信息 */}
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-4">
                        <span>创建时间: {url.createdAt.toLocaleString()}</span>
                        <span>点击次数: {url.clicks}</span>
                        <span>短代码: {url.shortCode}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 功能说明 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            功能特点
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
            <div className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400">✓</span>
              <span>快速生成短链接</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400">✓</span>
              <span>点击统计功能</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400">✓</span>
              <span>历史记录管理</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400">✓</span>
              <span>一键复制分享</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400">✓</span>
              <span>URL格式验证</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400">✓</span>
              <span>本地缓存优化</span>
            </div>
          </div>
        </div>

        {/* 使用提示 */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            使用说明
          </h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>1. 在输入框中粘贴或输入需要缩短的长链接</p>
            <p>2. 点击"缩短链接"按钮生成短链接</p>
            <p>3. 使用复制按钮将短链接分享给他人</p>
            <p>4. 点击统计按钮可以模拟增加点击次数</p>
            <p>5. 所有生成的短链接都会保存在历史记录中</p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}