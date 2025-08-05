'use client';

import { useState, useEffect } from 'react';
import { ToolLayout } from '@/components/tool-layout';
import { DollarSign, ArrowUpDown, TrendingUp, RefreshCw, Clock } from 'lucide-react';

interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  lastUpdate: string;
}

export default function CurrencyConverterPage() {
  const [amount, setAmount] = useState<string>('100');
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('CNY');
  const [convertedAmount, setConvertedAmount] = useState<number>(0);
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  // 主要货币列表
  const currencies: Currency[] = [
    { code: 'USD', name: '美元', symbol: '$', flag: '🇺🇸' },
    { code: 'CNY', name: '人民币', symbol: '¥', flag: '🇨🇳' },
    { code: 'EUR', name: '欧元', symbol: '€', flag: '🇪🇺' },
    { code: 'GBP', name: '英镑', symbol: '£', flag: '🇬🇧' },
    { code: 'JPY', name: '日元', symbol: '¥', flag: '🇯🇵' },
    { code: 'KRW', name: '韩元', symbol: '₩', flag: '🇰🇷' },
    { code: 'HKD', name: '港币', symbol: 'HK$', flag: '🇭🇰' },
    { code: 'SGD', name: '新加坡元', symbol: 'S$', flag: '🇸🇬' },
    { code: 'AUD', name: '澳元', symbol: 'A$', flag: '🇦🇺' },
    { code: 'CAD', name: '加元', symbol: 'C$', flag: '🇨🇦' },
    { code: 'CHF', name: '瑞士法郎', symbol: 'CHF', flag: '🇨🇭' },
    { code: 'THB', name: '泰铢', symbol: '฿', flag: '🇹🇭' },
    { code: 'MYR', name: '马来西亚林吉特', symbol: 'RM', flag: '🇲🇾' },
    { code: 'RUB', name: '俄罗斯卢布', symbol: '₽', flag: '🇷🇺' },
    { code: 'INR', name: '印度卢比', symbol: '₹', flag: '🇮🇳' },
    { code: 'BRL', name: '巴西雷亚尔', symbol: 'R$', flag: '🇧🇷' },
  ];

  // 模拟汇率数据（实际应用中应该从API获取）
  const getMockExchangeRate = (from: string, to: string): number => {
    const rates: { [key: string]: number } = {
      'USD-CNY': 7.25,
      'USD-EUR': 0.85,
      'USD-GBP': 0.73,
      'USD-JPY': 110.50,
      'USD-KRW': 1180.00,
      'USD-HKD': 7.80,
      'USD-SGD': 1.35,
      'USD-AUD': 1.45,
      'USD-CAD': 1.25,
      'USD-CHF': 0.92,
      'USD-THB': 33.50,
      'USD-MYR': 4.15,
      'USD-RUB': 75.50,
      'USD-INR': 74.20,
      'USD-BRL': 5.20,
      'CNY-USD': 1 / 7.25,
      'EUR-USD': 1 / 0.85,
      'GBP-USD': 1 / 0.73,
      'JPY-USD': 1 / 110.50,
      'KRW-USD': 1 / 1180.00,
      'HKD-USD': 1 / 7.80,
      'SGD-USD': 1 / 1.35,
      'AUD-USD': 1 / 1.45,
      'CAD-USD': 1 / 1.25,
      'CHF-USD': 1 / 0.92,
      'THB-USD': 1 / 33.50,
      'MYR-USD': 1 / 4.15,
      'RUB-USD': 1 / 75.50,
      'INR-USD': 1 / 74.20,
      'BRL-USD': 1 / 5.20,
    };

    if (from === to) return 1;

    const directRate = rates[`${from}-${to}`];
    if (directRate) return directRate;

    // 通过USD进行转换
    const fromToUsd = rates[`${from}-USD`] || 1;
    const usdToTo = rates[`USD-${to}`] || 1;
    return fromToUsd * usdToTo;
  };

  const convertCurrency = async () => {
    setIsLoading(true);
    
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const rate = getMockExchangeRate(fromCurrency, toCurrency);
    const result = parseFloat(amount) * rate;
    
    setExchangeRate(rate);
    setConvertedAmount(result);
    setLastUpdate(new Date().toLocaleString('zh-CN'));
    setIsLoading(false);
  };

  useEffect(() => {
    if (amount && fromCurrency && toCurrency) {
      convertCurrency();
    }
  }, [amount, fromCurrency, toCurrency]);

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const formatAmount = (value: number, currencyCode: string) => {
    const currency = currencies.find(c => c.code === currencyCode);
    return new Intl.NumberFormat('zh-CN', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(value) + ' ' + (currency?.symbol || currencyCode);
  };

  const getPopularPairs = () => [
    { from: 'USD', to: 'CNY', label: '美元 → 人民币' },
    { from: 'EUR', to: 'CNY', label: '欧元 → 人民币' },
    { from: 'GBP', to: 'CNY', label: '英镑 → 人民币' },
    { from: 'JPY', to: 'CNY', label: '日元 → 人民币' },
    { from: 'HKD', to: 'CNY', label: '港币 → 人民币' },
    { from: 'CNY', to: 'USD', label: '人民币 → 美元' },
  ];

  return (
    <ToolLayout>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <DollarSign className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            汇率转换器
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            实时汇率查询和货币转换
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 转换器主界面 */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <ArrowUpDown className="h-5 w-5 mr-2" />
              货币转换
            </h2>
            
            <div className="space-y-6">
              {/* 金额输入 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  转换金额
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="100"
                  min="0"
                  step="0.01"
                />
              </div>

              {/* 货币选择 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    从
                  </label>
                  <select
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    {currencies.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.flag} {currency.code} - {currency.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-center md:justify-start">
                  <button
                    onClick={swapCurrencies}
                    className="p-3 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
                    title="交换货币"
                  >
                    <ArrowUpDown className="h-5 w-5" />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    到
                  </label>
                  <select
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    {currencies.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.flag} {currency.code} - {currency.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 转换结果 */}
              <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg p-6">
                <div className="text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {formatAmount(parseFloat(amount) || 0, fromCurrency)} =
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                        计算中...
                      </div>
                    ) : (
                      formatAmount(convertedAmount, toCurrency)
                    )}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    汇率: 1 {fromCurrency} = {exchangeRate.toFixed(6)} {toCurrency}
                  </div>
                </div>
              </div>

              {/* 更新时间 */}
              {lastUpdate && (
                <div className="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="h-4 w-4 mr-1" />
                  最后更新: {lastUpdate}
                </div>
              )}
            </div>
          </div>

          {/* 侧边栏 */}
          <div className="space-y-6">
            {/* 热门汇率 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                热门汇率
              </h3>
              <div className="space-y-3">
                {getPopularPairs().map((pair, index) => {
                  const rate = getMockExchangeRate(pair.from, pair.to);
                  return (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      onClick={() => {
                        setFromCurrency(pair.from);
                        setToCurrency(pair.to);
                      }}
                    >
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {pair.label}
                      </span>
                      <span className="text-sm text-gray-900 dark:text-white font-mono">
                        {rate.toFixed(4)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 计算器 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                快速计算
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[1, 10, 100, 1000, 10000].map((value) => (
                  <button
                    key={value}
                    onClick={() => setAmount(value.toString())}
                    className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-2">
            💡 使用说明
          </h3>
          <ul className="text-amber-800 dark:text-amber-200 space-y-1 text-sm">
            <li>• <strong>实时汇率：</strong>汇率数据定期更新，确保准确性</li>
            <li>• <strong>多货币支持：</strong>支持全球主要货币的相互转换</li>
            <li>• <strong>快速切换：</strong>点击交换按钮快速切换货币对</li>
            <li>• <strong>热门汇率：</strong>点击侧边栏的热门汇率快速设置</li>
            <li>• <strong>注意事项：</strong>汇率仅供参考，实际兑换请以银行汇率为准</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}