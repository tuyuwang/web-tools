'use client';

import { useState, useEffect, useCallback } from 'react';
import { Copy, RotateCcw, Eye, EyeOff, Shield, Download, Zap, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';
import { useToolTranslations } from '@/components/tool-translations';
import { useLanguage } from '@/components/language-provider';

interface PasswordRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  validate: (password: string) => boolean;
}

interface GeneratedPassword {
  id: string;
  password: string;
  strength: PasswordStrength;
  timestamp: Date;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  feedback: string[];
  estimatedCrackTime: string;
}

export default function PasswordGeneratorPage() {
  const [password, setPassword] = useState('');
  const [passwords, setPasswords] = useState<GeneratedPassword[]>([]);
  const [length, setLength] = useState(12);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(false);
  const [excludeSimilar, setExcludeSimilar] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [batchCount, setBatchCount] = useState(1);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [customCharacters, setCustomCharacters] = useState('');
  const [useCustomCharacters, setUseCustomCharacters] = useState(false);
  const [passwordPattern, setPasswordPattern] = useState('');
  const [usePattern, setUsePattern] = useState(false);

  const { getToolTranslation, getUITranslation, getToolPageTranslation } = useToolTranslations();
  const { t } = useLanguage();
  const toolTranslation = getToolTranslation('utility-password');
  const ui = getUITranslation();
  const pageTranslation = getToolPageTranslation('utility-password');

  // 密码强度分析
  const analyzePasswordStrength = useCallback((pwd: string): PasswordStrength => {
    if (!pwd) return { score: 0, label: '无', color: 'text-gray-400', feedback: [], estimatedCrackTime: '立即' };
    
    let score = 0;
    const feedback: string[] = [];
    
    // 长度检查
    if (pwd.length >= 8) score += 1;
    else feedback.push('密码长度至少应为8个字符');
    
    if (pwd.length >= 12) score += 1;
    else if (pwd.length >= 8) feedback.push('建议密码长度至少12个字符');
    
    if (pwd.length >= 16) score += 1;
    
    // 字符类型检查
    if (/[a-z]/.test(pwd)) score += 1;
    else feedback.push('添加小写字母');
    
    if (/[A-Z]/.test(pwd)) score += 1;
    else feedback.push('添加大写字母');
    
    if (/[0-9]/.test(pwd)) score += 1;
    else feedback.push('添加数字');
    
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    else feedback.push('添加特殊字符');
    
    // 复杂性检查
    const uniqueChars = new Set(pwd).size;
    if (uniqueChars / pwd.length > 0.7) score += 1;
    else feedback.push('增加字符多样性');
    
    // 常见模式检查
    if (!/(.)\1{2,}/.test(pwd)) score += 1;
    else feedback.push('避免连续重复字符');
    
    if (!/123|abc|qwe|password|admin/i.test(pwd)) score += 1;
    else feedback.push('避免常见的字符序列');
    
    // 计算破解时间估算
    const charset = getCharsetSize(pwd);
    const combinations = Math.pow(charset, pwd.length);
    const crackTime = estimateCrackTime(combinations);
    
    const labels = ['极弱', '很弱', '弱', '一般', '强', '很强', '极强'];
    const colors = ['text-red-600', 'text-red-500', 'text-orange-500', 'text-yellow-500', 'text-blue-500', 'text-green-500', 'text-green-600'];
    
    const finalScore = Math.min(score, 6);
    
    return {
      score: finalScore,
      label: labels[finalScore],
      color: colors[finalScore],
      feedback,
      estimatedCrackTime: crackTime
    };
  }, []);

  const getCharsetSize = (pwd: string): number => {
    let size = 0;
    if (/[a-z]/.test(pwd)) size += 26;
    if (/[A-Z]/.test(pwd)) size += 26;
    if (/[0-9]/.test(pwd)) size += 10;
    if (/[^A-Za-z0-9]/.test(pwd)) size += 32; // 估算特殊字符数量
    return size;
  };

  const estimateCrackTime = (combinations: number): string => {
    // 假设每秒10亿次尝试
    const attemptsPerSecond = 1e9;
    const seconds = combinations / (2 * attemptsPerSecond); // 平均需要尝试一半
    
    if (seconds < 1) return '立即';
    if (seconds < 60) return `${Math.round(seconds)}秒`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}分钟`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)}小时`;
    if (seconds < 31536000) return `${Math.round(seconds / 86400)}天`;
    if (seconds < 31536000000) return `${Math.round(seconds / 31536000)}年`;
    return '数千年';
  };

  // 生成密码
  const generatePassword = useCallback(() => {
    if (usePattern && passwordPattern) {
      return generateFromPattern(passwordPattern);
    }

    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const similar = 'il1Lo0O';
    const ambiguous = '{}[]()/\\\'"`~,;<>.?';

    let chars = '';
    
    if (useCustomCharacters && customCharacters) {
      chars = customCharacters;
    } else {
      if (includeUppercase) chars += uppercase;
      if (includeLowercase) chars += lowercase;
      if (includeNumbers) chars += numbers;
      if (includeSymbols) chars += symbols;
    }

    if (excludeSimilar) {
      chars = chars.split('').filter(char => !similar.includes(char)).join('');
    }

    if (excludeAmbiguous) {
      chars = chars.split('').filter(char => !ambiguous.includes(char)).join('');
    }

    if (chars === '') {
      return '';
    }

    let result = '';
    
    // 确保至少包含每种选中的字符类型
    if (!useCustomCharacters) {
      if (includeUppercase) result += getRandomChar(uppercase.split('').filter(c => !excludeSimilar || !similar.includes(c)));
      if (includeLowercase) result += getRandomChar(lowercase.split('').filter(c => !excludeSimilar || !similar.includes(c)));
      if (includeNumbers) result += getRandomChar(numbers.split('').filter(c => !excludeSimilar || !similar.includes(c)));
      if (includeSymbols) result += getRandomChar(symbols.split('').filter(c => !excludeAmbiguous || !ambiguous.includes(c)));
    }

    // 填充剩余长度
    for (let i = result.length; i < length; i++) {
      result += getRandomChar(chars.split(''));
    }

    // 随机打乱
    return result.split('').sort(() => Math.random() - 0.5).join('');
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols, excludeSimilar, excludeAmbiguous, useCustomCharacters, customCharacters, usePattern, passwordPattern]);

  const getRandomChar = (charArray: string[]): string => {
    return charArray[Math.floor(Math.random() * charArray.length)];
  };

  const generateFromPattern = (pattern: string): string => {
    // 简单的模式生成器
    // L = 大写字母, l = 小写字母, d = 数字, s = 符号, ? = 任意字符
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const all = uppercase + lowercase + numbers + symbols;

    return pattern.split('').map(char => {
      switch (char) {
        case 'L': return getRandomChar(uppercase.split(''));
        case 'l': return getRandomChar(lowercase.split(''));
        case 'd': return getRandomChar(numbers.split(''));
        case 's': return getRandomChar(symbols.split(''));
        case '?': return getRandomChar(all.split(''));
        default: return char;
      }
    }).join('');
  };

  const handleGenerate = () => {
    if (isBatchMode) {
      const newPasswords: GeneratedPassword[] = [];
      for (let i = 0; i < batchCount; i++) {
        const pwd = generatePassword();
        if (pwd) {
          newPasswords.push({
            id: `${Date.now()}-${i}`,
            password: pwd,
            strength: analyzePasswordStrength(pwd),
            timestamp: new Date()
          });
        }
      }
      setPasswords(newPasswords);
    } else {
      const pwd = generatePassword();
      setPassword(pwd);
    }
  };

  const copyPassword = async (pwd: string) => {
    if (pwd && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(pwd);
      } catch (error) {
        console.error('复制失败:', error);
      }
    }
  };

  const downloadPasswords = () => {
    if (passwords.length === 0) return;
    
    const content = passwords.map((p, index) => 
      `密码 ${index + 1}: ${p.password}\n强度: ${p.strength.label}\n生成时间: ${p.timestamp.toLocaleString()}\n`
    ).join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `passwords-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearPasswords = () => {
    setPassword('');
    setPasswords([]);
  };

  // 实时分析当前密码强度
  const currentStrength = password ? analyzePasswordStrength(password) : null;

  // 预设配置
  const presetConfigs = [
    {
      name: '基础密码',
      description: '包含字母和数字',
      config: { length: 8, uppercase: true, lowercase: true, numbers: true, symbols: false }
    },
    {
      name: '强密码',
      description: '包含所有字符类型',
      config: { length: 12, uppercase: true, lowercase: true, numbers: true, symbols: true }
    },
    {
      name: '超强密码',
      description: '长度16位的复杂密码',
      config: { length: 16, uppercase: true, lowercase: true, numbers: true, symbols: true }
    },
    {
      name: 'PIN码',
      description: '纯数字密码',
      config: { length: 6, uppercase: false, lowercase: false, numbers: true, symbols: false }
    },
    {
      name: '无符号密码',
      description: '不包含特殊符号',
      config: { length: 12, uppercase: true, lowercase: true, numbers: true, symbols: false }
    }
  ];

  const applyPreset = (config: any) => {
    setLength(config.length);
    setIncludeUppercase(config.uppercase);
    setIncludeLowercase(config.lowercase);
    setIncludeNumbers(config.numbers);
    setIncludeSymbols(config.symbols);
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

        {/* 工具栏 */}
        <div className="flex flex-wrap gap-4 justify-center items-center">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="batchMode"
              checked={isBatchMode}
              onChange={(e) => setIsBatchMode(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="batchMode" className="text-sm text-gray-700 dark:text-gray-300">
              批量生成
            </label>
          </div>

          {isBatchMode && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700 dark:text-gray-300">数量:</label>
              <input
                type="number"
                value={batchCount}
                onChange={(e) => setBatchCount(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                min="1"
                max="50"
                className="w-16 p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 设置区域 */}
          <div className="space-y-6">
            {/* 预设配置 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                快速配置
              </h2>
              <div className="grid grid-cols-1 gap-3">
                {presetConfigs.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => applyPreset(preset.config)}
                    className="p-3 text-left bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <div className="font-medium text-gray-900 dark:text-white">
                      {preset.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {preset.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 基本设置 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {pageTranslation.generationSettings}
              </h2>

              <div className="space-y-4">
                {/* 密码长度 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {pageTranslation.passwordLength}: {length}
                  </label>
                  <input
                    type="range"
                    min="4"
                    max="128"
                    value={length}
                    onChange={(e) => setLength(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>4</span>
                    <span>128</span>
                  </div>
                </div>

                {/* 字符类型 */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {pageTranslation.characterTypes}
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={includeUppercase}
                        onChange={(e) => setIncludeUppercase(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{pageTranslation.characterOptions?.uppercase || '大写字母 (A-Z)'}</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={includeLowercase}
                        onChange={(e) => setIncludeLowercase(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{pageTranslation.characterOptions?.lowercase || '小写字母 (a-z)'}</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={includeNumbers}
                        onChange={(e) => setIncludeNumbers(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{pageTranslation.characterOptions?.numbers || '数字 (0-9)'}</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={includeSymbols}
                        onChange={(e) => setIncludeSymbols(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{pageTranslation.characterOptions?.symbols || '特殊字符 (!@#$...)'}</span>
                    </label>
                  </div>
                </div>

                {/* 排除选项 */}
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={excludeSimilar}
                      onChange={(e) => setExcludeSimilar(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">排除相似字符 (il1Lo0O)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={excludeAmbiguous}
                      onChange={(e) => setExcludeAmbiguous(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">排除易混淆字符 ({}[]()...)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* 高级设置 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                高级设置
              </h2>

              <div className="space-y-4">
                {/* 自定义字符集 */}
                <div>
                  <label className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={useCustomCharacters}
                      onChange={(e) => setUseCustomCharacters(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">使用自定义字符集</span>
                  </label>
                  {useCustomCharacters && (
                    <input
                      type="text"
                      value={customCharacters}
                      onChange={(e) => setCustomCharacters(e.target.value)}
                      placeholder="输入自定义字符..."
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    />
                  )}
                </div>

                {/* 密码模式 */}
                <div>
                  <label className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={usePattern}
                      onChange={(e) => setUsePattern(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">使用密码模式</span>
                  </label>
                  {usePattern && (
                    <div>
                      <input
                        type="text"
                        value={passwordPattern}
                        onChange={(e) => setPasswordPattern(e.target.value)}
                        placeholder="例如: Llll-dddd-ssss (L=大写,l=小写,d=数字,s=符号)"
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      />
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        L=大写字母, l=小写字母, d=数字, s=符号, ?=任意字符
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 结果区域 */}
          <div className="space-y-6">
            {!isBatchMode ? (
              /* 单个密码 */
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {pageTranslation.generatedPassword}
                </h2>

                <div className="space-y-4">
                  {/* 密码显示 */}
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      readOnly
                      className="w-full p-3 pr-20 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-lg"
                      placeholder="点击生成密码"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-2">
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* 密码强度 */}
                  {currentStrength && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                          <Shield className="w-4 h-4 mr-1" />
                          密码强度:
                        </span>
                        <span className={`text-sm font-medium ${currentStrength.color}`}>
                          {currentStrength.label}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            currentStrength.score <= 1 ? 'bg-red-500' :
                            currentStrength.score <= 2 ? 'bg-orange-500' :
                            currentStrength.score <= 3 ? 'bg-yellow-500' :
                            currentStrength.score <= 4 ? 'bg-blue-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${(currentStrength.score / 6) * 100}%` }}
                        />
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <div>预估破解时间: <span className="font-medium">{currentStrength.estimatedCrackTime}</span></div>
                        {currentStrength.feedback.length > 0 && (
                          <div className="mt-2">
                            <div className="font-medium mb-1">建议改进:</div>
                            <ul className="space-y-1">
                              {currentStrength.feedback.map((tip, index) => (
                                <li key={index} className="flex items-start">
                                  <AlertTriangle className="w-3 h-3 mt-0.5 mr-1 text-orange-500 flex-shrink-0" />
                                  <span className="text-xs">{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 操作按钮 */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleGenerate}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <Zap className="w-4 h-4" />
                      生成密码
                    </button>
                    <button
                      onClick={() => copyPassword(password)}
                      disabled={!password}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      复制
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* 批量密码 */
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    批量生成结果 ({passwords.length})
                  </h2>
                  <div className="flex gap-2">
                    {passwords.length > 0 && (
                      <button
                        onClick={downloadPasswords}
                        className="btn bg-blue-600 hover:bg-blue-700 text-white text-sm"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        下载
                      </button>
                    )}
                    <button
                      onClick={clearPasswords}
                      className="btn bg-gray-600 hover:bg-gray-700 text-white text-sm"
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      清空
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleGenerate}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    生成 {batchCount} 个密码
                  </button>

                  {passwords.length > 0 && (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {passwords.map((pwd) => (
                        <div key={pwd.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-mono text-sm text-gray-900 dark:text-white break-all">
                              {showPassword ? pwd.password : '•'.repeat(pwd.password.length)}
                            </div>
                            <button
                              onClick={() => copyPassword(pwd.password)}
                              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                              title="复制密码"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className={`font-medium ${pwd.strength.color}`}>
                              强度: {pwd.strength.label}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400">
                              {pwd.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 安全提示 */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center">
                <Info className="w-4 h-4 mr-1" />
                安全建议
              </h3>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• 使用至少12位字符的密码</li>
                <li>• 包含大小写字母、数字和特殊字符</li>
                <li>• 每个账户使用不同的密码</li>
                <li>• 定期更换重要账户密码</li>
                <li>• 使用密码管理器保存密码</li>
                <li>• 启用双因素认证增强安全性</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
} 