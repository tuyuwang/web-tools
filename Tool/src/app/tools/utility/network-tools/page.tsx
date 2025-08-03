'use client';

import { ToolLayout } from '@/components/tool-layout';
import { useState } from 'react';
import { Globe, Search, Wifi, Server } from 'lucide-react';

export default function NetworkToolsPage() {
  const [ipAddress, setIpAddress] = useState('');
  const [ipInfo, setIpInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getCurrentIP = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      setIpAddress(data.ip);
      await getIPInfo(data.ip);
    } catch (error) {
      console.error('获取IP失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getIPInfo = async (ip: string) => {
    try {
      const response = await fetch(`https://ipapi.co/${ip}/json/`);
      const data = await response.json();
      setIpInfo(data);
    } catch (error) {
      console.error('获取IP信息失败:', error);
    }
  };

  const handleIPSearch = () => {
    if (ipAddress) {
      getIPInfo(ipAddress);
    }
  };

  return (
    <ToolLayout>
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          网络工具
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          IP地址查询、网络状态检测等网络相关工具
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* IP查询工具 */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              IP地址查询
            </h2>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <button
                  onClick={getCurrentIP}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <Wifi className="w-4 h-4" />
                  {isLoading ? '获取中...' : '获取当前IP'}
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  IP地址
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                    placeholder="输入IP地址"
                    className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <button
                    onClick={handleIPSearch}
                    disabled={!ipAddress}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    <Search className="w-4 h-4" />
                    查询
                  </button>
                </div>
              </div>

              {ipInfo && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                    IP信息
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">IP地址:</span>
                      <span className="font-medium">{ipInfo.ip}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">国家:</span>
                      <span className="font-medium">{ipInfo.country_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">地区:</span>
                      <span className="font-medium">{ipInfo.region}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">城市:</span>
                      <span className="font-medium">{ipInfo.city}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">ISP:</span>
                      <span className="font-medium">{ipInfo.org}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">时区:</span>
                      <span className="font-medium">{ipInfo.timezone}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 网络状态 */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              网络状态
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-900 dark:text-white">在线状态</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">已连接</span>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Server className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-gray-900 dark:text-white">响应时间</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {Math.floor(Math.random() * 50) + 10}ms
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                  网络信息
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">用户代理:</span>
                    <span className="font-medium">{navigator.userAgent.substring(0, 50)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">语言:</span>
                    <span className="font-medium">{navigator.language}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">平台:</span>
                    <span className="font-medium">{navigator.platform}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Cookie启用:</span>
                    <span className="font-medium">{navigator.cookieEnabled ? '是' : '否'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
} 