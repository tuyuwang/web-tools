'use client';

import { useState, useEffect } from 'react';
import { ArrowLeftRight, TrendingUp, RefreshCw } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';
import { useLanguage } from '@/components/language-provider';

// 主要货币列表
const currencies = [
  { code: 'USD', name: '美元', symbol: '$' },
  { code: 'EUR', name: '欧元', symbol: '€' },
  { code: 'GBP', name: '英镑', symbol: '£' },
  { code: 'JPY', name: '日元', symbol: '¥' },
  { code: 'CNY', name: '人民币', symbol: '¥' },
  { code: 'KRW', name: '韩元', symbol: '₩' },
  { code: 'AUD', name: '澳元', symbol: 'A$' },
  { code: 'CAD', name: '加元', symbol: 'C$' },
  { code: 'CHF', name: '瑞士法郎', symbol: 'CHF' },
  { code: 'HKD', name: '港币', symbol: 'HK$' },
  { code: 'SGD', name: '新币', symbol: 'S$' },
  { code: 'INR', name: '印度卢比', symbol: '₹' },
];

// 模拟汇率数据（实际应用中应该从API获取）
const mockExchangeRates: Record<string, Record<string, number>> = {
  USD: { EUR: 0.85, GBP: 0.73, JPY: 110, CNY: 7.20, KRW: 1180, AUD: 1.35, CAD: 1.25, CHF: 0.92, HKD: 7.75, SGD: 1.35, INR: 74.5 },
  EUR: { USD: 1.18, GBP: 0.86, JPY: 129, CNY: 8.47, KRW: 1390, AUD: 1.59, CAD: 1.47, CHF: 1.08, HKD: 9.13, SGD: 1.59, INR: 87.8 },
  CNY: { USD: 0.139, EUR: 0.118, GBP: 0.101, JPY: 15.28, KRW: 164, AUD: 0.188, CAD: 0.174, CHF: 0.128, HKD: 1.08, SGD: 0.188, INR: 10.35 },
  // 其他货币的汇率...
};

export default function CurrencyConverterPage() {
  const { t } = useLanguage();
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('CNY');
  const [fromAmount, setFromAmount] = useState('1');
  const [toAmount, setToAmount] = useState('');
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // 计算汇率转换
  const calculateExchange = async () => {
    setLoading(true);
    
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 获取汇率（实际应用中应该从真实API获取）
      let rate = 1;
      if (fromCurrency === toCurrency) {
        rate = 1;
      } else if (mockExchangeRates[fromCurrency] && mockExchangeRates[fromCurrency][toCurrency]) {
        rate = mockExchangeRates[fromCurrency][toCurrency];
      } else if (mockExchangeRates[toCurrency] && mockExchangeRates[toCurrency][fromCurrency]) {
        rate = 1 / mockExchangeRates[toCurrency][fromCurrency];
      } else {
        // 通过USD中转
        const toUSD = mockExchangeRates[fromCurrency]?.USD || 1;
        const fromUSD = mockExchangeRates.USD[toCurrency] || 1;
        rate = toUSD * fromUSD;
      }
      
      setExchangeRate(rate);
      const amount = parseFloat(fromAmount) || 0;
      setToAmount((amount * rate).toFixed(4));
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Exchange rate fetch failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // 交换货币
  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  // 当货币或金额变化时重新计算
  useEffect(() => {
    if (fromAmount) {
      calculateExchange();
    }
  }, [fromCurrency, toCurrency, fromAmount]);

  // 初始加载
  useEffect(() => {
    calculateExchange();
  }, []);

  const handleAmountChange = (value: string) => {
    // 只允许数字和小数点
    const sanitized = value.replace(/[^0-9.]/g, '');
    setFromAmount(sanitized);
  };

  const getCurrencyName = (code: string) => {
    return currencies.find(c => c.code === code)?.name || code;
  };

  const getCurrencySymbol = (code: string) => {
    return currencies.find(c => c.code === code)?.symbol || code;
  };

  return (
    <ToolLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 标题区域 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            汇率转换器
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            实时汇率查询和货币转换，支持全球主要货币
          </p>
        </div>

        {/* 主要转换器 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 源货币 */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                从
              </label>
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {currencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={fromAmount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="输入金额"
                className="w-full px-3 py-3 text-lg border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* 交换按钮 */}
            <div className="flex items-center justify-center">
              <button
                onClick={swapCurrencies}
                className="p-3 rounded-full bg-primary-100 text-primary-600 hover:bg-primary-200 transition-colors dark:bg-primary-900 dark:text-primary-300"
                title="交换货币"
              >
                <ArrowLeftRight className="w-6 h-6" />
              </button>
            </div>

            {/* 目标货币 */}
            <div className="space-y-4 md:col-start-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                到
              </label>
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {currencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
              <div className="relative">
                <input
                  type="text"
                  value={toAmount}
                  readOnly
                  placeholder="转换结果"
                  className="w-full px-3 py-3 text-lg border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-600 dark:border-gray-600 dark:text-white"
                />
                {loading && (
                  <RefreshCw className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
                )}
              </div>
            </div>
          </div>

          {/* 汇率信息 */}
          {exchangeRate && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
                  </span>
                </div>
                {lastUpdated && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    更新时间: {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 常用货币表格 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {fromCurrency} 兑换主要货币
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {currencies
              .filter(currency => currency.code !== fromCurrency)
              .slice(0, 8)
              .map((currency) => {
                const rate = fromCurrency === currency.code 
                  ? 1 
                  : mockExchangeRates[fromCurrency]?.[currency.code] || 
                    (mockExchangeRates[currency.code]?.[fromCurrency] ? 1 / mockExchangeRates[currency.code][fromCurrency] : 0);
                
                return (
                  <div key={currency.code} className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {currency.code}
                    </div>
                    <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
                      {rate ? rate.toFixed(4) : 'N/A'}
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
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            使用说明
          </h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li>• 选择源货币和目标货币</li>
            <li>• 输入要转换的金额</li>
            <li>• 系统会自动计算转换结果</li>
            <li>• 点击交换按钮可以快速切换货币</li>
            <li>• 汇率数据会定期更新</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}