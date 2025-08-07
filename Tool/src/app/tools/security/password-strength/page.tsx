'use client';

import { ToolLayout } from '@/components/tool-layout';
import { useState, useMemo } from 'react';
import { Eye, EyeOff, Shield, AlertCircle, CheckCircle, RefreshCw, Copy } from 'lucide-react';

interface PasswordStrength {
  score: number;
  level: 'weak' | 'fair' | 'good' | 'strong' | 'very_strong';
  checks: {
    length: boolean;
    lowercase: boolean;
    uppercase: boolean;
    numbers: boolean;
    symbols: boolean;
    uniqueChars: boolean;
    noSequential: boolean;
    noRepeating: boolean;
  };
  suggestions: string[];
}

export default function PasswordStrengthPage() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [copied, setCopied] = useState(false);

  // 密码强度分析
  const passwordStrength: PasswordStrength = useMemo(() => {
    if (!password) {
      return {
        score: 0,
        level: 'weak',
        checks: {
          length: false,
          lowercase: false,
          uppercase: false,
          numbers: false,
          symbols: false,
          uniqueChars: false,
          noSequential: false,
          noRepeating: false,
        },
        suggestions: [],
      };
    }

    const checks = {
      length: password.length >= 12,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /[0-9]/.test(password),
      symbols: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      uniqueChars: new Set(password).size >= password.length * 0.6,
      noSequential: !hasSequentialChars(password),
      noRepeating: !hasRepeatingChars(password),
    };

    let score = 0;
    if (checks.length) score += 25;
    if (checks.lowercase) score += 10;
    if (checks.uppercase) score += 10;
    if (checks.numbers) score += 10;
    if (checks.symbols) score += 15;
    if (checks.uniqueChars) score += 10;
    if (checks.noSequential) score += 10;
    if (checks.noRepeating) score += 10;

    // 长度加分
    if (password.length >= 16) score += 10;
    if (password.length >= 20) score += 10;

    let level: PasswordStrength['level'] = 'weak';
    if (score >= 90) level = 'very_strong';
    else if (score >= 70) level = 'strong';
    else if (score >= 50) level = 'good';
    else if (score >= 30) level = 'fair';

    const suggestions = generateSuggestions(checks, password);

    return { score, level, checks, suggestions };
  }, [password]);

  function hasSequentialChars(str: string): boolean {
    for (let i = 0; i < str.length - 2; i++) {
      const char1 = str.charCodeAt(i);
      const char2 = str.charCodeAt(i + 1);
      const char3 = str.charCodeAt(i + 2);
      if (char2 === char1 + 1 && char3 === char2 + 1) {
        return true;
      }
    }
    return false;
  }

  function hasRepeatingChars(str: string): boolean {
    for (let i = 0; i < str.length - 2; i++) {
      if (str[i] === str[i + 1] && str[i + 1] === str[i + 2]) {
        return true;
      }
    }
    return false;
  }

  function generateSuggestions(checks: PasswordStrength['checks'], password: string): string[] {
    const suggestions: string[] = [];
    
    if (!checks.length) {
      suggestions.push('使用至少12个字符，建议16个以上');
    }
    if (!checks.lowercase) {
      suggestions.push('添加小写字母 (a-z)');
    }
    if (!checks.uppercase) {
      suggestions.push('添加大写字母 (A-Z)');
    }
    if (!checks.numbers) {
      suggestions.push('添加数字 (0-9)');
    }
    if (!checks.symbols) {
      suggestions.push('添加特殊符号 (!@#$%^&*)');
    }
    if (!checks.uniqueChars) {
      suggestions.push('减少重复字符，增加字符多样性');
    }
    if (!checks.noSequential) {
      suggestions.push('避免连续字符 (如: abc, 123)');
    }
    if (!checks.noRepeating) {
      suggestions.push('避免重复字符 (如: aaa, 111)');
    }

    if (suggestions.length === 0) {
      suggestions.push('密码强度很好！建议定期更换');
    }

    return suggestions;
  }

  const generateRandomPassword = () => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = lowercase + uppercase + numbers + symbols;
    let result = '';
    
    // 确保包含每种类型的字符
    result += lowercase[Math.floor(Math.random() * lowercase.length)];
    result += uppercase[Math.floor(Math.random() * uppercase.length)];
    result += numbers[Math.floor(Math.random() * numbers.length)];
    result += symbols[Math.floor(Math.random() * symbols.length)];
    
    // 生成剩余的字符
    for (let i = 4; i < 16; i++) {
      result += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // 打乱字符顺序
    const shuffled = result.split('').sort(() => Math.random() - 0.5).join('');
    setGeneratedPassword(shuffled);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const strengthColors = {
    weak: 'bg-red-500',
    fair: 'bg-orange-500',
    good: 'bg-yellow-500',
    strong: 'bg-blue-500',
    very_strong: 'bg-green-500',
  };

  const strengthLabels = {
    weak: '很弱',
    fair: '较弱',
    good: '一般',
    strong: '强',
    very_strong: '很强',
  };

  return (
    <ToolLayout>
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          密码强度检测器
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          检测密码强度并获取安全建议
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 密码检测区域 */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              密码检测
            </h2>
            
            <div className="space-y-4">
              {/* 密码输入 */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="输入密码进行检测..."
                  className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* 强度显示 */}
              {password && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      强度等级: {strengthLabels[passwordStrength.level]}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {passwordStrength.score}/100
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${strengthColors[passwordStrength.level]}`}
                      style={{ width: `${passwordStrength.score}%` }}
                    />
                  </div>
                </div>
              )}

              {/* 检查项目 */}
              {password && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    安全检查项目:
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {Object.entries({
                      length: '长度不少于12位',
                      lowercase: '包含小写字母',
                      uppercase: '包含大写字母',
                      numbers: '包含数字',
                      symbols: '包含特殊符号',
                      uniqueChars: '字符多样性',
                      noSequential: '无连续字符',
                      noRepeating: '无重复字符',
                    }).map(([key, label]) => (
                      <div key={key} className="flex items-center gap-2">
                        {passwordStrength.checks[key as keyof typeof passwordStrength.checks] ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`text-sm ${
                          passwordStrength.checks[key as keyof typeof passwordStrength.checks]
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 安全建议 */}
          {password && passwordStrength.suggestions.length > 0 && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-500" />
                安全建议
              </h2>
              <ul className="space-y-2">
                {passwordStrength.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 密码生成区域 */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              安全密码生成器
            </h2>
            
            <div className="space-y-4">
              <button
                onClick={generateRandomPassword}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                生成安全密码
              </button>

              {generatedPassword && (
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={generatedPassword}
                      readOnly
                      className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(generatedPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => setPassword(generatedPassword)}
                    className="w-full px-4 py-2 border border-blue-500 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    使用此密码进行检测
                  </button>

                  {copied && (
                    <div className="p-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg text-sm text-center">
                      密码已复制到剪贴板
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 密码安全指南 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              密码安全指南
            </h2>
            
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>使用至少12个字符，建议16个以上</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>混合使用大小写字母、数字和特殊符号</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>避免使用个人信息（生日、姓名等）</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>每个账户使用不同的密码</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>定期更换重要账户密码</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>使用密码管理器保存密码</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}