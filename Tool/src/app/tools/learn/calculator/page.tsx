'use client';

import { useState } from 'react';
import { Calculator, RotateCcw, Copy, History } from 'lucide-react';

interface CalculationHistory {
  id: string;
  expression: string;
  result: string;
  timestamp: Date;
}

export default function MathCalculatorPage() {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [history, setHistory] = useState<CalculationHistory[]>([]);

  // 安全评估数学表达式
  const evaluateExpression = (expr: string): string => {
    try {
      // 移除所有空格
      const cleanExpr = expr.replace(/\s/g, '');
      
      // 安全检查：只允许数字、运算符、括号、小数点和基本数学函数
      const allowedChars = /^[0-9+\-*/().,eπ\s]+$/;
      const allowedFunctions = /^(sin|cos|tan|log|ln|sqrt|pow|abs|floor|ceil|round|max|min|exp|PI|E)\s*\(/;
      
      if (!allowedChars.test(cleanExpr) && !allowedFunctions.test(cleanExpr)) {
        throw new Error('表达式包含不允许的字符');
      }

      // 替换数学常数
      let processedExpr = cleanExpr
        .replace(/π/g, 'Math.PI')
        .replace(/e/g, 'Math.E');

      // 替换数学函数
      processedExpr = processedExpr
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/pow\(/g, 'Math.pow(')
        .replace(/abs\(/g, 'Math.abs(')
        .replace(/floor\(/g, 'Math.floor(')
        .replace(/ceil\(/g, 'Math.ceil(')
        .replace(/round\(/g, 'Math.round(')
        .replace(/max\(/g, 'Math.max(')
        .replace(/min\(/g, 'Math.min(')
        .replace(/exp\(/g, 'Math.exp(');

      // 使用Function构造函数安全评估
      const calculate = new Function('return ' + processedExpr);
      const calculatedResult = calculate();
      
      if (typeof calculatedResult !== 'number' || !isFinite(calculatedResult)) {
        throw new Error('计算结果无效');
      }

      return calculatedResult.toString();
    } catch (err) {
      throw new Error('计算错误：' + (err instanceof Error ? err.message : '未知错误'));
    }
  };

  const calculate = () => {
    if (!expression.trim()) {
      setError('请输入表达式');
      return;
    }

    try {
      setError('');
      const calculatedResult = evaluateExpression(expression);
      setResult(calculatedResult);

      // 添加到历史记录
      const historyItem: CalculationHistory = {
        id: Date.now().toString(),
        expression: expression,
        result: calculatedResult,
        timestamp: new Date(),
      };
      setHistory(prev => [historyItem, ...prev.slice(0, 9)]); // 保留最近10条
    } catch (err) {
      setError(err instanceof Error ? err.message : '计算失败');
      setResult('');
    }
  };

  const clearAll = () => {
    setExpression('');
    setResult('');
    setError('');
  };

  const copyResult = async () => {
    if (result && navigator.clipboard) {
      await navigator.clipboard.writeText(result);
    }
  };

  const loadFromHistory = (item: CalculationHistory) => {
    setExpression(item.expression);
    setResult(item.result);
    setError('');
  };

  const insertSymbol = (symbol: string) => {
    setExpression(prev => prev + symbol);
  };

  const commonExpressions = [
    { name: '基本运算', expr: '2 + 3 * 4' },
    { name: '三角函数', expr: 'sin(π/2)' },
    { name: '对数函数', expr: 'log(100)' },
    { name: '平方根', expr: 'sqrt(16)' },
    { name: '幂运算', expr: 'pow(2, 3)' },
    { name: '绝对值', expr: 'abs(-5)' },
    { name: '自然对数', expr: 'ln(e)' },
    { name: '指数函数', expr: 'exp(1)' },
  ];

  const mathSymbols = [
    { symbol: '+', name: '加号' },
    { symbol: '-', name: '减号' },
    { symbol: '*', name: '乘号' },
    { symbol: '/', name: '除号' },
    { symbol: '(', name: '左括号' },
    { symbol: ')', name: '右括号' },
    { symbol: '.', name: '小数点' },
    { symbol: 'π', name: '圆周率' },
    { symbol: 'e', name: '自然常数' },
  ];

  const mathFunctions = [
    { func: 'sin(', name: '正弦' },
    { func: 'cos(', name: '余弦' },
    { func: 'tan(', name: '正切' },
    { func: 'log(', name: '常用对数' },
    { func: 'ln(', name: '自然对数' },
    { func: 'sqrt(', name: '平方根' },
    { func: 'pow(', name: '幂运算' },
    { func: 'abs(', name: '绝对值' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          数学公式计算器
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          支持复杂数学计算、科学计算、三角函数等
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 计算区域 */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              数学计算
            </h2>

            <div className="space-y-4">
              {/* 表达式输入 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  数学表达式
                </label>
                <input
                  type="text"
                  value={expression}
                  onChange={(e) => setExpression(e.target.value)}
                  placeholder="输入数学表达式，如: 2 + 3 * 4"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 操作按钮 */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={calculate}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Calculator className="w-4 h-4" />
                  计算
                </button>
                <button
                  onClick={clearAll}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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

              {/* 计算结果 */}
              {result && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                        计算结果
                      </h3>
                      <p className="text-lg font-mono text-green-700 dark:text-green-300">
                        {result}
                      </p>
                    </div>
                    <button
                      onClick={copyResult}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 hover:bg-green-200 dark:bg-green-800 dark:hover:bg-green-700 text-green-700 dark:text-green-300 rounded transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                      复制
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 数学符号 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              数学符号
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {mathSymbols.map((symbol, index) => (
                <button
                  key={index}
                  onClick={() => insertSymbol(symbol.symbol)}
                  className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition-colors"
                  title={symbol.name}
                >
                  <span className="font-mono">{symbol.symbol}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 数学函数 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              数学函数
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {mathFunctions.map((func, index) => (
                <button
                  key={index}
                  onClick={() => insertSymbol(func.func)}
                  className="p-2 text-left bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition-colors"
                >
                  <div className="text-sm font-mono">{func.func.slice(0, -1)}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{func.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 常用表达式和历史记录 */}
        <div className="space-y-6">
          {/* 常用表达式 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              常用表达式
            </h2>
            <div className="grid grid-cols-1 gap-2">
              {commonExpressions.map((expr, index) => (
                <button
                  key={index}
                  onClick={() => setExpression(expr.expr)}
                  className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {expr.name}
                  </div>
                  <div className="text-xs font-mono text-gray-500 dark:text-gray-400">
                    {expr.expr}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 计算历史 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              计算历史
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
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {item.timestamp.toLocaleTimeString()}
                      </span>
                      <History className="w-3 h-3 text-gray-400" />
                    </div>
                    <div className="text-sm font-mono text-gray-700 dark:text-gray-300 mt-1">
                      {item.expression} = {item.result}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Calculator className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">暂无计算历史</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 