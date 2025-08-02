'use client';

import { useState } from 'react';
import { Send, RotateCcw, Copy, Clock, CheckCircle, XCircle } from 'lucide-react';

interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  time: number;
}

interface RequestHistory {
  id: string;
  method: string;
  url: string;
  timestamp: Date;
}

export default function ApiTestPage() {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/posts/1');
  const [headers, setHeaders] = useState('{\n  "Content-Type": "application/json"\n}');
  const [body, setBody] = useState('');
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<RequestHistory[]>([]);

  const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

  const sendRequest = async () => {
    if (!url.trim()) {
      setError('请输入URL');
      return;
    }

    setLoading(true);
    setError('');
    setResponse(null);

    try {
      const startTime = Date.now();
      
      // 解析请求头
      let parsedHeaders: Record<string, string> = {};
      try {
        parsedHeaders = JSON.parse(headers);
      } catch (e) {
        setError('请求头格式错误，请检查JSON格式');
        setLoading(false);
        return;
      }

      // 构建请求选项
      const options: RequestInit = {
        method,
        headers: parsedHeaders,
      };

      // 添加请求体
      if (['POST', 'PUT', 'PATCH'].includes(method) && body.trim()) {
        options.body = body;
      }

      // 发送请求
      const response = await fetch(url, options);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // 获取响应头
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      // 获取响应数据
      let responseData;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      const apiResponse: ApiResponse = {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        data: responseData,
        time: responseTime
      };

      setResponse(apiResponse);

      // 添加到历史记录
      const historyItem: RequestHistory = {
        id: Date.now().toString(),
        method,
        url,
        timestamp: new Date()
      };
      setHistory(prev => [historyItem, ...prev.slice(0, 9)]); // 保留最近10条

    } catch (err) {
      setError(err instanceof Error ? err.message : '请求失败');
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setUrl('');
    setHeaders('{\n  "Content-Type": "application/json"\n}');
    setBody('');
    setResponse(null);
    setError('');
  };

  const copyResponse = async () => {
    if (response && navigator.clipboard) {
      const responseText = JSON.stringify(response.data, null, 2);
      await navigator.clipboard.writeText(responseText);
    }
  };

  const loadFromHistory = (item: RequestHistory) => {
    setMethod(item.method);
    setUrl(item.url);
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600';
    if (status >= 300 && status < 400) return 'text-blue-600';
    if (status >= 400 && status < 500) return 'text-yellow-600';
    if (status >= 500) return 'text-red-600';
    return 'text-gray-600';
  };

  const getStatusIcon = (status: number) => {
    if (status >= 200 && status < 300) return <CheckCircle className="w-4 h-4 text-green-600" />;
    return <XCircle className="w-4 h-4 text-red-600" />;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          API测试工具
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          测试API接口，发送HTTP请求并查看响应结果
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 请求配置 */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              请求配置
            </h2>

            <div className="space-y-4">
              {/* 请求方法和URL */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    请求方法
                  </label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    {methods.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    URL
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://api.example.com/endpoint"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* 请求头 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  请求头 (JSON格式)
                </label>
                <textarea
                  value={headers}
                  onChange={(e) => setHeaders(e.target.value)}
                  rows={4}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 请求体 */}
              {['POST', 'PUT', 'PATCH'].includes(method) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    请求体
                  </label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="输入请求体内容..."
                    rows={6}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={sendRequest}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {loading ? '发送中...' : '发送请求'}
                </button>
                <button
                  onClick={clearAll}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  清空
                </button>
              </div>

              {/* 错误信息 */}
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* 响应结果 */}
          {response && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  响应结果
                </h2>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(response.status)}
                    <span className={`text-sm font-medium ${getStatusColor(response.status)}`}>
                      {response.status} {response.statusText}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    {response.time}ms
                  </div>
                  <button
                    onClick={copyResponse}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    复制
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {/* 响应头 */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    响应头
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg max-h-32 overflow-y-auto">
                    <pre className="text-xs font-mono text-gray-900 dark:text-white">
                      {Object.entries(response.headers).map(([key, value]) => `${key}: ${value}`).join('\n')}
                    </pre>
                  </div>
                </div>

                {/* 响应数据 */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    响应数据
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg max-h-96 overflow-y-auto">
                    <pre className="text-xs font-mono text-gray-900 dark:text-white">
                      {typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 历史记录 */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              请求历史
            </h2>
            
            {history.length > 0 ? (
              <div className="space-y-2">
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => loadFromHistory(item)}
                    className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                        {item.method}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {item.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-700 dark:text-gray-300 mt-1 truncate">
                      {item.url}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Send className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">暂无请求历史</p>
              </div>
            )}
          </div>

          {/* 快速示例 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              快速示例
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setMethod('GET');
                  setUrl('https://jsonplaceholder.typicode.com/posts/1');
                  setHeaders('{\n  "Content-Type": "application/json"\n}');
                  setBody('');
                }}
                className="w-full p-2 text-left text-sm bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded transition-colors"
              >
                JSONPlaceholder API
              </button>
              <button
                onClick={() => {
                  setMethod('POST');
                  setUrl('https://jsonplaceholder.typicode.com/posts');
                  setHeaders('{\n  "Content-Type": "application/json"\n}');
                  setBody('{\n  "title": "测试标题",\n  "body": "测试内容",\n  "userId": 1\n}');
                }}
                className="w-full p-2 text-left text-sm bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded transition-colors"
              >
                POST 请求示例
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 