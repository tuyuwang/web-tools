'use client';

import { useState } from 'react';
import { Send, RotateCcw, Copy, Clock, CheckCircle, XCircle, Plus, Minus, Settings, Save, FileText } from 'lucide-react';
import { useToolTranslations } from '@/components/tool-translations';
import { useLanguage } from '@/components/language-provider';

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

interface UrlParam {
  key: string;
  value: string;
  enabled: boolean;
}

interface HeaderParam {
  key: string;
  value: string;
  enabled: boolean;
}

interface FormDataParam {
  key: string;
  value: string;
  type: 'text' | 'file';
  enabled: boolean;
}

interface Environment {
  id: string;
  name: string;
  variables: Record<string, string>;
}

interface RequestPreset {
  id: string;
  name: string;
  method: string;
  url: string;
  params: UrlParam[];
  headers: HeaderParam[];
  body: string;
}

export default function ApiTestPage() {
  const { getToolTranslation, getUITranslation, getToolPageTranslation } = useToolTranslations();
  const { t } = useLanguage();
  const toolTranslation = getToolTranslation('dev-api');
  const ui = getUITranslation();
  const pageTranslation = getToolPageTranslation('dev-api');
  
  const [method, setMethod] = useState('GET');
  const [baseUrl, setBaseUrl] = useState('{{baseUrl}}/posts/1');
  const [urlParams, setUrlParams] = useState<UrlParam[]>([]);
  const [headerParams, setHeaderParams] = useState<HeaderParam[]>([
    { key: 'Content-Type', value: 'application/json', enabled: true }
  ]);
  const [body, setBody] = useState('');
  const [bodyFormat, setBodyFormat] = useState<'json' | 'xml' | 'text' | 'form'>('json');
  const [formDataParams, setFormDataParams] = useState<FormDataParam[]>([]);
  const [environments, setEnvironments] = useState<Environment[]>([
    { id: 'demo', name: 'JSONPlaceholder Demo', variables: { baseUrl: 'https://jsonplaceholder.typicode.com', apiKey: 'demo-key-123' } },
    { id: 'dev', name: '开发环境', variables: { baseUrl: 'https://api-dev.example.com', apiKey: 'dev-key-123' } },
    { id: 'prod', name: '生产环境', variables: { baseUrl: 'https://api.example.com', apiKey: 'prod-key-456' } }
  ]);
  const [selectedEnv, setSelectedEnv] = useState<string>('demo');
  const [showEnvModal, setShowEnvModal] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<RequestHistory[]>([]);
  const [presets, setPresets] = useState<RequestPreset[]>([
    {
      id: 'sample-get',
      name: 'JSONPlaceholder 获取用户',
      method: 'GET',
      url: '{{baseUrl}}/users/1',
      params: [{ key: 'fields', value: 'name,email', enabled: true }],
      headers: [{ key: 'Accept', value: 'application/json', enabled: true }],
      body: ''
    },
    {
      id: 'sample-post',
      name: 'JSONPlaceholder 创建文章',
      method: 'POST',
      url: '{{baseUrl}}/posts',
      params: [],
      headers: [
        { key: 'Content-Type', value: 'application/json', enabled: true },
        { key: 'Authorization', value: 'Bearer {{apiKey}}', enabled: true }
      ],
      body: '{\n  "title": "新文章标题",\n  "body": "文章内容",\n  "userId": 1\n}'
    }
  ]);
  const [showPresets, setShowPresets] = useState(false);
  const [presetName, setPresetName] = useState('');

  const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

  // 添加表单数据参数
  const addFormDataParam = () => {
    setFormDataParams(prev => [...prev, { key: '', value: '', type: 'text', enabled: true }]);
  };

  // 删除表单数据参数
  const removeFormDataParam = (index: number) => {
    setFormDataParams(prev => prev.filter((_, i) => i !== index));
  };

  // 更新表单数据参数
  const updateFormDataParam = (index: number, field: keyof FormDataParam, value: string | boolean) => {
    setFormDataParams(prev => prev.map((param, i) => 
      i === index ? { ...param, [field]: value } : param
    ));
  };

  // 替换环境变量
  const replaceEnvironmentVariables = (text: string): string => {
    if (!selectedEnv) return text;
    
    const env = environments.find(e => e.id === selectedEnv);
    if (!env) return text;

    let result = text;
    Object.entries(env.variables).forEach(([key, value]) => {
      const pattern = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(pattern, value);
    });
    
    return result;
  };

  // 构建完整的URL（支持环境变量）
  const buildFullUrl = () => {
    const processedBaseUrl = replaceEnvironmentVariables(baseUrl);
    const enabledParams = urlParams.filter(param => param.enabled && param.key.trim());
    if (enabledParams.length === 0) return processedBaseUrl;
    
    const queryString = enabledParams
      .map(param => {
        const key = replaceEnvironmentVariables(param.key);
        const value = replaceEnvironmentVariables(param.value);
        return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      })
      .join('&');
    
    const separator = processedBaseUrl.includes('?') ? '&' : '?';
    return `${processedBaseUrl}${separator}${queryString}`;
  };

  // 添加URL参数
  const addUrlParam = () => {
    setUrlParams(prev => [...prev, { key: '', value: '', enabled: true }]);
  };

  // 删除URL参数
  const removeUrlParam = (index: number) => {
    setUrlParams(prev => prev.filter((_, i) => i !== index));
  };

  // 更新URL参数
  const updateUrlParam = (index: number, field: keyof UrlParam, value: string | boolean) => {
    setUrlParams(prev => prev.map((param, i) => 
      i === index ? { ...param, [field]: value } : param
    ));
  };

  // 添加请求头
  const addHeader = () => {
    setHeaderParams(prev => [...prev, { key: '', value: '', enabled: true }]);
  };

  // 删除请求头
  const removeHeader = (index: number) => {
    setHeaderParams(prev => prev.filter((_, i) => i !== index));
  };

  // 更新请求头
  const updateHeader = (index: number, field: keyof HeaderParam, value: string | boolean) => {
    setHeaderParams(prev => prev.map((header, i) => 
      i === index ? { ...header, [field]: value } : header
    ));
  };

  // 保存为预设
  const saveAsPreset = () => {
    if (!presetName.trim()) return;
    
    const preset: RequestPreset = {
      id: Date.now().toString(),
      name: presetName,
      method,
      url: baseUrl,
      params: urlParams,
      headers: headerParams,
      body
    };
    
    setPresets(prev => [...prev, preset]);
    setPresetName('');
  };

  // 加载预设
  const loadPreset = (preset: RequestPreset) => {
    setMethod(preset.method);
    setBaseUrl(preset.url);
    setUrlParams(preset.params);
    setHeaderParams(preset.headers);
    setBody(preset.body);
    setShowPresets(false);
  };

  // 删除预设
  const deletePreset = (id: string) => {
    setPresets(prev => prev.filter(preset => preset.id !== id));
  };

  // 格式化请求体
  const formatBody = () => {
    if (!body.trim()) return;
    
    try {
      if (bodyFormat === 'json') {
        const formatted = JSON.stringify(JSON.parse(body), null, 2);
        setBody(formatted);
      } else if (bodyFormat === 'xml') {
        // 简单的XML格式化
        const formatted = body.replace(/></g, '>\n<');
        setBody(formatted);
      }
    } catch (e) {
      setError(`${bodyFormat.toUpperCase()}格式错误，无法格式化`);
    }
  };

  // 构建请求体
  const buildRequestBody = () => {
    if (bodyFormat === 'form') {
      const formData = new FormData();
      formDataParams
        .filter(param => param.enabled && param.key.trim())
        .forEach(param => {
          const key = replaceEnvironmentVariables(param.key);
          const value = replaceEnvironmentVariables(param.value);
          formData.append(key, value);
        });
      return formData;
    } else {
      return replaceEnvironmentVariables(body);
    }
  };

  const sendRequest = async () => {
    const fullUrl = buildFullUrl();
    
    if (!fullUrl.trim()) {
      setError('请输入有效的URL');
      return;
    }

    setLoading(true);
    setError('');
    setResponse(null);

    try {
      const startTime = Date.now();
      
      // 构建请求头
      const requestHeaders: Record<string, string> = {};
      headerParams
        .filter(header => header.enabled && header.key.trim())
        .forEach(header => {
          const key = replaceEnvironmentVariables(header.key);
          const value = replaceEnvironmentVariables(header.value);
          requestHeaders[key] = value;
        });

      // 构建请求选项
      const options: RequestInit = {
        method,
        headers: requestHeaders,
      };

      // 添加请求体
      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        const requestBody = buildRequestBody();
        if (requestBody instanceof FormData) {
          // FormData会自动设置Content-Type
          delete requestHeaders['Content-Type'];
          options.body = requestBody;
        } else if (requestBody && requestBody.toString().trim()) {
          options.body = requestBody.toString();
        }
      }

      // 重新设置headers（排除被删除的Content-Type）
      options.headers = requestHeaders;

      // 发送请求
      const response = await fetch(fullUrl, options);
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
        url: fullUrl,
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
    setBaseUrl('');
    setUrlParams([]);
    setHeaderParams([{ key: 'Content-Type', value: 'application/json', enabled: true }]);
    setBody('');
    setFormDataParams([]);
    setResponse(null);
    setError('');
  };

  const copyResponse = async () => {
    if (response && navigator.clipboard) {
      const responseText = JSON.stringify(response, null, 2);
      await navigator.clipboard.writeText(responseText);
    }
  };

  const loadFromHistory = (item: RequestHistory) => {
    try {
      const url = new URL(item.url);
      setBaseUrl(`${url.protocol}//${url.host}${url.pathname}`);
      setMethod(item.method);
      
      // 解析URL参数
      const params: UrlParam[] = [];
      url.searchParams.forEach((value, key) => {
        params.push({ key, value, enabled: true });
      });
      setUrlParams(params);
    } catch (e) {
      setBaseUrl(item.url);
      setMethod(item.method);
      setUrlParams([]);
    }
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600';
    if (status >= 300 && status < 400) return 'text-blue-600';
    if (status >= 400 && status < 500) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (status: number) => {
    if (status >= 200 && status < 300) return <CheckCircle className="w-4 h-4" />;
    return <XCircle className="w-4 h-4" />;
  };

  // 生成请求代码
  const generateCode = (language: 'curl' | 'javascript' | 'python') => {
    const fullUrl = buildFullUrl();
    const enabledHeaders = headerParams.filter(h => h.enabled && h.key.trim());
    
    switch (language) {
      case 'curl':
        let curlCommand = `curl -X ${method} "${fullUrl}"`;
        enabledHeaders.forEach(header => {
          curlCommand += ` \\\n  -H "${header.key}: ${header.value}"`;
        });
        if (['POST', 'PUT', 'PATCH'].includes(method) && body.trim()) {
          curlCommand += ` \\\n  -d '${body}'`;
        }
        return curlCommand;
      
      case 'javascript':
        const jsHeaders = enabledHeaders.length > 0 
          ? `  headers: {\n${enabledHeaders.map(h => `    '${h.key}': '${h.value}'`).join(',\n')}\n  },`
          : '';
        const jsBody = (['POST', 'PUT', 'PATCH'].includes(method) && body.trim()) 
          ? `  body: ${JSON.stringify(body)},`
          : '';
        return `fetch('${fullUrl}', {
  method: '${method}',${jsHeaders}${jsBody}
})
.then(response => response.json())
.then(data => console.log(data));`;
      
      case 'python':
        const pyHeaders = enabledHeaders.length > 0 
          ? `headers = {\n${enabledHeaders.map(h => `    '${h.key}': '${h.value}'`).join(',\n')}\n}`
          : 'headers = {}';
        const pyBody = (['POST', 'PUT', 'PATCH'].includes(method) && body.trim()) 
          ? `, data=${JSON.stringify(body)}`
          : '';
        return `import requests

${pyHeaders}

response = requests.${method.toLowerCase()}('${fullUrl}', headers=headers${pyBody})
print(response.json())`;
      
      default:
        return '';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          API测试工具
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          专业级API测试工具，支持参数管理、请求预设和完整的HTTP方法
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* 请求配置 */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                请求配置
              </h2>
              <div className="flex gap-2">
                <select
                  value={selectedEnv}
                  onChange={(e) => setSelectedEnv(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">选择环境</option>
                  {environments.map(env => (
                    <option key={env.id} value={env.id}>{env.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => setShowPresets(!showPresets)}
                  className="px-3 py-2 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {/* HTTP方法和URL */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    HTTP方法
                  </label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {methods.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                                 <div className="md:col-span-3">
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                     基础URL
                     {selectedEnv && (
                       <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                         (使用 {environments.find(e => e.id === selectedEnv)?.name} 环境变量)
                       </span>
                     )}
                   </label>
                   <input
                     type="url"
                     value={baseUrl}
                     onChange={(e) => setBaseUrl(e.target.value)}
                     placeholder="请输入基础API地址，支持环境变量：{{baseUrl}}"
                     className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   />
                 </div>
              </div>

              {/* 完整URL显示 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  完整URL
                </label>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg">
                  <code className="text-sm text-gray-900 dark:text-white break-all">
                    {buildFullUrl()}
                  </code>
                </div>
              </div>

              {/* URL参数 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    URL参数
                  </label>
                  <button
                    onClick={addUrlParam}
                    className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    添加参数
                  </button>
                </div>
                
                {urlParams.length > 0 && (
                  <div className="space-y-2">
                    {urlParams.map((param, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={param.enabled}
                          onChange={(e) => updateUrlParam(index, 'enabled', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          value={param.key}
                          onChange={(e) => updateUrlParam(index, 'key', e.target.value)}
                          placeholder="参数名"
                          className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        />
                        <input
                          type="text"
                          value={param.value}
                          onChange={(e) => updateUrlParam(index, 'value', e.target.value)}
                          placeholder="参数值"
                          className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        />
                        <button
                          onClick={() => removeUrlParam(index)}
                          className="p-2 text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {urlParams.length === 0 && (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                    点击"添加参数"开始添加URL参数
                  </div>
                )}
              </div>

              {/* 请求头 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    请求头
                  </label>
                  <button
                    onClick={addHeader}
                    className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    添加头部
                  </button>
                </div>
                
                <div className="space-y-2">
                  {headerParams.map((header, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={header.enabled}
                        onChange={(e) => updateHeader(index, 'enabled', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={header.key}
                        onChange={(e) => updateHeader(index, 'key', e.target.value)}
                        placeholder="头部名称"
                        className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      />
                      <input
                        type="text"
                        value={header.value}
                        onChange={(e) => updateHeader(index, 'value', e.target.value)}
                        placeholder="头部值"
                        className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      />
                      <button
                        onClick={() => removeHeader(index)}
                        className="p-2 text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

                             {/* 请求体 */}
               {['POST', 'PUT', 'PATCH'].includes(method) && (
                 <div>
                   <div className="flex items-center justify-between mb-3">
                     <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                       请求体
                     </label>
                     <div className="flex items-center gap-2">
                       <select
                         value={bodyFormat}
                         onChange={(e) => setBodyFormat(e.target.value as any)}
                         className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                       >
                         <option value="json">JSON</option>
                         <option value="xml">XML</option>
                         <option value="text">Text</option>
                         <option value="form">Form Data</option>
                       </select>
                       {bodyFormat !== 'form' && (
                         <button
                           onClick={formatBody}
                           className="px-3 py-1 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                         >
                           格式化
                         </button>
                       )}
                     </div>
                   </div>
                   
                   {bodyFormat === 'form' ? (
                     <div className="space-y-2">
                       <div className="flex items-center justify-between mb-3">
                         <span className="text-sm text-gray-600 dark:text-gray-400">表单数据</span>
                         <button
                           onClick={addFormDataParam}
                           className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-1"
                         >
                           <Plus className="w-4 h-4" />
                           添加字段
                         </button>
                       </div>
                       
                       {formDataParams.length > 0 ? (
                         <div className="space-y-2">
                           {formDataParams.map((param, index) => (
                             <div key={index} className="flex items-center gap-2">
                               <input
                                 type="checkbox"
                                 checked={param.enabled}
                                 onChange={(e) => updateFormDataParam(index, 'enabled', e.target.checked)}
                                 className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                               />
                               <input
                                 type="text"
                                 value={param.key}
                                 onChange={(e) => updateFormDataParam(index, 'key', e.target.value)}
                                 placeholder="字段名"
                                 className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                               />
                               <select
                                 value={param.type}
                                 onChange={(e) => updateFormDataParam(index, 'type', e.target.value)}
                                 className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                               >
                                 <option value="text">文本</option>
                                 <option value="file">文件</option>
                               </select>
                               <input
                                 type={param.type === 'file' ? 'file' : 'text'}
                                 value={param.type === 'file' ? '' : param.value}
                                 onChange={(e) => updateFormDataParam(index, 'value', e.target.value)}
                                 placeholder="字段值"
                                 className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                               />
                               <button
                                 onClick={() => removeFormDataParam(index)}
                                 className="p-2 text-red-500 hover:text-red-700 transition-colors"
                               >
                                 <Minus className="w-4 h-4" />
                               </button>
                             </div>
                           ))}
                         </div>
                       ) : (
                         <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                           点击"添加字段"开始添加表单数据
                         </div>
                       )}
                     </div>
                   ) : (
                     <textarea
                       value={body}
                       onChange={(e) => setBody(e.target.value)}
                       placeholder={`请输入${bodyFormat.toUpperCase()}格式的请求体内容。支持环境变量：{{变量名}}`}
                       className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                     />
                   )}
                 </div>
               )}

              {/* 保存预设 */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder="预设名称"
                  className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
                <button
                  onClick={saveAsPreset}
                  disabled={!presetName.trim()}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
                >
                  <Save className="w-4 h-4" />
                  保存预设
                </button>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-2">
                <button
                  onClick={sendRequest}
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      发送中...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      发送请求
                    </>
                  )}
                </button>
                <button
                  onClick={clearAll}
                  className="px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 侧边栏：预设和历史记录 */}
        <div className="space-y-6">
          {/* 预设管理 */}
          {showPresets && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                请求预设
              </h3>
              {presets.length > 0 ? (
                <div className="space-y-2">
                  {presets.map((preset) => (
                    <div
                      key={preset.id}
                      className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div
                          onClick={() => loadPreset(preset)}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="font-medium text-gray-900 dark:text-white text-sm">
                            {preset.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {preset.method} {preset.url}
                          </div>
                        </div>
                        <button
                          onClick={() => deletePreset(preset.id)}
                          className="p-1 text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                  暂无预设
                </div>
              )}
            </div>
          )}

          {/* 历史记录 */}
          {history.length > 0 && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                历史记录
              </h3>
              <div className="space-y-2">
                {history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => loadFromHistory(item)}
                    className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.method}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 break-all">
                          {item.url}
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                        {item.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

                     {/* 代码生成 */}
           <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
             <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
               代码生成
             </h3>
             <div className="space-y-3">
               {(['curl', 'javascript', 'python'] as const).map((lang) => (
                 <div key={lang}>
                   <div className="flex items-center justify-between mb-2">
                     <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                       {lang === 'curl' ? 'cURL' : lang === 'javascript' ? 'JavaScript' : 'Python'}
                     </span>
                     <button
                       onClick={() => navigator.clipboard?.writeText(generateCode(lang))}
                       className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                       title="复制代码"
                     >
                       <Copy className="w-3 h-3" />
                     </button>
                   </div>
                   <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg max-h-32 overflow-auto">
                     <pre className="text-xs text-gray-900 dark:text-white whitespace-pre-wrap">
                       {generateCode(lang)}
                     </pre>
                   </div>
                 </div>
               ))}
             </div>
           </div>

           {/* 响应结果 */}
           <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                响应结果
              </h2>
              {response && (
                <button
                  onClick={copyResponse}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  title="复制响应"
                >
                  <Copy className="w-4 h-4" />
                </button>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
                </div>
              </div>
            )}

            {response && (
              <div className="space-y-4">
                {/* 状态信息 */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(response.status)}
                    <span className={`font-medium ${getStatusColor(response.status)}`}>
                      {response.status} {response.statusText}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    {response.time}ms
                  </div>
                </div>

                {/* 响应头 */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    响应头
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg max-h-32 overflow-auto">
                    <pre className="text-xs text-gray-900 dark:text-white">
                      {JSON.stringify(response.headers, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* 响应数据 */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    响应数据
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg max-h-64 overflow-auto">
                    <pre className="text-xs text-gray-900 dark:text-white">
                      {typeof response.data === 'string' 
                        ? response.data 
                        : JSON.stringify(response.data, null, 2)
                      }
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {!response && !error && !loading && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                发送请求后，响应结果将显示在这里
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 