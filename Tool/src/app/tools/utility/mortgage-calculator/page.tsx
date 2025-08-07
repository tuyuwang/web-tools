'use client';

import { useState, useEffect } from 'react';
import { Calculator, DollarSign, Percent, Calendar } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';

interface MortgageResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  schedule: Array<{
    month: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }>;
}

export default function MortgageCalculatorPage() {
  const [loanAmount, setLoanAmount] = useState<number>(300000);
  const [interestRate, setInterestRate] = useState<number>(5.5);
  const [loanTerm, setLoanTerm] = useState<number>(30);
  const [downPayment, setDownPayment] = useState<number>(60000);
  const [result, setResult] = useState<MortgageResult | null>(null);

  const calculateMortgage = () => {
    const principal = loanAmount - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;

    if (monthlyRate === 0) {
      const monthlyPayment = principal / numberOfPayments;
      const totalPayment = monthlyPayment * numberOfPayments;
      const schedule = [];
      
      for (let i = 1; i <= numberOfPayments; i++) {
        schedule.push({
          month: i,
          payment: monthlyPayment,
          principal: monthlyPayment,
          interest: 0,
          balance: principal - (monthlyPayment * i)
        });
      }

      setResult({
        monthlyPayment,
        totalPayment,
        totalInterest: 0,
        schedule
      });
      return;
    }

    const monthlyPayment = principal * 
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    const totalPayment = monthlyPayment * numberOfPayments;
    const totalInterest = totalPayment - principal;

    // 生成还款计划表
    const schedule = [];
    let remainingBalance = principal;

    for (let i = 1; i <= numberOfPayments; i++) {
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      remainingBalance -= principalPayment;

      schedule.push({
        month: i,
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, remainingBalance)
      });
    }

    setResult({
      monthlyPayment,
      totalPayment,
      totalInterest,
      schedule
    });
  };

  useEffect(() => {
    calculateMortgage();
  }, [loanAmount, interestRate, loanTerm, downPayment]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <ToolLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-2">
            <Calculator className="h-8 w-8" />
            抵押贷款计算器
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            计算房屋贷款的月供、总利息和还款计划
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 输入参数 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              贷款参数
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <DollarSign className="inline h-4 w-4 mr-1" />
                  房屋总价 (元)
                </label>
                <input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  min="0"
                  step="10000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <DollarSign className="inline h-4 w-4 mr-1" />
                  首付金额 (元)
                </label>
                <input
                  type="number"
                  value={downPayment}
                  onChange={(e) => setDownPayment(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  min="0"
                  step="5000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Percent className="inline h-4 w-4 mr-1" />
                  年利率 (%)
                </label>
                <input
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  min="0"
                  max="20"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  贷款年限 (年)
                </label>
                <select
                  value={loanTerm}
                  onChange={(e) => setLoanTerm(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value={10}>10年</option>
                  <option value={15}>15年</option>
                  <option value={20}>20年</option>
                  <option value={25}>25年</option>
                  <option value={30}>30年</option>
                </select>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <p><strong>贷款金额:</strong> {formatCurrency(loanAmount - downPayment)}</p>
                  <p><strong>首付比例:</strong> {((downPayment / loanAmount) * 100).toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* 计算结果 */}
          {result && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                计算结果
              </h2>
              
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                    月供金额
                  </h3>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {formatCurrency(result.monthlyPayment)}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      总还款金额
                    </h4>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(result.totalPayment)}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      总利息支出
                    </h4>
                    <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                      {formatCurrency(result.totalInterest)}
                    </p>
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                    贷款概要
                  </h4>
                  <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                    <p>贷款本金: {formatCurrency(loanAmount - downPayment)}</p>
                    <p>利息占比: {((result.totalInterest / result.totalPayment) * 100).toFixed(1)}%</p>
                    <p>月供收入比建议: ≤30%</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 还款计划表 (前12个月) */}
        {result && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              还款计划表 (前12个月)
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">月份</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300">月供</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300">本金</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300">利息</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300">余额</th>
                  </tr>
                </thead>
                <tbody>
                  {result.schedule.slice(0, 12).map((payment) => (
                    <tr key={payment.month} className="border-b border-gray-100 dark:border-gray-600">
                      <td className="py-3 px-4 text-gray-900 dark:text-white">{payment.month}</td>
                      <td className="py-3 px-4 text-right text-gray-900 dark:text-white">
                        {formatCurrency(payment.payment)}
                      </td>
                      <td className="py-3 px-4 text-right text-blue-600 dark:text-blue-400">
                        {formatCurrency(payment.principal)}
                      </td>
                      <td className="py-3 px-4 text-right text-red-600 dark:text-red-400">
                        {formatCurrency(payment.interest)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-900 dark:text-white">
                        {formatCurrency(payment.balance)}
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
            <li>• 输入房屋总价、首付金额、年利率和贷款年限</li>
            <li>• 系统会自动计算月供金额、总利息等信息</li>
            <li>• 建议月供不超过家庭收入的30%</li>
            <li>• 首付比例建议不低于20%以避免PMI保险</li>
            <li>• 可以比较不同贷款方案选择最适合的</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}