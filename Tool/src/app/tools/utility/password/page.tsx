'use client';

import { useState } from 'react';
import { Copy, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';
import { useToolTranslations } from '@/components/tool-translations';
import { useLanguage } from '@/components/language-provider';

export default function PasswordGeneratorPage() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(12);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(false);
  const [excludeSimilar, setExcludeSimilar] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const { getToolTranslation, getUITranslation, getToolPageTranslation } = useToolTranslations();
  const { t } = useLanguage();
  const toolTranslation = getToolTranslation('utility-password');
  const ui = getUITranslation();
  const pageTranslation = getToolPageTranslation('utility-password');

  const generatePassword = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const similar = 'il1Lo0O';

    let chars = '';
    if (includeUppercase) chars += uppercase;
    if (includeLowercase) chars += lowercase;
    if (includeNumbers) chars += numbers;
    if (includeSymbols) chars += symbols;

    if (excludeSimilar) {
      chars = chars.split('').filter(char => !similar.includes(char)).join('');
    }

    if (chars === '') {
      setPassword('');
      return;
    }

    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    setPassword(result);
  };

  const copyPassword = async () => {
    if (password && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(password);
      } catch (error) {
        console.error('复制失败:', error);
      }
    }
  };

  const getPasswordStrength = () => {
    if (!password) return { score: 0, label: ui.strength.none, color: 'text-gray-400' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const labels = [ui.strength.veryWeak, ui.strength.weak, ui.strength.medium, ui.strength.strong, ui.strength.veryStrong, ui.strength.extremelyStrong];
    const colors = ['text-red-500', 'text-orange-500', 'text-yellow-500', 'text-blue-500', 'text-green-500', 'text-green-600'];
    
    return {
      score: Math.min(score, 5),
      label: labels[Math.min(score, 5)],
      color: colors[Math.min(score, 5)]
    };
  };

  const strength = getPasswordStrength();

  return (
    <ToolLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {toolTranslation.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {toolTranslation.description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 设置区域 */}
          <div className="space-y-6">
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
                    max="64"
                    value={length}
                    onChange={(e) => setLength(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>4</span>
                    <span>64</span>
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

                {/* 生成按钮 */}
                <button
                  onClick={generatePassword}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  {ui.buttons.generate}
                </button>
              </div>
            </div>
          </div>

          {/* 结果区域 */}
          <div className="space-y-6">
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
                    className="w-full p-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-lg"
                    placeholder={ui.placeholders.enterText}
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
                  <div className="space-y-2">
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
                  </div>
                )}

                {/* 操作按钮 */}
                <div className="flex gap-2">
                  <button
                    onClick={copyPassword}
                    disabled={!password}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    {ui.buttons.copy}
                  </button>
                  <button
                    onClick={generatePassword}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
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
      </div>
    </ToolLayout>
  );
} 