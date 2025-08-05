'use client';

import { useState, useEffect } from 'react';
import { ToolLayout } from '@/components/tool-layout';
import { Calculator, TrendingUp, DollarSign, Calendar, Percent } from 'lucide-react';

interface CompoundResult {
  finalAmount: number;
  totalContribution: number;
  totalInterest: number;
  yearlyData: Array<{
    year: number;
    balance: number;
    contribution: number;
    interest: number;
  }>;
}

export default function CompoundInterestPage() {
  const [principal, setPrincipal] = useState<string>('10000');
  const [monthlyContribution, setMonthlyContribution] = useState<string>('500');
  const [annualRate, setAnnualRate] = useState<string>('7');
  const [years, setYears] = useState<string>('10');
  const [compoundFrequency, setCompoundFrequency] = useState<string>('12');
  const [result, setResult] = useState<CompoundResult | null>(null);

  const calculateCompoundInterest = () => {
    const p = parseFloat(principal) || 0;
    const pmt = parseFloat(monthlyContribution) || 0;
    const r = parseFloat(annualRate) / 100 || 0;
    const t = parseFloat(years) || 0;
    const n = parseFloat(compoundFrequency) || 12;

    if (p < 0 || pmt < 0 || r < 0 || t <= 0) return;

    const yearlyData = [];
    let currentBalance = p;
    let totalContribution = p;

    for (let year = 1; year <= t; year++) {
      let yearStartBalance = currentBalance;
      let yearContribution = 0;
      
      for (let period = 0; period < n; period++) {
        // 添加月度投资（假设每月投资）
        if (n >= 12 && period % (n / 12) === 0) {
          currentBalance += pmt;
          yearContribution += pmt;
          totalContribution += pmt;
        } else if (n < 12) {
          currentBalance += pmt * (12 / n);
          yearContribution += pmt * (12 / n);
          totalContribution += pmt * (12 / n);
        }
        
        // 计算复利
        currentBalance *= (1 + r / n);
      }
      
      const yearInterest = currentBalance - yearStartBalance - yearContribution;
      
      yearlyData.push({
        year,
        balance: Math.round(currentBalance * 100) / 100,
        contribution: Math.round(yearContribution * 100) / 100,
        interest: Math.round(yearInterest * 100) / 100,
      });
    }

    const finalAmount = Math.round(currentBalance * 100) / 100;
    const totalInterest = Math.round((finalAmount - totalContribution) * 100) / 100;

    setResult({
      finalAmount,
      totalContribution: Math.round(totalContribution * 100) / 100,
      totalInterest,
      yearlyData,
    });
  };

  useEffect(() => {
    calculateCompoundInterest();
  }, [principal, monthlyContribution, annualRate, years, compoundFrequency]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getFrequencyText = (freq: string) => {
    const frequencies: { [key: string]: string } = {
      '1': '年复利',
      '2': '半年复利',
      '4': '季度复利',
      '12': '月复利',
      '365': '日复利',
    };
    return frequencies[freq] || '月复利';
  };

  return (
    <ToolLayout>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
              <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            复利计算器
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            计算复利收益，制定长期投资计划
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 输入参数 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Calculator className="h-5 w-5 mr-2" />
              计算参数
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  初始投资金额 (¥)
                </label>
                <input
                  type="number"
                  value={principal}
                  onChange={(e) => setPrincipal(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="10000"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  每月定投金额 (¥)
                </label>
                <input
                  type="number"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  年化收益率 (%)
                </label>
                <input
                  type="number"
                  value={annualRate}
                  onChange={(e) => setAnnualRate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="7"
                  min="0"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  投资年限
                </label>
                <input
                  type="number"
                  value={years}
                  onChange={(e) => setYears(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="10"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  复利频率
                </label>
                <select
                  value={compoundFrequency}
                  onChange={(e) => setCompoundFrequency(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="1">年复利</option>
                  <option value="2">半年复利</option>
                  <option value="4">季度复利</option>
                  <option value="12">月复利</option>
                  <option value="365">日复利</option>
                </select>
              </div>
            </div>
          </div>

          {/* 计算结果 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              计算结果
            </h2>
            
            {result && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <div className="text-sm text-green-600 dark:text-green-400 mb-1">最终金额</div>
                    <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {formatCurrency(result.finalAmount)}
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">总投入</div>
                    <div className="text-xl font-semibold text-blue-700 dark:text-blue-300">
                      {formatCurrency(result.totalContribution)}
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                    <div className="text-sm text-purple-600 dark:text-purple-400 mb-1">复利收益</div>
                    <div className="text-xl font-semibold text-purple-700 dark:text-purple-300">
                      {formatCurrency(result.totalInterest)}
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">收益构成</div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-300"
                      style={{
                        width: `${(result.totalInterest / result.finalAmount) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>投入: {((result.totalContribution / result.finalAmount) * 100).toFixed(1)}%</span>
                    <span>收益: {((result.totalInterest / result.finalAmount) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 年度详情表格 */}
        {result && result.yearlyData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              年度收益详情
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 text-gray-600 dark:text-gray-400">年份</th>
                    <th className="text-right py-2 text-gray-600 dark:text-gray-400">账户余额</th>
                    <th className="text-right py-2 text-gray-600 dark:text-gray-400">年度投入</th>
                    <th className="text-right py-2 text-gray-600 dark:text-gray-400">年度收益</th>
                  </tr>
                </thead>
                <tbody>
                  {result.yearlyData.map((data) => (
                    <tr key={data.year} className="border-b border-gray-100 dark:border-gray-700">
                      <td className="py-2 text-gray-900 dark:text-white">第 {data.year} 年</td>
                      <td className="py-2 text-right font-medium text-gray-900 dark:text-white">
                        {formatCurrency(data.balance)}
                      </td>
                      <td className="py-2 text-right text-blue-600 dark:text-blue-400">
                        {formatCurrency(data.contribution)}
                      </td>
                      <td className="py-2 text-right text-green-600 dark:text-green-400">
                        {formatCurrency(data.interest)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-2 flex items-center">
            <Percent className="h-5 w-5 mr-2" />
            使用说明
          </h3>
          <ul className="text-amber-800 dark:text-amber-200 space-y-1 text-sm">
            <li>• <strong>初始投资：</strong>一次性投入的本金金额</li>
            <li>• <strong>定期投资：</strong>每月额外投入的金额，用于定投策略</li>
            <li>• <strong>年化收益率：</strong>预期的年化投资回报率</li>
            <li>• <strong>复利频率：</strong>收益再投资的频率，频率越高收益越多</li>
            <li>• <strong>投资建议：</strong>长期定投、分散投资、理性预期收益率</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}