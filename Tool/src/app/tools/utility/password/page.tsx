'use client';

import { useState, useEffect, useCallback } from 'react';
import { Copy, RotateCcw, Eye, EyeOff, Download, Trash2, Shield, AlertTriangle, CheckCircle, RefreshCw, Save, History, Zap } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';
import { useToolTranslations } from '@/components/tool-translations';
import { useLanguage } from '@/components/language-provider';

interface PasswordEntry {
  id: string;
  password: string;
  timestamp: number;
  strength: number;
  length: number;
  settings: {
    includeUppercase: boolean;
    includeLowercase: boolean;
    includeNumbers: boolean;
    includeSymbols: boolean;
    excludeSimilar: boolean;
  };
}

interface PasswordPattern {
  id: string;
  name: string;
  description: string;
  pattern: string;
  example: string;
}

interface StrengthAnalysis {
  score: number;
  label: string;
  color: string;
  feedback: string[];
  entropy: number;
  timeToCrack: string;
}

export default function PasswordGeneratorPage() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(12);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(false);
  const [excludeSimilar, setExcludeSimilar] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('generator');
  const [passwordHistory, setPasswordHistory] = useState<PasswordEntry[]>([]);
  const [batchCount, setBatchCount] = useState(5);
  const [batchPasswords, setBatchPasswords] = useState<string[]>([]);
  const [customCharset, setCustomCharset] = useState('');
  const [useCustomCharset, setUseCustomCharset] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState<string>('');
  const [autoGenerate, setAutoGenerate] = useState(false);

  const { getToolTranslation, getUITranslation, getToolPageTranslation } = useToolTranslations();
  const { t } = useLanguage();
  const toolTranslation = getToolTranslation('utility-password');
  const ui = getUITranslation();
  const pageTranslation = getToolPageTranslation('utility-password');

  const passwordPatterns: PasswordPattern[] = [
    {
      id: 'random',
      name: '随机密码',
      description: '完全随机的字符组合',
      pattern: '',
      example: 'Kj9#mP2$xQ4'
    },
    {
      id: 'pronounceable',
      name: '可读密码',
      description: '相对容易记忆的密码',
      pattern: 'consonant-vowel',
      example: 'Bev4Tix9Gom'
    },
    {
      id: 'passphrase',
      name: '密码短语',
      description: '多个单词组合',
      pattern: 'word-word-number',
      example: 'Coffee-Mountain-2024'
    },
    {
      id: 'pin',
      name: '数字PIN',
      description: '纯数字密码',
      pattern: 'numbers-only',
      example: '847293'
    }
  ];

  // 计算密码熵值
  const calculateEntropy = useCallback((pwd: string) => {
    if (!pwd) return 0;
    
    let charsetSize = 0;
    if (/[a-z]/.test(pwd)) charsetSize += 26;
    if (/[A-Z]/.test(pwd)) charsetSize += 26;
    if (/[0-9]/.test(pwd)) charsetSize += 10;
    if (/[^A-Za-z0-9]/.test(pwd)) charsetSize += 32;
    
    return Math.log2(Math.pow(charsetSize, pwd.length));
  }, []);

  // 估算破解时间
  const estimateCrackTime = useCallback((entropy: number) => {
    const guessesPerSecond = 1e9; // 假设每秒10亿次尝试
    const secondsToCrack = Math.pow(2, entropy - 1) / guessesPerSecond;
    
    if (secondsToCrack < 60) return '< 1分钟';
    if (secondsToCrack < 3600) return `${Math.round(secondsToCrack / 60)}分钟`;
    if (secondsToCrack < 86400) return `${Math.round(secondsToCrack / 3600)}小时`;
    if (secondsToCrack < 31536000) return `${Math.round(secondsToCrack / 86400)}天`;
    if (secondsToCrack < 31536000000) return `${Math.round(secondsToCrack / 31536000)}年`;
    return '数千年';
  }, []);

  // 生成可读密码
  const generatePronounceablePassword = useCallback((len: number) => {
    const consonants = 'bcdfghjklmnpqrstvwxyz';
    const vowels = 'aeiou';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*';
    
    let result = '';
    let isConsonant = Math.random() > 0.5;
    
    for (let i = 0; i < len; i++) {
      if (i > 0 && i % 3 === 0 && includeNumbers && Math.random() > 0.7) {
        result += numbers[Math.floor(Math.random() * numbers.length)];
      } else if (i > 0 && i % 4 === 0 && includeSymbols && Math.random() > 0.8) {
        result += symbols[Math.floor(Math.random() * symbols.length)];
      } else {
        const chars = isConsonant ? consonants : vowels;
        let char = chars[Math.floor(Math.random() * chars.length)];
        
        if (includeUppercase && Math.random() > 0.7) {
          char = char.toUpperCase();
        }
        
        result += char;
        isConsonant = !isConsonant;
      }
    }
    
    return result;
  }, [includeNumbers, includeSymbols, includeUppercase]);

  // 生成密码短语
  const generatePassphrase = useCallback(() => {
    const words = [
      'Apple', 'Bridge', 'Coffee', 'Dragon', 'Eagle', 'Forest', 'Garden', 'Harbor',
      'Island', 'Journey', 'Kitchen', 'Library', 'Mountain', 'Ocean', 'Palace', 'Queen',
      'River', 'Sunset', 'Tiger', 'Universe', 'Valley', 'Window', 'Xylophone', 'Yacht', 'Zebra'
    ];
    
    const wordCount = Math.max(2, Math.floor(length / 6));
    const selectedWords = [];
    
    for (let i = 0; i < wordCount; i++) {
      selectedWords.push(words[Math.floor(Math.random() * words.length)]);
    }
    
    let result = selectedWords.join('-');
    
    if (includeNumbers) {
      result += '-' + Math.floor(Math.random() * 9999);
    }
    
    if (includeSymbols) {
      const symbols = '!@#$%^&*';
      result += symbols[Math.floor(Math.random() * symbols.length)];
    }
    
    return result.substring(0, length);
  }, [length, includeNumbers, includeSymbols]);

  const generatePassword = useCallback(() => {
    if (selectedPattern === 'pronounceable') {
      return generatePronounceablePassword(length);
    } else if (selectedPattern === 'passphrase') {
      return generatePassphrase();
    } else if (selectedPattern === 'pin') {
      let result = '';
      for (let i = 0; i < length; i++) {
        result += Math.floor(Math.random() * 10);
      }
      return result;
    }
    
    // 默认随机密码生成
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const similar = 'il1Lo0O';

    let chars = '';
    
    if (useCustomCharset && customCharset) {
      chars = customCharset;
    } else {
      if (includeUppercase) chars += uppercase;
      if (includeLowercase) chars += lowercase;
      if (includeNumbers) chars += numbers;
      if (includeSymbols) chars += symbols;
    }

    if (excludeSimilar && !useCustomCharset) {
      chars = chars.split('').filter(char => !similar.includes(char)).join('');
    }

    if (chars === '') {
      return '';
    }

    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols, excludeSimilar, useCustomCharset, customCharset, selectedPattern, generatePronounceablePassword, generatePassphrase]);

  // 详细强度分析
  const getPasswordStrength = useCallback((pwd: string): StrengthAnalysis => {
    if (!pwd) return { 
      score: 0, 
      label: ui.strength.none, 
      color: 'text-gray-400',
      feedback: [],
      entropy: 0,
      timeToCrack: '立即'
    };
    
    let score = 0;
    const feedback: string[] = [];
    
    // 长度检查
    if (pwd.length >= 8) score++;
    else feedback.push('密码长度至少应为8位');
    
    if (pwd.length >= 12) score++;
    else if (pwd.length >= 8) feedback.push('建议使用12位或更长的密码');
    
    // 字符类型检查
    if (/[a-z]/.test(pwd)) score++;
    else feedback.push('添加小写字母');
    
    if (/[A-Z]/.test(pwd)) score++;
    else feedback.push('添加大写字母');
    
    if (/[0-9]/.test(pwd)) score++;
    else feedback.push('添加数字');
    
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    else feedback.push('添加特殊字符');

    // 重复性检查
    const hasRepeating = /(.)\1{2,}/.test(pwd);
    if (hasRepeating) {
      score = Math.max(0, score - 1);
      feedback.push('避免连续重复字符');
    }

    // 序列检查
    const hasSequence = /(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|123|234|345|456|567|678|789)/i.test(pwd);
    if (hasSequence) {
      score = Math.max(0, score - 1);
      feedback.push('避免使用连续字符序列');
    }

    const entropy = calculateEntropy(pwd);
    const timeToCrack = estimateCrackTime(entropy);

    const labels = [
      ui.strength.veryWeak, 
      ui.strength.weak, 
      ui.strength.medium, 
      ui.strength.strong, 
      ui.strength.veryStrong, 
      ui.strength.extremelyStrong
    ];
    const colors = [
      'text-red-500', 
      'text-orange-500', 
      'text-yellow-500', 
      'text-blue-500', 
      'text-green-500', 
      'text-green-600'
    ];
    
    return {
      score: Math.min(score, 5),
      label: labels[Math.min(score, 5)],
      color: colors[Math.min(score, 5)],
      feedback: feedback.slice(0, 3), // 限制反馈数量
      entropy: Math.round(entropy * 10) / 10,
      timeToCrack
    };
  }, [ui.strength, calculateEntropy, estimateCrackTime]);

  const handleGeneratePassword = () => {
    const newPassword = generatePassword();
    setPassword(newPassword);
    
    if (newPassword) {
      const entry: PasswordEntry = {
        id: Date.now().toString(),
        password: newPassword,
        timestamp: Date.now(),
        strength: getPasswordStrength(newPassword).score,
        length: newPassword.length,
        settings: {
          includeUppercase,
          includeLowercase,
          includeNumbers,
          includeSymbols,
          excludeSimilar
        }
      };
      
      setPasswordHistory(prev => [entry, ...prev.slice(0, 19)]); // 保留最近20个
    }
  };

  const generateBatchPasswords = () => {
    const passwords = [];
    for (let i = 0; i < batchCount; i++) {
      passwords.push(generatePassword());
    }
    setBatchPasswords(passwords);
  };

  const copyPassword = async (pwd: string = password) => {
    if (pwd && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(pwd);
      } catch (error) {
        console.error('复制失败:', error);
      }
    }
  };

  const exportPasswords = (passwords: string[]) => {
    const data = passwords.join('\n');
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `passwords-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearHistory = () => {
    setPasswordHistory([]);
  };

  // 自动生成功能
  useEffect(() => {
    if (autoGenerate) {
      const interval = setInterval(() => {
        handleGeneratePassword();
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [autoGenerate, handleGeneratePassword]);

  const strength = getPasswordStrength(password);

  const tabs = [
    { id: 'generator', name: '密码生成器', icon: <Zap className="w-4 h-4" /> },
    { id: 'batch', name: '批量生成', icon: <Copy className="w-4 h-4" /> },
    { id: 'history', name: '历史记录', icon: <History className="w-4 h-4" /> },
    { id: 'analysis', name: '强度分析', icon: <Shield className="w-4 h-4" /> }
  ];

  return (
    <ToolLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {toolTranslation.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            专业的密码生成和安全分析工具
          </p>
        </div>

        {/* 标签页导航 */}
        <div className="card p-4">
          <div className="flex flex-wrap gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                }`}
              >
                {tab.icon}
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'generator' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 设置区域 */}
            <div className="space-y-6">
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {pageTranslation.generationSettings}
                </h2>

                <div className="space-y-4">
                  {/* 密码模式选择 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      密码模式
                    </label>
                    <select
                      value={selectedPattern}
                      onChange={(e) => setSelectedPattern(e.target.value)}
                      className="input"
                    >
                      <option value="">随机密码</option>
                      <option value="pronounceable">可读密码</option>
                      <option value="passphrase">密码短语</option>
                      <option value="pin">数字PIN</option>
                    </select>
                  </div>

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

                  {/* 自定义字符集 */}
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={useCustomCharset}
                        onChange={(e) => setUseCustomCharset(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">使用自定义字符集</span>
                    </label>
                    {useCustomCharset && (
                      <input
                        type="text"
                        value={customCharset}
                        onChange={(e) => setCustomCharset(e.target.value)}
                        placeholder="输入自定义字符"
                        className="input"
                      />
                    )}
                  </div>

                  {/* 字符类型 */}
                  {!useCustomCharset && selectedPattern !== 'pin' && (
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
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{pageTranslation.characterOptions.uppercase}</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={includeLowercase}
                            onChange={(e) => setIncludeLowercase(e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{pageTranslation.characterOptions.lowercase}</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={includeNumbers}
                            onChange={(e) => setIncludeNumbers(e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{pageTranslation.characterOptions.numbers}</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={includeSymbols}
                            onChange={(e) => setIncludeSymbols(e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{pageTranslation.characterOptions.symbols}</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={excludeSimilar}
                            onChange={(e) => setExcludeSimilar(e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{pageTranslation.characterOptions.excludeSimilar}</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* 自动生成 */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={autoGenerate}
                        onChange={(e) => setAutoGenerate(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">自动生成 (2秒间隔)</span>
                    </label>
                  </div>

                  {/* 生成按钮 */}
                  <button
                    onClick={handleGeneratePassword}
                    disabled={autoGenerate}
                    className="w-full btn btn-primary disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${autoGenerate ? 'animate-spin' : ''}`} />
                    {ui.buttons.generate}
                  </button>
                </div>
              </div>
            </div>

            {/* 结果区域 */}
            <div className="space-y-6">
              <div className="card p-6">
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
                      className="w-full p-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-lg"
                      placeholder="点击生成密码"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* 密码强度 */}
                  {password && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{pageTranslation.passwordStrength}:</span>
                        <span className={`text-sm font-medium ${strength.color}`}>
                          {strength.label}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            strength.score <= 1 ? 'bg-red-500' :
                            strength.score <= 2 ? 'bg-orange-500' :
                            strength.score <= 3 ? 'bg-yellow-500' :
                            strength.score <= 4 ? 'bg-blue-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${(strength.score / 5) * 100}%` }}
                        />
                      </div>
                      
                      {/* 详细信息 */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">熵值:</span>
                          <span className="ml-2 font-medium">{strength.entropy} bits</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">破解时间:</span>
                          <span className="ml-2 font-medium">{strength.timeToCrack}</span>
                        </div>
                      </div>

                      {/* 改进建议 */}
                      {strength.feedback.length > 0 && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                          <div className="flex items-center mb-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                            <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">改进建议:</span>
                          </div>
                          <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                            {strength.feedback.map((tip, index) => (
                              <li key={index}>• {tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 操作按钮 */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyPassword()}
                      disabled={!password}
                      className="flex-1 btn bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      {ui.buttons.copy}
                    </button>
                    <button
                      onClick={handleGeneratePassword}
                      className="flex-1 btn btn-primary"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      {ui.buttons.regenerate}
                    </button>
                  </div>
                </div>
              </div>

              {/* 安全提示 */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                  {pageTranslation.securityTips}
                </h3>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  {pageTranslation.securityTipsList.map((tip: string, index: number) => (
                    <li key={index}>• {tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'batch' && (
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              批量密码生成
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  生成数量:
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={batchCount}
                  onChange={(e) => setBatchCount(Number(e.target.value))}
                  className="input w-20"
                />
                <button
                  onClick={generateBatchPasswords}
                  className="btn btn-primary"
                >
                  批量生成
                </button>
                {batchPasswords.length > 0 && (
                  <button
                    onClick={() => exportPasswords(batchPasswords)}
                    className="btn bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    导出
                  </button>
                )}
              </div>

              {batchPasswords.length > 0 && (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {batchPasswords.map((pwd, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="font-mono text-sm">{showPassword ? pwd : '•'.repeat(pwd.length)}</span>
                      <div className="flex gap-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          getPasswordStrength(pwd).score <= 2 ? 'bg-red-100 text-red-800' :
                          getPasswordStrength(pwd).score <= 3 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {getPasswordStrength(pwd).label}
                        </span>
                        <button
                          onClick={() => copyPassword(pwd)}
                          className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                密码历史记录
              </h2>
              {passwordHistory.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="btn bg-red-600 hover:bg-red-700 text-white"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  清空历史
                </button>
              )}
            </div>

            {passwordHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                还没有生成过密码
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {passwordHistory.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex-1">
                      <div className="font-mono text-sm mb-1">
                        {showPassword ? entry.password : '•'.repeat(entry.password.length)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(entry.timestamp).toLocaleString()} • 长度: {entry.length}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        entry.strength <= 2 ? 'bg-red-100 text-red-800' :
                        entry.strength <= 3 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        强度: {entry.strength}/5
                      </span>
                      <button
                        onClick={() => copyPassword(entry.password)}
                        className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              密码安全分析
            </h2>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="输入要分析的密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
              />

              {password && (
                <div className="space-y-4">
                  {/* 强度指标 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-1">{strength.entropy}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">熵值 (bits)</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">{password.length}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">字符长度</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                      <div className="text-lg font-bold text-purple-600 mb-1">{strength.timeToCrack}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">破解时间</div>
                    </div>
                  </div>

                  {/* 字符组成分析 */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">字符组成分析</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="flex items-center">
                        {/[a-z]/.test(password) ? (
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                        )}
                        <span className="text-sm">小写字母</span>
                      </div>
                      <div className="flex items-center">
                        {/[A-Z]/.test(password) ? (
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                        )}
                        <span className="text-sm">大写字母</span>
                      </div>
                      <div className="flex items-center">
                        {/[0-9]/.test(password) ? (
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                        )}
                        <span className="text-sm">数字</span>
                      </div>
                      <div className="flex items-center">
                        {/[^A-Za-z0-9]/.test(password) ? (
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                        )}
                        <span className="text-sm">特殊字符</span>
                      </div>
                    </div>
                  </div>

                  {/* 安全建议 */}
                  {strength.feedback.length > 0 && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                      <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">安全建议</h3>
                      <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                        {strength.feedback.map((tip, index) => (
                          <li key={index}>• {tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
} 