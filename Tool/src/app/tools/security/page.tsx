'use client';

import { ToolLayout } from '@/components/tool-layout';
import { useState } from 'react';
import { Lock, Shield, Key, Hash, Eye, EyeOff, Copy, Check, AlertTriangle, Fingerprint } from 'lucide-react';

export default function SecurityToolsPage() {
  const [activeTab, setActiveTab] = useState('hash');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [salt, setSalt] = useState('');
  const [hashResult, setHashResult] = useState('');

  const tabs = [
    { id: 'hash', name: '哈希工具', icon: Hash },
    { id: 'encrypt', name: '加密工具', icon: Lock },
    { id: 'password', name: '密码工具', icon: Key },
    { id: 'certificate', name: '证书工具', icon: Shield },
  ];

  // 简单的哈希函数（仅用于演示）
  const simpleHash = (text: string, algorithm: string) => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    
    switch (algorithm) {
      case 'md5':
        return hash.toString(16).padStart(8, '0');
      case 'sha1':
        return (hash * 31).toString(16).padStart(8, '0');
      case 'sha256':
        return (hash * 37).toString(16).padStart(8, '0');
      default:
        return hash.toString(16).padStart(8, '0');
    }
  };

  const handleHash = (algorithm: string) => {
    if (!inputText.trim()) return;
    
    const hash = simpleHash(inputText, algorithm);
    setHashResult(`${algorithm.toUpperCase()}: ${hash}`);
  };

  const handleEncrypt = (type: 'caesar' | 'reverse' | 'base64') => {
    if (!inputText.trim()) return;
    
    let result = '';
    switch (type) {
      case 'caesar':
        result = inputText.split('').map(char => {
          if (char >= 'a' && char <= 'z') {
            return String.fromCharCode(((char.charCodeAt(0) - 97 + 3) % 26) + 97);
          } else if (char >= 'A' && char <= 'Z') {
            return String.fromCharCode(((char.charCodeAt(0) - 65 + 3) % 26) + 65);
          }
          return char;
        }).join('');
        break;
      case 'reverse':
        result = inputText.split('').reverse().join('');
        break;
      case 'base64':
        result = btoa(inputText);
        break;
    }
    setOutputText(result);
  };

  const handleDecrypt = (type: 'caesar' | 'reverse' | 'base64') => {
    if (!inputText.trim()) return;
    
    let result = '';
    switch (type) {
      case 'caesar':
        result = inputText.split('').map(char => {
          if (char >= 'a' && char <= 'z') {
            return String.fromCharCode(((char.charCodeAt(0) - 97 - 3 + 26) % 26) + 97);
          } else if (char >= 'A' && char <= 'Z') {
            return String.fromCharCode(((char.charCodeAt(0) - 65 - 3 + 26) % 26) + 65);
          }
          return char;
        }).join('');
        break;
      case 'reverse':
        result = inputText.split('').reverse().join('');
        break;
      case 'base64':
        try {
          result = atob(inputText);
        } catch {
          result = '解码失败，请检查输入格式';
        }
        break;
    }
    setOutputText(result);
  };

  const generatePassword = (length: number = 12, includeSpecial: boolean = true) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const allChars = includeSpecial ? chars + specialChars : chars;
    
    let result = '';
    for (let i = 0; i < length; i++) {
      result += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    
    setPassword(result);
  };

  const checkPasswordStrength = (pass: string) => {
    let score = 0;
    let feedback = [];

    if (pass.length >= 8) score++;
    else feedback.push('密码长度至少8位');

    if (/[a-z]/.test(pass)) score++;
    else feedback.push('包含小写字母');

    if (/[A-Z]/.test(pass)) score++;
    else feedback.push('包含大写字母');

    if (/[0-9]/.test(pass)) score++;
    else feedback.push('包含数字');

    if (/[^A-Za-z0-9]/.test(pass)) score++;
    else feedback.push('包含特殊字符');

    let strength = '';
    let color = '';
    
    if (score <= 1) {
      strength = '很弱';
      color = 'text-red-600';
    } else if (score <= 2) {
      strength = '弱';
      color = 'text-orange-600';
    } else if (score <= 3) {
      strength = '中等';
      color = 'text-yellow-600';
    } else if (score <= 4) {
      strength = '强';
      color = 'text-blue-600';
    } else {
      strength = '很强';
      color = 'text-green-600';
    }

    return { score, strength, color, feedback };
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <ToolLayout>
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          安全工具
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          加密、哈希、密码生成等安全相关工具
        </p>
      </div>

      {/* 标签页 */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* 哈希工具 */}
      {activeTab === 'hash' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              文本哈希
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  输入文本
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="输入要哈希的文本..."
                  className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { name: 'MD5', algorithm: 'md5' },
                  { name: 'SHA1', algorithm: 'sha1' },
                  { name: 'SHA256', algorithm: 'sha256' },
                ].map((hash) => (
                  <button
                    key={hash.algorithm}
                    onClick={() => handleHash(hash.algorithm)}
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Hash className="h-4 w-4" />
                    <span>{hash.name}</span>
                  </button>
                ))}
              </div>
              
              {hashResult && (
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">哈希结果</span>
                    <button
                      onClick={() => copyToClipboard(hashResult)}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-2 font-mono text-sm text-gray-900 dark:text-white break-all">
                    {hashResult}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 加密工具 */}
      {activeTab === 'encrypt' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                输入文本
              </h3>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="输入要加密/解密的文本..."
                className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  处理结果
                </h3>
                {outputText && (
                  <button
                    onClick={() => copyToClipboard(outputText)}
                    className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
                  >
                    <Copy className="h-4 w-4" />
                    <span>复制</span>
                  </button>
                )}
              </div>
              <textarea
                value={outputText}
                readOnly
                placeholder="加密/解密结果将显示在这里..."
                className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none bg-gray-50 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { name: '凯撒加密', action: 'caesar', icon: Lock },
              { name: '凯撒解密', action: 'caesar', icon: Lock, decrypt: true },
              { name: '反转加密', action: 'reverse', icon: Lock },
              { name: '反转解密', action: 'reverse', icon: Lock, decrypt: true },
              { name: 'Base64编码', action: 'base64', icon: Lock },
              { name: 'Base64解码', action: 'base64', icon: Lock, decrypt: true },
            ].map((tool) => (
              <button
                key={`${tool.action}-${tool.decrypt ? 'decrypt' : 'encrypt'}`}
                onClick={() => tool.decrypt ? handleDecrypt(tool.action as any) : handleEncrypt(tool.action as any)}
                className="flex flex-col items-center space-y-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
              >
                <tool.icon className="h-6 w-6 text-primary-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {tool.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 密码工具 */}
      {activeTab === 'password' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              密码生成器
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    密码长度
                  </label>
                  <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                    <option value="8">8位</option>
                    <option value="12" selected>12位</option>
                    <option value="16">16位</option>
                    <option value="20">20位</option>
                    <option value="32">32位</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeSpecial"
                    defaultChecked
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="includeSpecial" className="text-sm text-gray-700 dark:text-gray-300">
                    包含特殊字符
                  </label>
                </div>
                
                <button
                  onClick={() => generatePassword(12, true)}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Key className="h-4 w-4" />
                  <span>生成密码</span>
                </button>
              </div>
              
              {password && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        readOnly
                        className="w-full p-3 pr-12 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-600 dark:text-white font-mono"
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <button
                      onClick={() => copyToClipboard(password)}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* 密码强度检查 */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">密码强度:</span>
                      <span className={`text-sm font-medium ${checkPasswordStrength(password).color}`}>
                        {checkPasswordStrength(password).strength}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all"
                        style={{ width: `${(checkPasswordStrength(password).score / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 密码强度测试 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              密码强度测试
            </h3>
            <div className="space-y-4">
              <input
                type="password"
                placeholder="输入要测试的密码..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                onChange={(e) => {
                  const strength = checkPasswordStrength(e.target.value);
                  if (e.target.value) {
                    setOutputText(`强度: ${strength.strength}\n建议: ${strength.feedback.join(', ')}`);
                  } else {
                    setOutputText('');
                  }
                }}
              />
              {outputText && (
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <pre className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{outputText}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 证书工具 */}
      {activeTab === 'certificate' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              SSL证书检查
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              检查网站的SSL证书状态和详细信息
            </p>
            
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="输入域名 (例如: google.com)"
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
                <button className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                  检查
                </button>
              </div>
              
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm text-yellow-800 dark:text-yellow-200">
                    注意：此功能需要服务器端支持，当前为演示版本
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                证书信息
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">颁发者</span>
                  <span className="text-sm font-medium">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">有效期</span>
                  <span className="text-sm font-medium">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">加密算法</span>
                  <span className="text-sm font-medium">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">密钥长度</span>
                  <span className="text-sm font-medium">-</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                安全状态
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <span className="text-sm">证书有效性</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <span className="text-sm">域名匹配</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <span className="text-sm">信任链</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <span className="text-sm">OCSP状态</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </ToolLayout>
  );
} 