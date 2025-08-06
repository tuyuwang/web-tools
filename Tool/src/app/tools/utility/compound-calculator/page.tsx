'use client';

import { useState } from 'react';
import { Calculator, TrendingUp, PieChart, BarChart3, RefreshCw, Copy, Download } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';

interface CalculationResult {
  futureValue: number;
  totalContribution: number;
  totalInterest: number;
  yearlyBreakdown: {
    year: number;
    contribution: number;
    interest: number;
    balance: number;
  }[];
}

export default function CompoundCalculatorPage() {
  const [calculationType, setCalculationType] = useState<'investment' | 'loan'>('investment');
  const [principal, setPrincipal] = useState<string>('10000');
  const [monthlyContribution, setMonthlyContribution] = useState<string>('500');
  const [annualRate, setAnnualRate] = useState<string>('7');
  const [years, setYears] = useState<string>('20');
  const [compoundFrequency, setCompoundFrequency] = useState<string>('12');
  
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const calculateCompoundInterest = () => {
    const P = parseFloat(principal) || 0;
    const PMT = parseFloat(monthlyContribution) || 0;
    const r = (parseFloat(annualRate) || 0) / 100;
    const n = parseFloat(compoundFrequency) || 1;
    const t = parseFloat(years) || 0;

    if (P < 0 || r < 0 || t <= 0) return;

    let yearlyBreakdown: CalculationResult['yearlyBreakdown'] = [];
    let currentBalance = P;
    let totalContribution = P;

    for (let year = 1; year <= t; year++) {
      let yearStartBalance = currentBalance;
      let yearContribution = 0;
      let yearInterest = 0;

      // 计算每月复利
      for (let month = 1; month <= 12; month++) {
        // 每月利息
        const monthlyInterest = currentBalance * (r / 12);
        yearInterest += monthlyInterest;
        currentBalance += monthlyInterest;

        // 每月投入
        if (PMT > 0) {
          currentBalance += PMT;
          yearContribution += PMT;
          totalContribution += PMT;
        }
      }

      yearlyBreakdown.push({
        year,
        contribution: yearContribution,
        interest: yearInterest,
        balance: currentBalance,
      });
    }

    const futureValue = currentBalance;
    const totalInterest = futureValue - totalContribution;

    setResult({
      futureValue,
      totalContribution,
      totalInterest,
      yearlyBreakdown,
    });
  };

  const calculateLoanPayment = () => {
    const P = parseFloat(principal) || 0;
    const r = (parseFloat(annualRate) || 0) / 100 / 12; // 月利率
    const n = (parseFloat(years) || 0) * 12; // 总月数

    if (P <= 0 || r <= 0 || n <= 0) return;

    // 月供计算公式: PMT = P * [r(1+r)^n] / [(1+r)^n - 1]
    const monthlyPayment = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = monthlyPayment * n;
    const totalInterest = totalPayment - P;

    let yearlyBreakdown: CalculationResult['yearlyBreakdown'] = [];
    let remainingBalance = P;

    for (let year = 1; year <= parseFloat(years); year++) {
      let yearlyInterest = 0;
      let yearlyPrincipal = 0;

      for (let month = 1; month <= 12 && remainingBalance > 0; month++) {
        const interestPayment = remainingBalance * r;
        const principalPayment = monthlyPayment - interestPayment;
        
        yearlyInterest += interestPayment;
        yearlyPrincipal += principalPayment;
        remainingBalance -= principalPayment;
      }

      yearlyBreakdown.push({
        year,
        contribution: yearlyPrincipal,
        interest: yearlyInterest,
        balance: Math.max(0, remainingBalance),
      });
    }

    setResult({
      futureValue: totalPayment,
      totalContribution: P,
      totalInterest,
      yearlyBreakdown,
    });
  };

  const handleCalculate = () => {
    if (calculationType === 'investment') {
      calculateCompoundInterest();
    } else {
      calculateLoanPayment();
    }
  };

  const copyResults = async () => {
    if (!result) return;

    const text = calculationType === 'investment' 
      ? `投资计算结果：
初始投资：¥${parseFloat(principal).toLocaleString()}
月度投入：¥${parseFloat(monthlyContribution).toLocaleString()}
年化收益率：${annualRate}%
投资期限：${years}年

最终价值：¥${result.futureValue.toLocaleString()}
总投入：¥${result.totalContribution.toLocaleString()}
总收益：¥${result.totalInterest.toLocaleString()}
收益率：${((result.totalInterest / result.totalContribution) * 100).toFixed(2)}%`
      : `贷款计算结果：
贷款金额：¥${parseFloat(principal).toLocaleString()}
年利率：${annualRate}%
贷款期限：${years}年

总还款额：¥${result.futureValue.toLocaleString()}
贷款本金：¥${result.totalContribution.toLocaleString()}
总利息：¥${result.totalInterest.toLocaleString()}
月供金额：¥${(result.futureValue / (parseFloat(years) * 12)).toLocaleString()}`;

    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const exportCSV = () => {
    if (!result) return;

    const headers = calculationType === 'investment' 
      ? ['年份', '年度投入', '年度收益', '余额']
      : ['年份', '年度还本', '年度利息', '剩余本金'];

    const csvContent = [
      headers.join(','),
      ...result.yearlyBreakdown.map(row => 
        [row.year, row.contribution.toFixed(2), row.interest.toFixed(2), row.balance.toFixed(2)].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${calculationType === 'investment' ? '投资计算' : '贷款计算'}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <ToolLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            复合利息计算器
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            计算投资收益或贷款利息，帮助您做出明智的财务决策
          </p>
        </div>

        {/* 计算类型选择 */}
        <div className="flex justify-center">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setCalculationType('investment')}
              className={`px-6 py-2 rounded-md transition-colors ${
                calculationType === 'investment'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-2" />
              投资计算
            </button>
            <button
              onClick={() => setCalculationType('loan')}
              className={`px-6 py-2 rounded-md transition-colors ${
                calculationType === 'loan'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Calculator className="w-4 h-4 inline mr-2" />
              贷款计算
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 输入参数 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              {calculationType === 'investment' ? '投资参数' : '贷款参数'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {calculationType === 'investment' ? '初始投资金额 (¥)' : '贷款金额 (¥)'}
                </label>
                <input
                  type="number"
                  value={principal}
                  onChange={(e) => setPrincipal(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="10000"
                />
              </div>

              {calculationType === 'investment' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    月度投入金额 (¥)
                  </label>
                  <input
                    type="number"
                    value={monthlyContribution}
                    onChange={(e) => setMonthlyContribution(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {calculationType === 'investment' ? '年化收益率 (%)' : '年利率 (%)'}
                </label>
                <input
                  type="number"
                  value={annualRate}
                  onChange={(e) => setAnnualRate(e.target.value)}
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="7"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {calculationType === 'investment' ? '投资期限 (年)' : '贷款期限 (年)'}
                </label>
                <input
                  type="number"
                  value={years}
                  onChange={(e) => setYears(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="20"
                />
              </div>

              {calculationType === 'investment' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    复利频率 (次/年)
                  </label>
                  <select
                    value={compoundFrequency}
                    onChange={(e) => setCompoundFrequency(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="1">年复利</option>
                    <option value="4">季度复利</option>
                    <option value="12">月复利</option>
                    <option value="365">日复利</option>
                  </select>
                </div>
              )}

              <button
                onClick={handleCalculate}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
              >
                <Calculator className="w-5 h-5" />
                <span>开始计算</span>
              </button>
            </div>
          </div>

          {/* 计算结果 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                计算结果
              </h3>
              {result && (
                <div className="flex space-x-2">
                  <button
                    onClick={copyResults}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors"
                    title="复制结果"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={exportCSV}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-500 transition-colors"
                    title="导出CSV"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {result ? (
              <div className="space-y-6">
                {/* 主要结果 */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(result.futureValue)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {calculationType === 'investment' ? '最终价值' : '总还款额'}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(result.totalContribution)}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {calculationType === 'investment' ? '总投入' : '贷款本金'}
                      </div>
                    </div>

                    <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                        {formatCurrency(result.totalInterest)}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {calculationType === 'investment' ? '总收益' : '总利息'}
                      </div>
                    </div>
                  </div>

                  {calculationType === 'investment' && (
                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        {((result.totalInterest / result.totalContribution) * 100).toFixed(2)}%
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">总收益率</div>
                    </div>
                  )}

                  {calculationType === 'loan' && (
                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        {formatCurrency(result.futureValue / (parseFloat(years) * 12))}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">月供金额</div>
                    </div>
                  )}
                </div>

                {/* 详细分解 */}
                <div>
                  <button
                    onClick={() => setShowBreakdown(!showBreakdown)}
                    className="w-full flex items-center justify-center space-x-2 py-2 text-blue-500 hover:text-blue-600 transition-colors"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>{showBreakdown ? '隐藏' : '显示'}年度明细</span>
                  </button>

                  {showBreakdown && (
                    <div className="mt-4 max-h-64 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left py-2 text-gray-600 dark:text-gray-400">年份</th>
                            <th className="text-right py-2 text-gray-600 dark:text-gray-400">
                              {calculationType === 'investment' ? '投入' : '还本'}
                            </th>
                            <th className="text-right py-2 text-gray-600 dark:text-gray-400">
                              {calculationType === 'investment' ? '收益' : '利息'}
                            </th>
                            <th className="text-right py-2 text-gray-600 dark:text-gray-400">
                              {calculationType === 'investment' ? '余额' : '剩余'}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.yearlyBreakdown.map((row) => (
                            <tr key={row.year} className="border-b border-gray-100 dark:border-gray-800">
                              <td className="py-2 text-gray-900 dark:text-white">{row.year}</td>
                              <td className="py-2 text-right text-gray-900 dark:text-white">
                                ¥{row.contribution.toLocaleString()}
                              </td>
                              <td className="py-2 text-right text-gray-900 dark:text-white">
                                ¥{row.interest.toLocaleString()}
                              </td>
                              <td className="py-2 text-right font-medium text-gray-900 dark:text-white">
                                ¥{row.balance.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>输入参数后点击计算查看结果</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}