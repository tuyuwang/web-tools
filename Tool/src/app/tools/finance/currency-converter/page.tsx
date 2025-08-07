'use client';

import { useState, useEffect } from 'react';
import { Copy, RefreshCw, ArrowUpDown } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';
import { useLanguage } from '@/components/language-provider';

// 主要货币列表
const currencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
];

// 模拟汇率数据（在实际应用中应该从API获取）
const mockExchangeRates: Record<string, Record<string, number>> = {
  USD: {
    EUR: 0.85, GBP: 0.73, JPY: 110.0, CNY: 6.45, KRW: 1180.0,
    CAD: 1.25, AUD: 1.35, CHF: 0.92, HKD: 7.75, SGD: 1.35,
    INR: 74.5, RUB: 75.0, BRL: 5.2, MXN: 20.0
  },
  EUR: {
    USD: 1.18, GBP: 0.86, JPY: 129.5, CNY: 7.59, KRW: 1390.0,
    CAD: 1.47, AUD: 1.59, CHF: 1.08, HKD: 9.13, SGD: 1.59,
    INR: 87.8, RUB: 88.4, BRL: 6.13, MXN: 23.6
  },
  // 添加更多基础货币的汇率...
};

// 获取汇率的函数
const getExchangeRate = (from: string, to: string): number => {
  if (from === to) return 1;
  
  // 如果有直接汇率
  if (mockExchangeRates[from]?.[to]) {
    return mockExchangeRates[from][to];
  }
  
  // 通过USD作为中介货币计算
  if (from !== 'USD' && to !== 'USD') {
    const fromToUsd = mockExchangeRates['USD'][from] ? 1 / mockExchangeRates['USD'][from] : 1;
    const usdToTo = mockExchangeRates['USD'][to] || 1;
    return fromToUsd * usdToTo;
  }
  
  // 如果是从USD转换
  if (from === 'USD') {
    return mockExchangeRates[from]?.[to] || 1;
  }
  
  // 如果是转换为USD
  if (to === 'USD') {
    return mockExchangeRates['USD'][from] ? 1 / mockExchangeRates['USD'][from] : 1;
  }
  
  return 1;
};

export default function CurrencyConverterPage() {
  const { t } = useLanguage();
  const [amount, setAmount] = useState('1');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [result, setResult] = useState('');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const convertCurrency = () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum)) {
      setResult('');
      return;
    }

    const rate = getExchangeRate(fromCurrency, toCurrency);
    const convertedAmount = amountNum * rate;
    setResult(convertedAmount.toFixed(4));
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const copyResult = async () => {
    if (result) {
      await navigator.clipboard.writeText(result);
    }
  };

  const refreshRates = () => {
    setLastUpdated(new Date());
    convertCurrency();
  };

  useEffect(() => {
    convertCurrency();
  }, [amount, fromCurrency, toCurrency]);

  const fromCurrencyInfo = currencies.find(c => c.code === fromCurrency);
  const toCurrencyInfo = currencies.find(c => c.code === toCurrency);
  const rate = getExchangeRate(fromCurrency, toCurrency);

  return (
    <ToolLayout
      title="汇率转换器"
      description="实时汇率转换，支持全球主要货币"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 转换器主界面 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            {/* 原始金额 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                金额
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="输入金额"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  从
                </label>
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  {currencies.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 交换按钮 */}
            <div className="flex justify-center">
              <button
                onClick={swapCurrencies}
                className="p-2 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                title="交换货币"
              >
                <ArrowUpDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* 目标货币 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                转换结果
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={result}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-600 dark:text-white"
                  placeholder="转换结果"
                />
                {result && (
                  <button
                    onClick={copyResult}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    title="复制结果"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  到
                </label>
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  {currencies.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 汇率信息 */}
          {result && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <p>
                    1 {fromCurrencyInfo?.code} = {rate.toFixed(4)} {toCurrencyInfo?.code}
                  </p>
                  <p>
                    1 {toCurrencyInfo?.code} = {(1/rate).toFixed(4)} {fromCurrencyInfo?.code}
                  </p>
                </div>
                <button
                  onClick={refreshRates}
                  className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                  title="刷新汇率"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="text-sm">刷新</span>
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                最后更新: {lastUpdated.toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* 常用汇率表 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            常用汇率 (基于 1 {fromCurrencyInfo?.code})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {currencies
              .filter(currency => currency.code !== fromCurrency)
              .slice(0, 8)
              .map((currency) => {
                const rate = getExchangeRate(fromCurrency, currency.code);
                return (
                  <div
                    key={currency.code}
                    className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => setToCurrency(currency.code)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {currency.code}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {rate.toFixed(4)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {currency.name}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* 使用说明 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            使用说明
          </h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>• 输入要转换的金额，选择原始货币和目标货币</p>
            <p>• 点击交换按钮可以快速交换两种货币</p>
            <p>• 点击常用汇率表中的货币可以快速设置目标货币</p>
            <p>• 汇率数据为模拟数据，实际使用请以银行汇率为准</p>
            <p>• 支持复制转换结果到剪贴板</p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}