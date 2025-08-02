'use client';

import { useState } from 'react';
import { RotateCcw, Copy } from 'lucide-react';

export default function CalculatorPage() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

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

  const clearDisplay = () => {
    setDisplay('0');
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
      const newValue = calculate(currentValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, op: string): number => {
    switch (op) {
      case '+': return firstValue + secondValue;
      case '-': return firstValue - secondValue;
      case '×': return firstValue * secondValue;
      case '÷': return firstValue / secondValue;
      default: return secondValue;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          计算器
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          基础计算功能，支持四则运算
        </p>
      </div>

      <div className="flex justify-center">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
          {/* 显示屏 */}
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                {previousValue !== null && operation ? `${previousValue} ${operation}` : ''}
              </div>
              <div className="text-2xl font-mono text-gray-900 dark:text-white">
                {display}
              </div>
            </div>
          </div>

          {/* 按钮网格 */}
          <div className="grid grid-cols-4 gap-2">
            {/* 第一行 */}
            <button onClick={clearDisplay} className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-lg">C</button>
            <button onClick={() => setDisplay(String(-parseFloat(display)))} className="p-4 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg">±</button>
            <button onClick={() => performOperation('%')} className="p-4 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg">%</button>
            <button onClick={() => performOperation('÷')} className="p-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg">÷</button>
            
            {/* 第二行 */}
            <button onClick={() => inputDigit('7')} className="p-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg">7</button>
            <button onClick={() => inputDigit('8')} className="p-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg">8</button>
            <button onClick={() => inputDigit('9')} className="p-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg">9</button>
            <button onClick={() => performOperation('×')} className="p-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg">×</button>
            
            {/* 第三行 */}
            <button onClick={() => inputDigit('4')} className="p-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg">4</button>
            <button onClick={() => inputDigit('5')} className="p-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg">5</button>
            <button onClick={() => inputDigit('6')} className="p-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg">6</button>
            <button onClick={() => performOperation('-')} className="p-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg">-</button>
            
            {/* 第四行 */}
            <button onClick={() => inputDigit('1')} className="p-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg">1</button>
            <button onClick={() => inputDigit('2')} className="p-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg">2</button>
            <button onClick={() => inputDigit('3')} className="p-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg">3</button>
            <button onClick={() => performOperation('+')} className="p-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg">+</button>
            
            {/* 第五行 */}
            <button onClick={() => inputDigit('0')} className="p-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg col-span-2">0</button>
            <button onClick={inputDecimal} className="p-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg">.</button>
            <button onClick={() => performOperation('=')} className="p-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg">=</button>
          </div>
        </div>
      </div>
    </div>
  );
} 