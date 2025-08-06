'use client';

import { useState, useEffect } from 'react';
import { Monitor, Smartphone, Globe, Wifi, Clock, Copy, RefreshCw } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';

interface BrowserInfo {
  browser: {
    name: string;
    version: string;
    userAgent: string;
  };
  device: {
    type: string;
    platform: string;
    language: string;
    languages: string[];
    timezone: string;
    cookieEnabled: boolean;
    doNotTrack: string;
    onlineStatus: boolean;
  };
  screen: {
    width: number;
    height: number;
    availWidth: number;
    availHeight: number;
    colorDepth: number;
    pixelDepth: number;
    devicePixelRatio: number;
    orientation?: string;
  };
  window: {
    innerWidth: number;
    innerHeight: number;
    outerWidth: number;
    outerHeight: number;
  };
  features: {
    localStorage: boolean;
    sessionStorage: boolean;
    indexedDB: boolean;
    webWorkers: boolean;
    serviceWorkers: boolean;
    geolocation: boolean;
    webGL: boolean;
    canvas: boolean;
    webRTC: boolean;
    websockets: boolean;
    pushNotifications: boolean;
    mediaDevices: boolean;
  };
  network: {
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
  };
  performance: {
    memoryUsed?: number;
    memoryLimit?: number;
    timing?: {
      domContentLoaded: number;
      loadComplete: number;
    };
  };
}

export default function BrowserInfoPage() {
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    getBrowserInfo();
  }, []);

  const getBrowserInfo = () => {
    setLoading(true);
    
    // 检测浏览器信息
    const getBrowserName = () => {
      const userAgent = navigator.userAgent;
      if (userAgent.includes('Firefox')) return 'Firefox';
      if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
      if (userAgent.includes('Chrome')) return 'Chrome';
      if (userAgent.includes('Edge')) return 'Edge';
      if (userAgent.includes('Opera')) return 'Opera';
      return 'Unknown';
    };

    const getBrowserVersion = () => {
      const userAgent = navigator.userAgent;
      const browserName = getBrowserName();
      let version = 'Unknown';
      
      switch (browserName) {
        case 'Chrome':
          const chromeMatch = userAgent.match(/Chrome\/(\d+)/);
          version = chromeMatch ? chromeMatch[1] : 'Unknown';
          break;
        case 'Firefox':
          const firefoxMatch = userAgent.match(/Firefox\/(\d+)/);
          version = firefoxMatch ? firefoxMatch[1] : 'Unknown';
          break;
        case 'Safari':
          const safariMatch = userAgent.match(/Version\/(\d+)/);
          version = safariMatch ? safariMatch[1] : 'Unknown';
          break;
        case 'Edge':
          const edgeMatch = userAgent.match(/Edg\/(\d+)/);
          version = edgeMatch ? edgeMatch[1] : 'Unknown';
          break;
      }
      
      return version;
    };

    const getDeviceType = () => {
      const userAgent = navigator.userAgent;
      if (/tablet|ipad|playbook|silk/i.test(userAgent)) return 'Tablet';
      if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) return 'Mobile';
      return 'Desktop';
    };

    // 检测支持的功能
    const checkFeatures = () => {
      return {
        localStorage: typeof Storage !== 'undefined',
        sessionStorage: typeof Storage !== 'undefined',
        indexedDB: 'indexedDB' in window,
        webWorkers: typeof Worker !== 'undefined',
        serviceWorkers: 'serviceWorker' in navigator,
        geolocation: 'geolocation' in navigator,
        webGL: (() => {
          try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && canvas.getContext('webgl'));
          } catch (e) {
            return false;
          }
        })(),
        canvas: (() => {
          try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext && canvas.getContext('2d'));
          } catch (e) {
            return false;
          }
        })(),
        webRTC: !!(navigator as any).getUserMedia || !!(navigator as any).webkitGetUserMedia || !!(navigator as any).mozGetUserMedia || !!(navigator as any).msGetUserMedia,
        websockets: 'WebSocket' in window,
        pushNotifications: 'PushManager' in window,
        mediaDevices: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      };
    };

    // 网络信息
    const getNetworkInfo = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      if (connection) {
        return {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData,
        };
      }
      return {};
    };

    // 性能信息
    const getPerformanceInfo = () => {
      const info: any = {};
      
      // 内存信息
      if ((performance as any).memory) {
        info.memoryUsed = Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024);
        info.memoryLimit = Math.round((performance as any).memory.jsHeapSizeLimit / 1024 / 1024);
      }

      // 页面加载时间
      if (performance.timing) {
        const timing = performance.timing;
        info.timing = {
          domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
          loadComplete: timing.loadEventEnd - timing.navigationStart,
        };
      }

      return info;
    };

    const info: BrowserInfo = {
      browser: {
        name: getBrowserName(),
        version: getBrowserVersion(),
        userAgent: navigator.userAgent,
      },
      device: {
        type: getDeviceType(),
        platform: navigator.platform,
        language: navigator.language,
        languages: Array.from(navigator.languages),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        cookieEnabled: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack || 'Not specified',
        onlineStatus: navigator.onLine,
      },
      screen: {
        width: screen.width,
        height: screen.height,
        availWidth: screen.availWidth,
        availHeight: screen.availHeight,
        colorDepth: screen.colorDepth,
        pixelDepth: screen.pixelDepth,
        devicePixelRatio: window.devicePixelRatio,
        orientation: (screen as any).orientation?.type || 'Unknown',
      },
      window: {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        outerWidth: window.outerWidth,
        outerHeight: window.outerHeight,
      },
      features: checkFeatures(),
      network: getNetworkInfo(),
      performance: getPerformanceInfo(),
    };

    setBrowserInfo(info);
    setLoading(false);
  };

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const generateReport = () => {
    if (!browserInfo) return '';
    
    const report = `浏览器信息报告
================

浏览器信息:
- 浏览器: ${browserInfo.browser.name} ${browserInfo.browser.version}
- User Agent: ${browserInfo.browser.userAgent}

设备信息:
- 设备类型: ${browserInfo.device.type}
- 操作系统: ${browserInfo.device.platform}
- 语言: ${browserInfo.device.language}
- 时区: ${browserInfo.device.timezone}
- Cookie启用: ${browserInfo.device.cookieEnabled ? '是' : '否'}
- 在线状态: ${browserInfo.device.onlineStatus ? '在线' : '离线'}

屏幕信息:
- 屏幕分辨率: ${browserInfo.screen.width} × ${browserInfo.screen.height}
- 可用区域: ${browserInfo.screen.availWidth} × ${browserInfo.screen.availHeight}
- 颜色深度: ${browserInfo.screen.colorDepth} bit
- 设备像素比: ${browserInfo.screen.devicePixelRatio}

窗口信息:
- 内部尺寸: ${browserInfo.window.innerWidth} × ${browserInfo.window.innerHeight}
- 外部尺寸: ${browserInfo.window.outerWidth} × ${browserInfo.window.outerHeight}

功能支持:
- Local Storage: ${browserInfo.features.localStorage ? '✓' : '✗'}
- Session Storage: ${browserInfo.features.sessionStorage ? '✓' : '✗'}
- IndexedDB: ${browserInfo.features.indexedDB ? '✓' : '✗'}
- Web Workers: ${browserInfo.features.webWorkers ? '✓' : '✗'}
- Service Workers: ${browserInfo.features.serviceWorkers ? '✓' : '✗'}
- Geolocation: ${browserInfo.features.geolocation ? '✓' : '✗'}
- WebGL: ${browserInfo.features.webGL ? '✓' : '✗'}
- Canvas: ${browserInfo.features.canvas ? '✓' : '✗'}
- WebRTC: ${browserInfo.features.webRTC ? '✓' : '✗'}
- WebSockets: ${browserInfo.features.websockets ? '✓' : '✗'}

${browserInfo.network.effectiveType ? `网络信息:
- 网络类型: ${browserInfo.network.effectiveType}
- 下载速度: ${browserInfo.network.downlink} Mbps
- 延迟: ${browserInfo.network.rtt} ms
- 省流模式: ${browserInfo.network.saveData ? '开启' : '关闭'}
` : ''}

${browserInfo.performance.memoryUsed ? `性能信息:
- 内存使用: ${browserInfo.performance.memoryUsed} MB / ${browserInfo.performance.memoryLimit} MB
` : ''}

生成时间: ${new Date().toLocaleString()}`;

    return report;
  };

  if (loading) {
    return (
      <ToolLayout>
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              浏览器信息检测
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              正在检测您的浏览器和设备信息...
            </p>
          </div>
          <div className="flex justify-center items-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        </div>
      </ToolLayout>
    );
  }

  return (
    <ToolLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            浏览器信息检测
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            检测并显示您的浏览器、设备和网络详细信息
          </p>
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={getBrowserInfo}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>刷新信息</span>
          </button>
          <button
            onClick={() => copyToClipboard(generateReport(), 'report')}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
          >
            <Copy className="w-4 h-4" />
            <span>{copied === 'report' ? '已复制' : '复制报告'}</span>
          </button>
        </div>

        {browserInfo && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 浏览器信息 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
              <div className="flex items-center space-x-2 mb-4">
                <Globe className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">浏览器信息</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">浏览器:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {browserInfo.browser.name} {browserInfo.browser.version}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">User Agent:</span>
                  <button
                    onClick={() => copyToClipboard(browserInfo.browser.userAgent, 'userAgent')}
                    className="text-blue-500 hover:text-blue-600 flex items-center space-x-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span className="text-xs">{copied === 'userAgent' ? '已复制' : '复制'}</span>
                  </button>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 break-all">
                  {browserInfo.browser.userAgent}
                </div>
              </div>
            </div>

            {/* 设备信息 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
              <div className="flex items-center space-x-2 mb-4">
                {browserInfo.device.type === 'Desktop' ? (
                  <Monitor className="w-5 h-5 text-purple-500" />
                ) : (
                  <Smartphone className="w-5 h-5 text-purple-500" />
                )}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">设备信息</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">设备类型:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{browserInfo.device.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">操作系统:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{browserInfo.device.platform}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">语言:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{browserInfo.device.language}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">时区:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{browserInfo.device.timezone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">在线状态:</span>
                  <span className={`font-medium ${browserInfo.device.onlineStatus ? 'text-green-600' : 'text-red-600'}`}>
                    {browserInfo.device.onlineStatus ? '在线' : '离线'}
                  </span>
                </div>
              </div>
            </div>

            {/* 屏幕信息 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
              <div className="flex items-center space-x-2 mb-4">
                <Monitor className="w-5 h-5 text-green-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">屏幕信息</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">屏幕分辨率:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {browserInfo.screen.width} × {browserInfo.screen.height}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">可用区域:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {browserInfo.screen.availWidth} × {browserInfo.screen.availHeight}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">颜色深度:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{browserInfo.screen.colorDepth} bit</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">设备像素比:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{browserInfo.screen.devicePixelRatio}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">窗口尺寸:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {browserInfo.window.innerWidth} × {browserInfo.window.innerHeight}
                  </span>
                </div>
              </div>
            </div>

            {/* 功能支持 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
              <div className="flex items-center space-x-2 mb-4">
                <Wifi className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">功能支持</h3>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(browserInfo.features).map(([feature, supported]) => (
                  <div key={feature} className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">
                      {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                    </span>
                    <span className={`font-medium ${supported ? 'text-green-600' : 'text-red-600'}`}>
                      {supported ? '✓' : '✗'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 网络信息 */}
            {browserInfo.network.effectiveType && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border lg:col-span-2">
                <div className="flex items-center space-x-2 mb-4">
                  <Wifi className="w-5 h-5 text-cyan-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">网络信息</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {browserInfo.network.effectiveType}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">网络类型</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {browserInfo.network.downlink} Mbps
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">下载速度</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {browserInfo.network.rtt} ms
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">网络延迟</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className={`text-lg font-bold ${browserInfo.network.saveData ? 'text-green-600' : 'text-gray-900 dark:text-white'}`}>
                      {browserInfo.network.saveData ? '开启' : '关闭'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">省流模式</div>
                  </div>
                </div>
              </div>
            )}

            {/* 性能信息 */}
            {browserInfo.performance.memoryUsed && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border lg:col-span-2">
                <div className="flex items-center space-x-2 mb-4">
                  <Clock className="w-5 h-5 text-red-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">性能信息</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {browserInfo.performance.memoryUsed} MB
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      内存使用 / {browserInfo.performance.memoryLimit} MB
                    </div>
                  </div>
                  {browserInfo.performance.timing && (
                    <>
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {browserInfo.performance.timing.domContentLoaded} ms
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">DOM加载时间</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {browserInfo.performance.timing.loadComplete} ms
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">页面加载时间</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}