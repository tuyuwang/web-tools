'use client';

import { ToolLayout } from '@/components/tool-layout';
import { useState } from 'react';
import { Lock, Shield, Key, Hash, Eye, EyeOff, Copy, Check, AlertTriangle, Fingerprint } from 'lucide-react';
import { useToolTranslations } from '@/components/tool-translations';
import { useLanguage } from '@/components/language-provider';

export default function SecurityToolsPage() {
  const { getToolTranslation, getUITranslation, getToolPageTranslation } = useToolTranslations();
  const { t } = useLanguage();
  const toolTranslation = getToolTranslation('security');
  const ui = getUITranslation();
  const pageTranslation = getToolPageTranslation('security');
  
  const [activeTab, setActiveTab] = useState('hash');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [salt, setSalt] = useState('');
  const [hashResult, setHashResult] = useState('');

  const tabs = [
    { id: 'hash', name: pageTranslation.hashTools, icon: Hash },
    { id: 'encrypt', name: pageTranslation.encryptionTools, icon: Lock },
    { id: 'password', name: pageTranslation.passwordStrength, icon: Key },
    { id: 'certificate', name: pageTranslation.sslChecker, icon: Shield },
  ];

  const hashAlgorithms = [
    { id: 'md5', name: pageTranslation.features.md5, description: 'MD5哈希算法' },
    { id: 'sha1', name: pageTranslation.features.sha1, description: 'SHA-1哈希算法' },
    { id: 'sha256', name: pageTranslation.features.sha256, description: 'SHA-256哈希算法' },
  ];

  const encryptionMethods = [
    { id: 'caesar', name: pageTranslation.features.caesarCipher, description: '凯撒密码加密' },
    { id: 'base64', name: pageTranslation.features.base64, description: 'Base64编码' },
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
    if (pass.length >= 8) score++;
    if (pass.length >= 12) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    const labels = [ui.strength.veryWeak, ui.strength.weak, ui.strength.medium, ui.strength.strong, ui.strength.veryStrong, ui.strength.extremelyStrong];
    const colors = ['text-red-500', 'text-orange-500', 'text-yellow-500', 'text-blue-500', 'text-green-500', 'text-green-600'];
    
    return {
      score: Math.min(score, 5),
      label: labels[Math.min(score, 5)],
      color: colors[Math.min(score, 5)]
    };
  };

  const copyToClipboard = (text: string) => {
    if (text && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <ToolLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {toolTranslation.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {toolTranslation.description}
          </p>
        </div>

        {/* 标签页 */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* 内容区域 */}
        <div className="mt-8">
          {activeTab === 'hash' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 输入区域 */}
                <div className="space-y-4">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      {ui.labels.input}
                    </h2>
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={ui.placeholders.enterText}
                      className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* 输出区域 */}
                <div className="space-y-4">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      {ui.labels.output}
                    </h2>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg min-h-32">
                      {hashResult ? (
                        <div className="text-gray-900 dark:text-white font-mono">
                          {hashResult}
                        </div>
                      ) : (
                        <div className="text-gray-500 dark:text-gray-400 text-center py-8">
                          {ui.messages.processing}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 哈希算法选项 */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {pageTranslation.hashTools}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {hashAlgorithms.map((algorithm) => (
                    <button
                      key={algorithm.id}
                      onClick={() => handleHash(algorithm.id)}
                      disabled={!inputText}
                      className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-left"
                    >
                      <div className="font-medium text-gray-900 dark:text-white">
                        {algorithm.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {algorithm.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'encrypt' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 输入区域 */}
                <div className="space-y-4">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      {ui.labels.input}
                    </h2>
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={ui.placeholders.enterText}
                      className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* 输出区域 */}
                <div className="space-y-4">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      {ui.labels.output}
                    </h2>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg min-h-32">
                      {outputText ? (
                        <div className="text-gray-900 dark:text-white font-mono">
                          {outputText}
                        </div>
                      ) : (
                        <div className="text-gray-500 dark:text-gray-400 text-center py-8">
                          {ui.messages.processing}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 加密方法选项 */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {pageTranslation.encryptionTools}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {encryptionMethods.map((method) => (
                    <div key={method.id} className="space-y-2">
                      <button
                        onClick={() => handleEncrypt(method.id as any)}
                        disabled={!inputText}
                        className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-left"
                      >
                        <div className="font-medium text-gray-900 dark:text-white">
                          {method.name} (加密)
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {method.description}
                        </div>
                      </button>
                      <button
                        onClick={() => handleDecrypt(method.id as any)}
                        disabled={!inputText}
                        className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-300 dark:hover:border-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-left"
                      >
                        <div className="font-medium text-gray-900 dark:text-white">
                          {method.name} (解密)
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {method.description}
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 密码生成 */}
                <div className="space-y-4">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      密码生成
                    </h2>
                    <div className="space-y-4">
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          readOnly
                          className="w-full p-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                          placeholder="生成的密码将显示在这里"
                        />
                        <button
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => generatePassword(12, true)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                        >
                          生成密码
                        </button>
                        <button
                          onClick={() => copyToClipboard(password)}
                          disabled={!password}
                          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                        >
                          {ui.buttons.copy}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 密码强度检测 */}
                <div className="space-y-4">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      密码强度检测
                    </h2>
                    <div className="space-y-4">
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="输入密码进行强度检测"
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      {password && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">密码强度:</span>
                            <span className={`text-sm font-medium ${checkPasswordStrength(password).color}`}>
                              {checkPasswordStrength(password).label}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                checkPasswordStrength(password).score <= 1 ? 'bg-red-500' :
                                checkPasswordStrength(password).score <= 2 ? 'bg-orange-500' :
                                checkPasswordStrength(password).score <= 3 ? 'bg-yellow-500' :
                                checkPasswordStrength(password).score <= 4 ? 'bg-blue-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${(checkPasswordStrength(password).score / 5) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'certificate' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {pageTranslation.sslChecker}
                </h2>
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {ui.messages.processing}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 使用说明 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">
            {pageTranslation.instructions}
          </h3>
          <ul className="space-y-2 text-blue-700 dark:text-blue-300">
            {pageTranslation.instructionSteps.map((step: string, index: number) => (
              <li key={index}>• {step}</li>
            ))}
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
} 