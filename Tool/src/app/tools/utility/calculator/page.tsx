'use client';

import { useState, useEffect, useRef } from 'react';
import { RotateCcw, Copy, History, Calculator as CalcIcon, Function, Keyboard } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';
import { useToolTranslations } from '@/components/tool-translations';
import { useLanguage } from '@/components/language-provider';

interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: Date;
}

export default function CalculatorPage() {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isScientific, setIsScientific] = useState(false);
  const [memory, setMemory] = useState(0);
  const [isDegrees, setIsDegrees] = useState(true);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const expressionInputRef = useRef<HTMLInputElement>(null);

  const { getToolTranslation, getUITranslation, getToolPageTranslation } = useToolTranslations();
  const { t } = useLanguage();
  const toolTranslation = getToolTranslation('utility-calculator');
  const ui = getUITranslation();
  const pageTranslation = getToolPageTranslation('utility-calculator');

  // 键盘支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      
      if (e.key >= '0' && e.key <= '9') {
        inputDigit(e.key);
      } else if (e.key === '.') {
        inputDecimal();
      } else if (e.key === '+') {
        performOperation('+');
      } else if (e.key === '-') {
        performOperation('-');
      } else if (e.key === '*') {
        performOperation('×');
      } else if (e.key === '/') {
        performOperation('÷');
      } else if (e.key === 'Enter' || e.key === '=') {
        performOperation('=');
      } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        clearDisplay();
      } else if (e.key === 'Backspace') {
        backspace();
      } else if (e.ctrlKey && e.key === 'h') {
        setShowHistory(!showHistory);
      } else if (e.ctrlKey && e.key === 's') {
        setIsScientific(!isScientific);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showHistory, isScientific]);

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const backspace = () => {
    if (!waitingForOperand && display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const clearDisplay = () => {
    setDisplay('0');
    setExpression('');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const result = calculate(currentValue, inputValue, operation);
      
      // 添加到历史记录
      const historyItem: HistoryItem = {
        id: Date.now().toString(),
        expression: `${currentValue} ${operation} ${inputValue}`,
        result: result.toString(),
        timestamp: new Date()
      };
      setHistory(prev => [historyItem, ...prev.slice(0, 19)]); // 保留最近20条记录
      
      setDisplay(String(result));
      setPreviousValue(result);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, op: string): number => {
    switch (op) {
      case '+': return firstValue + secondValue;
      case '-': return firstValue - secondValue;
      case '×': return firstValue * secondValue;
      case '÷': return secondValue !== 0 ? firstValue / secondValue : 0;
      case '%': return (firstValue * secondValue) / 100;
      case '^': return Math.pow(firstValue, secondValue);
      default: return secondValue;
    }
  };

  // 科学计算函数
  const scientificOperation = (func: string) => {
    const value = parseFloat(display);
    let result = 0;
    
    switch (func) {
      case 'sin':
        result = Math.sin(isDegrees ? (value * Math.PI) / 180 : value);
        break;
      case 'cos':
        result = Math.cos(isDegrees ? (value * Math.PI) / 180 : value);
        break;
      case 'tan':
        result = Math.tan(isDegrees ? (value * Math.PI) / 180 : value);
        break;
      case 'log':
        result = Math.log10(value);
        break;
      case 'ln':
        result = Math.log(value);
        break;
      case 'sqrt':
        result = Math.sqrt(value);
        break;
      case 'square':
        result = value * value;
        break;
      case 'factorial':
        result = factorial(Math.floor(value));
        break;
      case 'reciprocal':
        result = value !== 0 ? 1 / value : 0;
        break;
      case 'pi':
        result = Math.PI;
        break;
      case 'e':
        result = Math.E;
        break;
    }
    
    // 添加到历史记录
    const historyItem: HistoryItem = {
      id: Date.now().toString(),
      expression: `${func}(${value})`,
      result: result.toString(),
      timestamp: new Date()
    };
    setHistory(prev => [historyItem, ...prev.slice(0, 19)]);
    
    setDisplay(result.toString());
    setWaitingForOperand(true);
  };

  const factorial = (n: number): number => {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
  };

  // 表达式计算
  const evaluateExpression = () => {
    if (!expression.trim()) return;
    
    try {
      // 简单的表达式解析（实际项目中应使用更安全的解析器）
      const sanitized = expression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/\^/g, '**');
      
      const result = Function('"use strict"; return (' + sanitized + ')')();
      
      const historyItem: HistoryItem = {
        id: Date.now().toString(),
        expression: expression,
        result: result.toString(),
        timestamp: new Date()
      };
      setHistory(prev => [historyItem, ...prev.slice(0, 19)]);
      
      setDisplay(result.toString());
      setExpression('');
      setWaitingForOperand(true);
    } catch (error) {
      setDisplay('错误');
      setWaitingForOperand(true);
    }
  };

  // 内存操作
  const memoryStore = () => {
    setMemory(parseFloat(display));
  };

  const memoryRecall = () => {
    setDisplay(memory.toString());
    setWaitingForOperand(true);
  };

  const memoryClear = () => {
    setMemory(0);
  };

  const memoryAdd = () => {
    setMemory(memory + parseFloat(display));
  };

  const copyToClipboard = async (text: string) => {
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
      } catch (error) {
        console.error('复制失败:', error);
      }
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

        {/* 工具栏 */}
        <div className="flex flex-wrap gap-4 justify-center items-center">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="scientific"
              checked={isScientific}
              onChange={(e) => setIsScientific(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="scientific" className="text-sm text-gray-700 dark:text-gray-300">
              科学计算
            </label>
          </div>

          {isScientific && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="degrees"
                checked={isDegrees}
                onChange={(e) => setIsDegrees(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="degrees" className="text-sm text-gray-700 dark:text-gray-300">
                角度制
              </label>
            </div>
          )}

          <button
            onClick={() => setShowHistory(!showHistory)}
            className="btn bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm"
          >
            <History className="w-4 h-4 mr-1" />
            历史记录
          </button>

          <button
            onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
            className="btn bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm"
          >
            <Keyboard className="w-4 h-4 mr-1" />
            快捷键
          </button>
        </div>

        {/* 快捷键帮助 */}
        {showKeyboardHelp && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">
              键盘快捷键
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div className="text-blue-700 dark:text-blue-300">0-9: 数字输入</div>
              <div className="text-blue-700 dark:text-blue-300">+: 加法</div>
              <div className="text-blue-700 dark:text-blue-300">-: 减法</div>
              <div className="text-blue-700 dark:text-blue-300">*: 乘法</div>
              <div className="text-blue-700 dark:text-blue-300">/: 除法</div>
              <div className="text-blue-700 dark:text-blue-300">Enter/=: 等于</div>
              <div className="text-blue-700 dark:text-blue-300">Esc/C: 清空</div>
              <div className="text-blue-700 dark:text-blue-300">Backspace: 退格</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 计算器主体 */}
          <div className={`${showHistory ? 'lg:col-span-2' : 'lg:col-span-3'} flex justify-center`}>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg w-full max-w-md">
              {/* 表达式输入 */}
              <div className="mb-4">
                <input
                  ref={expressionInputRef}
                  type="text"
                  value={expression}
                  onChange={(e) => setExpression(e.target.value)}
                  placeholder="输入表达式 (如: 2+3*4)"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      evaluateExpression();
                    }
                  }}
                />
                <button
                  onClick={evaluateExpression}
                  className="w-full mt-2 p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
                >
                  计算表达式
                </button>
              </div>

              {/* 显示屏 */}
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4">
                <div className="text-right">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1 min-h-[20px]">
                    {previousValue !== null && operation ? `${previousValue} ${operation}` : ''}
                  </div>
                  <div className="text-2xl font-mono text-gray-900 dark:text-white break-all">
                    {display}
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-gray-500">M: {memory}</span>
                    <button
                      onClick={() => copyToClipboard(display)}
                      className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
                    >
                      复制
                    </button>
                  </div>
                </div>
              </div>

              {/* 内存操作按钮 */}
              <div className="grid grid-cols-4 gap-1 mb-4">
                <button onClick={memoryClear} className="p-2 bg-red-500 hover:bg-red-600 text-white rounded text-xs">
                  MC
                </button>
                <button onClick={memoryRecall} className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs">
                  MR
                </button>
                <button onClick={memoryStore} className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs">
                  MS
                </button>
                <button onClick={memoryAdd} className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs">
                  M+
                </button>
              </div>

              {/* 科学计算按钮 */}
              {isScientific && (
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <button onClick={() => scientificOperation('sin')} className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded text-sm">
                    sin
                  </button>
                  <button onClick={() => scientificOperation('cos')} className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded text-sm">
                    cos
                  </button>
                  <button onClick={() => scientificOperation('tan')} className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded text-sm">
                    tan
                  </button>
                  <button onClick={() => scientificOperation('log')} className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded text-sm">
                    log
                  </button>
                  <button onClick={() => scientificOperation('ln')} className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded text-sm">
                    ln
                  </button>
                  <button onClick={() => scientificOperation('sqrt')} className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded text-sm">
                    √
                  </button>
                  <button onClick={() => scientificOperation('square')} className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded text-sm">
                    x²
                  </button>
                  <button onClick={() => performOperation('^')} className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded text-sm">
                    x^y
                  </button>
                  <button onClick={() => scientificOperation('factorial')} className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded text-sm">
                    n!
                  </button>
                  <button onClick={() => scientificOperation('reciprocal')} className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded text-sm">
                    1/x
                  </button>
                  <button onClick={() => scientificOperation('pi')} className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded text-sm">
                    π
                  </button>
                  <button onClick={() => scientificOperation('e')} className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded text-sm">
                    e
                  </button>
                </div>
              )}

              {/* 按钮网格 */}
              <div className="grid grid-cols-4 gap-2">
                {/* 第一行 */}
                <button onClick={clearDisplay} className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-lg">
                  {pageTranslation.clear}
                </button>
                <button onClick={backspace} className="p-4 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg">
                  ⌫
                </button>
                <button onClick={() => performOperation('%')} className="p-4 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg">
                  %
                </button>
                <button onClick={() => performOperation('÷')} className="p-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg">
                  ÷
                </button>
                
                {/* 第二行 */}
                <button onClick={() => inputDigit('7')} className="p-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg">7</button>
                <button onClick={() => inputDigit('8')} className="p-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg">8</button>
                <button onClick={() => inputDigit('9')} className="p-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg">9</button>
                <button onClick={() => performOperation('×')} className="p-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg">
                  ×
                </button>
                
                {/* 第三行 */}
                <button onClick={() => inputDigit('4')} className="p-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg">4</button>
                <button onClick={() => inputDigit('5')} className="p-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg">5</button>
                <button onClick={() => inputDigit('6')} className="p-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg">6</button>
                <button onClick={() => performOperation('-')} className="p-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg">
                  -
                </button>
                
                {/* 第四行 */}
                <button onClick={() => inputDigit('1')} className="p-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg">1</button>
                <button onClick={() => inputDigit('2')} className="p-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg">2</button>
                <button onClick={() => inputDigit('3')} className="p-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg">3</button>
                <button onClick={() => performOperation('+')} className="p-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg">
                  +
                </button>
                
                {/* 第五行 */}
                <button onClick={() => inputDigit('0')} className="p-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg col-span-2">0</button>
                <button onClick={inputDecimal} className="p-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg">.</button>
                <button onClick={() => performOperation('=')} className="p-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg">=</button>
              </div>
            </div>
          </div>

          {/* 历史记录 */}
          {showHistory && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  计算历史
                </h2>
                
                {history.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {history.map((item) => (
                      <div key={item.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
                            {item.expression}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {item.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="text-lg font-mono font-bold text-gray-900 dark:text-white">
                          = {item.result}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => {
                              setDisplay(item.result);
                              setWaitingForOperand(true);
                            }}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            使用结果
                          </button>
                          <button
                            onClick={() => copyToClipboard(item.result)}
                            className="text-xs text-green-600 dark:text-green-400 hover:underline"
                          >
                            复制
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                    暂无计算历史
                  </div>
                )}
                
                {history.length > 0 && (
                  <button
                    onClick={() => setHistory([])}
                    className="w-full mt-4 p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
                  >
                    清空历史
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 使用说明 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">
            使用说明
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">基本功能</h4>
              <ul className="space-y-1 text-blue-700 dark:text-blue-300 text-sm">
                <li>• 支持基本四则运算</li>
                <li>• 表达式输入和计算</li>
                <li>• 内存存储功能 (MC/MR/MS/M+)</li>
                <li>• 计算历史记录</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">科学计算</h4>
              <ul className="space-y-1 text-blue-700 dark:text-blue-300 text-sm">
                <li>• 三角函数 (sin/cos/tan)</li>
                <li>• 对数函数 (log/ln)</li>
                <li>• 幂运算和开方</li>
                <li>• 阶乘和倒数运算</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
} 