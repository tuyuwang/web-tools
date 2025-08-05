'use client';

import { useState, useCallback, useEffect } from 'react';
import { Copy, RefreshCw, Shield, Eye, EyeOff, Download, Settings, AlertTriangle, CheckCircle } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';

interface PasswordOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeSimilar: boolean;
  excludeAmbiguous: boolean;
  customCharacters: string;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  suggestions: string[];
}

export default function PasswordGeneratorPage() {
  const [password, setPassword] = useState('');
  const [passwordHistory, setPasswordHistory] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: false,
    excludeAmbiguous: false,
    customCharacters: '',
  });

  const generatePassword = useCallback(() => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const similar = 'il1Lo0O';
    const ambiguous = '{}[]()/\\\'"`~,;.<>';

    let chars = '';
    if (options.includeUppercase) chars += uppercase;
    if (options.includeLowercase) chars += lowercase;
    if (options.includeNumbers) chars += numbers;
    if (options.includeSymbols) chars += symbols;
    if (options.customCharacters) chars += options.customCharacters;

    // 排除相似字符
    if (options.excludeSimilar) {
      chars = chars.split('').filter(char => !similar.includes(char)).join('');
    }

    // 排除模糊字符
    if (options.excludeAmbiguous) {
      chars = chars.split('').filter(char => !ambiguous.includes(char)).join('');
    }

    if (!chars) {
      alert('请至少选择一种字符类型');
      return;
    }

    let result = '';
    
    // 确保至少包含每种选中的字符类型
    if (options.includeUppercase && !options.excludeSimilar) result += uppercase[Math.floor(Math.random() * uppercase.length)];
    if (options.includeLowercase && !options.excludeSimilar) result += lowercase[Math.floor(Math.random() * lowercase.length)];
    if (options.includeNumbers) result += numbers[Math.floor(Math.random() * numbers.length)];
    if (options.includeSymbols && !options.excludeAmbiguous) result += symbols[Math.floor(Math.random() * symbols.length)];

    // 生成剩余字符
    for (let i = result.length; i < options.length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }

    // 打乱字符顺序
    result = result.split('').sort(() => Math.random() - 0.5).join('');

    setPassword(result);
    
    // 添加到历史记录
    setPasswordHistory(prev => {
      const newHistory = [result, ...prev.filter(p => p !== result)];
      return newHistory.slice(0, 10);
    });
  }, [options]);

  const calculateStrength = useCallback((pwd: string): PasswordStrength => {
    let score = 0;
    const suggestions: string[] = [];

    // 长度评分
    if (pwd.length >= 12) score += 25;
    else if (pwd.length >= 8) score += 15;
    else if (pwd.length >= 6) score += 10;
    else suggestions.push('密码长度至少应为8位');

    // 字符类型评分
    if (/[a-z]/.test(pwd)) score += 15;
    else suggestions.push('添加小写字母');
    
    if (/[A-Z]/.test(pwd)) score += 15;
    else suggestions.push('添加大写字母');
    
    if (/[0-9]/.test(pwd)) score += 15;
    else suggestions.push('添加数字');
    
    if (/[^a-zA-Z0-9]/.test(pwd)) score += 20;
    else suggestions.push('添加特殊符号');

    // 复杂度评分
    const uniqueChars = new Set(pwd).size;
    if (uniqueChars >= pwd.length * 0.7) score += 10;
    else suggestions.push('避免重复字符');

    // 确定强度等级
    let label = '';
    let color = '';
    
    if (score >= 85) {
      label = '非常强';
      color = 'text-green-600';
    } else if (score >= 70) {
      label = '强';
      color = 'text-green-500';
    } else if (score >= 50) {
      label = '中等';
      color = 'text-yellow-500';
    } else if (score >= 30) {
      label = '弱';
      color = 'text-orange-500';
    } else {
      label = '非常弱';
      color = 'text-red-500';
    }

    return { score, label, color, suggestions };
  }, []);

  const copyToClipboard = async () => {
    if (password && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('复制失败:', error);
      }
    }
  };

  const downloadPasswords = () => {
    const data = passwordHistory.map((pwd, index) => `${index + 1}. ${pwd}`).join('\n');
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'passwords.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const updateOption = (key: keyof PasswordOptions, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const strength = password ? calculateStrength(password) : null;

  // 自动生成初始密码
  useEffect(() => {
    generatePassword();
  }, []);

  return (
    <ToolLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* 页面标题 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            密码生成器
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            生成安全、随机的密码，支持自定义规则和强度检测，保护您的账户安全
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 密码生成区域 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 生成的密码 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  生成的密码
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsVisible(!isVisible)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    title={isVisible ? '隐藏密码' : '显示密码'}
                  >
                    {isVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={generatePassword}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="重新生成"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="relative">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                  <div className="font-mono text-lg text-gray-900 dark:text-white break-all select-all">
                    {password ? (isVisible ? password : '•'.repeat(password.length)) : '点击生成密码'}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={copyToClipboard}
                    disabled={!password}
                    className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                  >
                    {copied ? (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    ) : (
                      <Copy className="w-4 h-4 mr-2" />
                    )}
                    {copied ? '已复制' : '复制'}
                  </button>
                  
                  <button
                    onClick={generatePassword}
                    className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    重新生成
                  </button>
                </div>
              </div>
            </div>

            {/* 密码强度 */}
            {strength && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  密码强度分析
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">强度评分</span>
                      <span className={`font-semibold ${strength.color}`}>
                        {strength.label} ({strength.score}/100)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          strength.score >= 85 ? 'bg-green-500' :
                          strength.score >= 70 ? 'bg-green-400' :
                          strength.score >= 50 ? 'bg-yellow-400' :
                          strength.score >= 30 ? 'bg-orange-400' : 'bg-red-400'
                        }`}
                        style={{ width: `${strength.score}%` }}
                      />
                    </div>
                  </div>

                  {strength.suggestions.length > 0 && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                      <div className="flex items-start">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                            改进建议
                          </h4>
                          <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                            {strength.suggestions.map((suggestion, index) => (
                              <li key={index}>• {suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 密码历史 */}
            {passwordHistory.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    密码历史
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={downloadPasswords}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="下载密码列表"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPasswordHistory([])}
                      className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      清空历史
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {passwordHistory.map((pwd, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <span className="font-mono text-sm text-gray-900 dark:text-white flex-1 mr-3">
                        {isVisible ? pwd : '•'.repeat(pwd.length)}
                      </span>
                      <button
                        onClick={() => navigator.clipboard?.writeText(pwd)}
                        className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                        title="复制"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 设置面板 */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center mb-6">
                <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  密码设置
                </h3>
              </div>

              <div className="space-y-6">
                {/* 密码长度 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    密码长度: {options.length}
                  </label>
                  <input
                    type="range"
                    min="4"
                    max="128"
                    value={options.length}
                    onChange={(e) => updateOption('length', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>4</span>
                    <span>128</span>
                  </div>
                </div>

                {/* 字符类型 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    包含字符类型
                  </label>
                  <div className="space-y-3">
                    {[
                      { key: 'includeUppercase', label: '大写字母 (A-Z)', example: 'ABCD' },
                      { key: 'includeLowercase', label: '小写字母 (a-z)', example: 'abcd' },
                      { key: 'includeNumbers', label: '数字 (0-9)', example: '1234' },
                      { key: 'includeSymbols', label: '特殊符号', example: '!@#$' },
                    ].map(({ key, label, example }) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={options[key as keyof PasswordOptions] as boolean}
                          onChange={(e) => updateOption(key as keyof PasswordOptions, e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <div className="ml-3">
                          <span className="text-sm text-gray-900 dark:text-white">{label}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 font-mono">{example}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 高级选项 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    高级选项
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={options.excludeSimilar}
                        onChange={(e) => updateOption('excludeSimilar', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <div className="ml-3">
                        <span className="text-sm text-gray-900 dark:text-white">排除相似字符</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 font-mono">il1Lo0O</span>
                      </div>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={options.excludeAmbiguous}
                        onChange={(e) => updateOption('excludeAmbiguous', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <div className="ml-3">
                        <span className="text-sm text-gray-900 dark:text-white">排除模糊字符</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 font-mono">{`{}[]()\\`}</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* 自定义字符 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    自定义字符
                  </label>
                  <input
                    type="text"
                    value={options.customCharacters}
                    onChange={(e) => updateOption('customCharacters', e.target.value)}
                    placeholder="输入额外的字符..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* 安全提示 */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <div className="flex items-start">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                    安全提示
                  </h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• 使用至少12位长度的密码</li>
                    <li>• 包含多种字符类型</li>
                    <li>• 每个账户使用不同密码</li>
                    <li>• 定期更换重要账户密码</li>
                    <li>• 使用密码管理器保存</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
} 