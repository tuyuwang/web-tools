'use client';

import { useState, useRef } from 'react';
import { Wifi, Download, Upload, Clock, RefreshCw, Signal, Gauge } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';

interface SpeedTestResult {
  downloadSpeed: number;
  uploadSpeed: number;
  ping: number;
  jitter: number;
  timestamp: Date;
}

interface TestProgress {
  phase: 'idle' | 'ping' | 'download' | 'upload' | 'complete';
  progress: number;
  currentSpeed: number;
}

export default function SpeedTestPage() {
  const [testResult, setTestResult] = useState<SpeedTestResult | null>(null);
  const [testProgress, setTestProgress] = useState<TestProgress>({
    phase: 'idle',
    progress: 0,
    currentSpeed: 0
  });
  const [testing, setTesting] = useState(false);
  const [testHistory, setTestHistory] = useState<SpeedTestResult[]>([]);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  // 测试延迟
  const testPing = async (): Promise<{ ping: number; jitter: number }> => {
    const pingResults: number[] = [];
    const testUrl = 'https://httpbin.org/get?t=' + Date.now();
    
    for (let i = 0; i < 5; i++) {
      const startTime = performance.now();
      try {
        await fetch(testUrl, { 
          method: 'HEAD',
          cache: 'no-cache',
          signal: abortControllerRef.current?.signal 
        });
        const endTime = performance.now();
        pingResults.push(endTime - startTime);
        setTestProgress(prev => ({ 
          ...prev, 
          progress: ((i + 1) / 5) * 100 
        }));
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw error;
        }
        pingResults.push(1000); // 默认1秒超时
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const avgPing = pingResults.reduce((sum, ping) => sum + ping, 0) / pingResults.length;
    const jitter = Math.sqrt(
      pingResults.reduce((sum, ping) => sum + Math.pow(ping - avgPing, 2), 0) / pingResults.length
    );

    return { ping: avgPing, jitter };
  };

  // 测试下载速度
  const testDownloadSpeed = async (): Promise<number> => {
    const testSizes = [
      { size: 1024 * 100, url: 'https://httpbin.org/bytes/102400' },      // 100KB
      { size: 1024 * 500, url: 'https://httpbin.org/bytes/512000' },      // 500KB
      { size: 1024 * 1024, url: 'https://httpbin.org/bytes/1048576' },    // 1MB
    ];

    let totalBytes = 0;
    let totalTime = 0;
    
    for (let i = 0; i < testSizes.length; i++) {
      const testSize = testSizes[i];
      const startTime = performance.now();
      
      try {
        const response = await fetch(testSize.url + '?t=' + Date.now(), {
          signal: abortControllerRef.current?.signal
        });
        
        if (!response.body) continue;
        
        const reader = response.body.getReader();
        let receivedBytes = 0;
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          receivedBytes += value.length;
          const elapsedTime = performance.now() - startTime;
          const currentSpeed = (receivedBytes * 8) / (elapsedTime / 1000) / (1024 * 1024); // Mbps
          
          setTestProgress(prev => ({
            ...prev,
            progress: ((i * 100) + (receivedBytes / testSize.size) * 100) / testSizes.length,
            currentSpeed
          }));
        }
        
        const endTime = performance.now();
        totalBytes += receivedBytes;
        totalTime += (endTime - startTime);
        
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw error;
        }
        console.error('Download test error:', error);
      }
    }

    // 返回 Mbps
    return totalBytes > 0 ? (totalBytes * 8) / (totalTime / 1000) / (1024 * 1024) : 0;
  };

  // 测试上传速度
  const testUploadSpeed = async (): Promise<number> => {
    const testSizes = [
      { size: 1024 * 50, data: new ArrayBuffer(1024 * 50) },      // 50KB
      { size: 1024 * 100, data: new ArrayBuffer(1024 * 100) },    // 100KB
      { size: 1024 * 200, data: new ArrayBuffer(1024 * 200) },    // 200KB
    ];

    let totalBytes = 0;
    let totalTime = 0;

    for (let i = 0; i < testSizes.length; i++) {
      const testSize = testSizes[i];
      const startTime = performance.now();
      
      try {
        const response = await fetch('https://httpbin.org/post', {
          method: 'POST',
          body: testSize.data,
          signal: abortControllerRef.current?.signal
        });
        
        await response.json(); // 确保完全上传
        
        const endTime = performance.now();
        const elapsedTime = endTime - startTime;
        const currentSpeed = (testSize.size * 8) / (elapsedTime / 1000) / (1024 * 1024); // Mbps
        
        totalBytes += testSize.size;
        totalTime += elapsedTime;
        
        setTestProgress(prev => ({
          ...prev,
          progress: ((i + 1) / testSizes.length) * 100,
          currentSpeed
        }));
        
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw error;
        }
        console.error('Upload test error:', error);
      }
    }

    return totalBytes > 0 ? (totalBytes * 8) / (totalTime / 1000) / (1024 * 1024) : 0;
  };

  // 开始速度测试
  const startSpeedTest = async () => {
    setTesting(true);
    setTestProgress({ phase: 'ping', progress: 0, currentSpeed: 0 });
    abortControllerRef.current = new AbortController();

    try {
      // 测试延迟
      setTestProgress(prev => ({ ...prev, phase: 'ping' }));
      const { ping, jitter } = await testPing();

      // 测试下载速度
      setTestProgress(prev => ({ ...prev, phase: 'download', progress: 0, currentSpeed: 0 }));
      const downloadSpeed = await testDownloadSpeed();

      // 测试上传速度
      setTestProgress(prev => ({ ...prev, phase: 'upload', progress: 0, currentSpeed: 0 }));
      const uploadSpeed = await testUploadSpeed();

      // 完成测试
      const result: SpeedTestResult = {
        downloadSpeed,
        uploadSpeed,
        ping,
        jitter,
        timestamp: new Date()
      };

      setTestResult(result);
      setTestHistory(prev => [result, ...prev.slice(0, 9)]); // 保留最近10次测试
      setTestProgress({ phase: 'complete', progress: 100, currentSpeed: 0 });

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('测试已取消');
      } else {
        console.error('测试失败:', error);
      }
    } finally {
      setTesting(false);
    }
  };

  // 停止测试
  const stopTest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setTesting(false);
    setTestProgress({ phase: 'idle', progress: 0, currentSpeed: 0 });
  };

  // 获取速度质量评级
  const getSpeedRating = (speed: number, type: 'download' | 'upload') => {
    const thresholds = type === 'download' 
      ? { excellent: 100, good: 50, fair: 25, poor: 10 }
      : { excellent: 50, good: 25, fair: 10, poor: 5 };

    if (speed >= thresholds.excellent) return { rating: '优秀', color: 'text-green-600 dark:text-green-400' };
    if (speed >= thresholds.good) return { rating: '良好', color: 'text-blue-600 dark:text-blue-400' };
    if (speed >= thresholds.fair) return { rating: '一般', color: 'text-yellow-600 dark:text-yellow-400' };
    if (speed >= thresholds.poor) return { rating: '较差', color: 'text-orange-600 dark:text-orange-400' };
    return { rating: '很差', color: 'text-red-600 dark:text-red-400' };
  };

  // 获取延迟质量评级
  const getPingRating = (ping: number) => {
    if (ping < 20) return { rating: '优秀', color: 'text-green-600 dark:text-green-400' };
    if (ping < 50) return { rating: '良好', color: 'text-blue-600 dark:text-blue-400' };
    if (ping < 100) return { rating: '一般', color: 'text-yellow-600 dark:text-yellow-400' };
    if (ping < 200) return { rating: '较差', color: 'text-orange-600 dark:text-orange-400' };
    return { rating: '很差', color: 'text-red-600 dark:text-red-400' };
  };

  const formatSpeed = (speed: number) => {
    if (speed >= 1000) {
      return `${(speed / 1000).toFixed(2)} Gbps`;
    }
    return `${speed.toFixed(2)} Mbps`;
  };

  const getPhaseText = (phase: string) => {
    switch (phase) {
      case 'ping': return '测试延迟中...';
      case 'download': return '测试下载速度中...';
      case 'upload': return '测试上传速度中...';
      case 'complete': return '测试完成';
      default: return '准备测试';
    }
  };

  return (
    <ToolLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            网络速度测试
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            测试您的网络下载速度、上传速度和延迟
          </p>
        </div>

        {/* 主测试区域 */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm border">
          <div className="text-center space-y-6">
            {/* 测试按钮 */}
            {!testing ? (
              <button
                onClick={startSpeedTest}
                className="bg-blue-500 hover:bg-blue-600 text-white text-lg font-medium py-4 px-8 rounded-lg transition-colors flex items-center justify-center space-x-3 mx-auto"
              >
                <Gauge className="w-6 h-6" />
                <span>开始测试</span>
              </button>
            ) : (
              <div className="space-y-4">
                <button
                  onClick={stopTest}
                  className="bg-red-500 hover:bg-red-600 text-white text-lg font-medium py-4 px-8 rounded-lg transition-colors flex items-center justify-center space-x-3 mx-auto"
                >
                  <RefreshCw className="w-6 h-6" />
                  <span>停止测试</span>
                </button>
                
                {/* 测试进度 */}
                <div className="space-y-2">
                  <div className="text-lg text-gray-900 dark:text-white">
                    {getPhaseText(testProgress.phase)}
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${testProgress.progress}%` }}
                    />
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {testProgress.progress.toFixed(1)}%
                  </div>
                  {testProgress.currentSpeed > 0 && (
                    <div className="text-lg font-medium text-blue-600 dark:text-blue-400">
                      当前速度: {formatSpeed(testProgress.currentSpeed)}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 测试结果 */}
        {testResult && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 下载速度 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border text-center">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <Download className="w-5 h-5 text-green-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">下载速度</h3>
              </div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                {formatSpeed(testResult.downloadSpeed)}
              </div>
              <div className={`text-sm ${getSpeedRating(testResult.downloadSpeed, 'download').color}`}>
                {getSpeedRating(testResult.downloadSpeed, 'download').rating}
              </div>
            </div>

            {/* 上传速度 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border text-center">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <Upload className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">上传速度</h3>
              </div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {formatSpeed(testResult.uploadSpeed)}
              </div>
              <div className={`text-sm ${getSpeedRating(testResult.uploadSpeed, 'upload').color}`}>
                {getSpeedRating(testResult.uploadSpeed, 'upload').rating}
              </div>
            </div>

            {/* 延迟 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border text-center">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <Clock className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">延迟</h3>
              </div>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                {testResult.ping.toFixed(0)} ms
              </div>
              <div className={`text-sm ${getPingRating(testResult.ping).color}`}>
                {getPingRating(testResult.ping).rating}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                抖动: {testResult.jitter.toFixed(1)} ms
              </div>
            </div>
          </div>
        )}

        {/* 网络状态信息 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <Signal className="w-5 h-5 text-purple-500" />
            <span>网络信息</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">连接类型:</span>
              <div className="font-medium text-gray-900 dark:text-white">
                {(navigator as any).connection?.effectiveType?.toUpperCase() || '未知'}
              </div>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">在线状态:</span>
              <div className={`font-medium ${navigator.onLine ? 'text-green-600' : 'text-red-600'}`}>
                {navigator.onLine ? '在线' : '离线'}
              </div>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">用户代理:</span>
              <div className="font-medium text-gray-900 dark:text-white text-xs break-all">
                {navigator.userAgent.split(' ')[0]}
              </div>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">测试时间:</span>
              <div className="font-medium text-gray-900 dark:text-white">
                {testResult ? testResult.timestamp.toLocaleTimeString() : '-'}
              </div>
            </div>
          </div>
        </div>

        {/* 测试历史 */}
        {testHistory.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">测试历史</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 text-gray-600 dark:text-gray-400">时间</th>
                    <th className="text-right py-2 text-gray-600 dark:text-gray-400">下载速度</th>
                    <th className="text-right py-2 text-gray-600 dark:text-gray-400">上传速度</th>
                    <th className="text-right py-2 text-gray-600 dark:text-gray-400">延迟</th>
                  </tr>
                </thead>
                <tbody>
                  {testHistory.slice(0, 5).map((result, index) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-2 text-gray-900 dark:text-white">
                        {result.timestamp.toLocaleString()}
                      </td>
                      <td className="py-2 text-right text-gray-900 dark:text-white">
                        {formatSpeed(result.downloadSpeed)}
                      </td>
                      <td className="py-2 text-right text-gray-900 dark:text-white">
                        {formatSpeed(result.uploadSpeed)}
                      </td>
                      <td className="py-2 text-right text-gray-900 dark:text-white">
                        {result.ping.toFixed(0)} ms
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 说明信息 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-3">测试说明</h3>
          <div className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
            <p>• 测试结果可能受到服务器位置、网络拥堵等因素影响</p>
            <p>• 建议在不同时间多次测试以获得更准确的结果</p>
            <p>• 下载速度通常比上传速度更高，这是正常现象</p>
            <p>• 延迟（Ping）值越低表示网络响应越快</p>
            <p>• 测试会消耗一定流量，请在WiFi环境下进行</p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}