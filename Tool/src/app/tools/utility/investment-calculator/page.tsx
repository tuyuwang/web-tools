'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Calendar, BarChart3 } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';

interface InvestmentResult {
  finalAmount: number;
  totalInvested: number;
  totalReturn: number;
  annualData: Array<{
    year: number;
    invested: number;
    value: number;
    return: number;
  }>;
}

export default function InvestmentCalculatorPage() {
  const [initialAmount, setInitialAmount] = useState<number>(10000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(1000);
  const [annualReturn, setAnnualReturn] = useState<number>(8);
  const [years, setYears] = useState<number>(10);
  const [calculationType, setCalculationType] = useState<'compound' | 'regular'>('compound');
  const [result, setResult] = useState<InvestmentResult | null>(null);

  const calculateInvestment = () => {
    const monthlyRate = annualReturn / 100 / 12;
    const totalMonths = years * 12;
    const annualData = [];

    if (calculationType === 'compound') {
      // 复利计算
      let currentValue = initialAmount;
      let totalInvested = initialAmount;

      for (let year = 1; year <= years; year++) {
        for (let month = 1; month <= 12; month++) {
          currentValue += monthlyContribution;
          totalInvested += monthlyContribution;
          currentValue *= (1 + monthlyRate);
        }
        
        annualData.push({
          year,
          invested: totalInvested,
          value: currentValue,
          return: currentValue - totalInvested
        });
      }

      setResult({
        finalAmount: currentValue,
        totalInvested,
        totalReturn: currentValue - totalInvested,
        annualData
      });
    } else {
      // 定期投资计算
      let totalInvested = initialAmount;
      let currentValue = initialAmount;

      for (let year = 1; year <= years; year++) {
        const yearStartValue = currentValue;
        const yearStartInvested = totalInvested;
        
        for (let month = 1; month <= 12; month++) {
          currentValue += monthlyContribution;
          totalInvested += monthlyContribution;
          currentValue *= (1 + monthlyRate);
        }
        
        annualData.push({
          year,
          invested: totalInvested,
          value: currentValue,
          return: currentValue - totalInvested
        });
      }

      setResult({
        finalAmount: currentValue,
        totalInvested,
        totalReturn: currentValue - totalInvested,
        annualData
      });
    }
  };

  useEffect(() => {
    calculateInvestment();
  }, [initialAmount, monthlyContribution, annualReturn, years, calculationType]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return (value * 100).toFixed(1) + '%';
  };

  return (
    <ToolLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-2">
            <TrendingUp className="h-8 w-8" />
            投资收益计算器
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            计算长期投资的复利收益和增长轨迹
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 输入参数 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              投资参数
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  计算类型
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setCalculationType('compound')}
                    className={`p-3 rounded-lg border text-sm font-medium ${
                      calculationType === 'compound'
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                    }`}
                  >
                    复利投资
                  </button>
                  <button
                    onClick={() => setCalculationType('regular')}
                    className={`p-3 rounded-lg border text-sm font-medium ${
                      calculationType === 'regular'
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                    }`}
                  >
                    定期投资
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <DollarSign className="inline h-4 w-4 mr-1" />
                  初始投资金额 (元)
                </label>
                <input
                  type="number"
                  value={initialAmount}
                  onChange={(e) => setInitialAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  min="0"
                  step="1000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  每月投资金额 (元)
                </label>
                <input
                  type="number"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  min="0"
                  step="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <TrendingUp className="inline h-4 w-4 mr-1" />
                  预期年收益率 (%)
                </label>
                <input
                  type="number"
                  value={annualReturn}
                  onChange={(e) => setAnnualReturn(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  min="0"
                  max="30"
                  step="0.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  投资年限 (年)
                </label>
                <select
                  value={years}
                  onChange={(e) => setYears(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value={5}>5年</option>
                  <option value={10}>10年</option>
                  <option value={15}>15年</option>
                  <option value={20}>20年</option>
                  <option value={25}>25年</option>
                  <option value={30}>30年</option>
                </select>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <p><strong>年度投资:</strong> {formatCurrency(monthlyContribution * 12)}</p>
                  <p><strong>总投资期:</strong> {years}年</p>
                  <p><strong>总投入:</strong> {formatCurrency(initialAmount + monthlyContribution * 12 * years)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 计算结果 */}
          {result && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                投资收益预测
              </h2>
              
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                    最终资产价值
                  </h3>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {formatCurrency(result.finalAmount)}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      总投资金额
                    </h4>
                    <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                      {formatCurrency(result.totalInvested)}
                    </p>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      投资收益
                    </h4>
                    <p className="text-lg font-semibold text-yellow-900 dark:text-yellow-100">
                      {formatCurrency(result.totalReturn)}
                    </p>
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-purple-800 dark:text-purple-200 mb-2">
                    投资分析
                  </h4>
                  <div className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                    <p>收益率: {formatPercentage(result.totalReturn / result.totalInvested)}</p>
                    <p>资产增长倍数: {(result.finalAmount / result.totalInvested).toFixed(1)}倍</p>
                    <p>复利效应收益: {formatCurrency(result.totalReturn - (result.totalInvested * annualReturn / 100 * years))}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 年度增长图表 */}
        {result && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              投资增长轨迹
            </h2>
            
            <div className="space-y-4">
              {/* 简化的图表显示 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {result.annualData.filter((_, index) => index % Math.ceil(years / 6) === 0 || index === years - 1).map((data) => (
                  <div key={data.year} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      第 {data.year} 年
                    </h4>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-900 dark:text-white">
                        <span className="font-medium">投资总额:</span> {formatCurrency(data.invested)}
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        <span className="font-medium">资产价值:</span> {formatCurrency(data.value)}
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        <span className="font-medium">累计收益:</span> {formatCurrency(data.return)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 年度明细表 */}
        {result && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              年度投资明细
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">年份</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300">累计投资</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300">资产价值</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300">累计收益</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300">收益率</th>
                  </tr>
                </thead>
                <tbody>
                  {result.annualData.slice(0, 10).map((data) => (
                    <tr key={data.year} className="border-b border-gray-100 dark:border-gray-600">
                      <td className="py-3 px-4 text-gray-900 dark:text-white">{data.year}</td>
                      <td className="py-3 px-4 text-right text-gray-900 dark:text-white">
                        {formatCurrency(data.invested)}
                      </td>
                      <td className="py-3 px-4 text-right text-green-600 dark:text-green-400">
                        {formatCurrency(data.value)}
                      </td>
                      <td className="py-3 px-4 text-right text-blue-600 dark:text-blue-400">
                        {formatCurrency(data.return)}
                      </td>
                      <td className="py-3 px-4 text-right text-purple-600 dark:text-purple-400">
                        {formatPercentage(data.return / data.invested)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">
            使用说明
          </h3>
          <ul className="space-y-2 text-blue-700 dark:text-blue-300">
            <li>• 选择复利投资或定期投资模式</li>
            <li>• 输入初始投资金额和每月投资金额</li>
            <li>• 设置预期年收益率（建议8-12%为合理范围）</li>
            <li>• 选择投资年限查看长期收益预测</li>
            <li>• 数据仅供参考，实际投资存在风险</li>
            <li>• 建议分散投资降低风险</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}