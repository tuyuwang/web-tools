"use client";

import { useMemo, useState } from "react";

type CalculatorInputs = {
  initialInvestment: number;
  monthlyContribution: number;
  years: number;
  annualReturnRatePercent: number;
  annualInflationRatePercent: number;
  annualFeePercent: number;
};

type YearlyRow = {
  year: number;
  endBalance: number;
  totalContributionToDate: number;
  totalGainToDate: number;
  realEndBalance: number;
  yearReturnEarned: number;
};

function formatCurrency(value: number): string {
  if (!isFinite(value)) return "-";
  return value.toLocaleString("zh-CN", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 0,
  });
}

function formatPercent(value: number): string {
  if (!isFinite(value)) return "-";
  return `${(value * 100).toFixed(2)}%`;
}

function computeProjection(inputs: CalculatorInputs) {
  const months = Math.max(0, Math.round(inputs.years * 12));

  // Net annual after fee (approx): (1+g)*(1-f)-1
  const grossAnnual = inputs.annualReturnRatePercent / 100;
  const feeAnnual = Math.max(0, inputs.annualFeePercent / 100);
  const netAnnual = (1 + grossAnnual) * (1 - feeAnnual) - 1;
  const monthlyRate = Math.pow(1 + netAnnual, 1 / 12) - 1;

  const inflationAnnual = Math.max(0, inputs.annualInflationRatePercent / 100);

  let balance = Math.max(0, inputs.initialInvestment);
  let totalContribution = balance;
  let totalGain = 0;

  const yearlyRows: YearlyRow[] = [];

  for (let m = 1; m <= months; m++) {
    const interestEarned = balance * monthlyRate;
    balance += interestEarned;
    totalGain += interestEarned;

    balance += inputs.monthlyContribution;
    totalContribution += inputs.monthlyContribution;

    if (m % 12 === 0) {
      const year = m / 12;
      const realEndBalance = balance / Math.pow(1 + inflationAnnual, year);

      // Approximate yearly earnings: recompute month range or track difference
      // Here we approximate as current totalGain minus prior row totalGain
      const priorGain = yearlyRows.length > 0 ? yearlyRows[yearlyRows.length - 1].totalGainToDate : 0;
      const yearReturnEarned = totalGain - priorGain;

      yearlyRows.push({
        year,
        endBalance: balance,
        totalContributionToDate: totalContribution,
        totalGainToDate: totalGain,
        realEndBalance,
        yearReturnEarned,
      });
    }
  }

  const finalNominal = balance;
  const finalReal = balance / Math.pow(1 + inflationAnnual, inputs.years);
  const totalContributions = totalContribution;
  const gain = finalNominal - totalContributions;
  const roi = totalContributions > 0 ? gain / totalContributions : 0;

  // Approx annualized return using average capital approximation (均匀投入近似)
  const avgCapitalBase = inputs.initialInvestment + inputs.monthlyContribution * months * 0.5;
  const annualizedApprox = avgCapitalBase > 0 ? Math.pow(finalNominal / avgCapitalBase, 1 / Math.max(1, inputs.years)) - 1 : 0;

  // Payback (when gains >= 0)
  let runningBalance = Math.max(0, inputs.initialInvestment);
  let runningContrib = runningBalance;
  let paybackMonth: number | null = null;
  for (let m = 1; m <= months; m++) {
    runningBalance = runningBalance * (1 + monthlyRate) + inputs.monthlyContribution;
    runningContrib += inputs.monthlyContribution;
    if (paybackMonth === null && runningBalance - runningContrib >= 0) {
      paybackMonth = m;
      break;
    }
  }

  return {
    finalNominal,
    finalReal,
    totalContributions,
    gain,
    roi,
    annualizedApprox,
    paybackMonth,
    monthlyRate,
    netAnnual,
    yearlyRows,
  };
}

export default function RoiCalculatorPage() {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    initialInvestment: 10000,
    monthlyContribution: 2000,
    years: 10,
    annualReturnRatePercent: 8,
    annualInflationRatePercent: 2,
    annualFeePercent: 0.5,
  });

  const [showTable, setShowTable] = useState(true);

  const result = useMemo(() => computeProjection(inputs), [inputs]);

  const onNumberChange = (key: keyof CalculatorInputs) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value || "0");
    setInputs((prev) => ({ ...prev, [key]: isNaN(value) ? 0 : value }));
  };

  const paybackText = useMemo(() => {
    if (result.paybackMonth == null) return "未在投资期内达到收益覆盖本金";
    const y = Math.floor(result.paybackMonth / 12);
    const m = result.paybackMonth % 12;
    const parts = [] as string[];
    if (y > 0) parts.push(`${y}年`);
    if (m > 0) parts.push(`${m}个月`);
    return parts.length > 0 ? parts.join("") : "当月";
  }, [result.paybackMonth]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">投资回报计算器</h1>
          <p className="text-gray-600">参考常见理财网站的计算逻辑，支持初始投入、每月定投、年化收益率、通胀与管理费等参数</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 items-start">
          {/* 左侧：输入表单 */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">输入参数</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">初始投入 (¥)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  value={inputs.initialInvestment}
                  onChange={onNumberChange("initialInvestment")}
                  min={0}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">每月定投 (¥)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  value={inputs.monthlyContribution}
                  onChange={onNumberChange("monthlyContribution")}
                  min={0}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">投资年限 (年)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  value={inputs.years}
                  onChange={onNumberChange("years")}
                  min={0}
                  step={0.5}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">预期年化收益率 (%)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  value={inputs.annualReturnRatePercent}
                  onChange={onNumberChange("annualReturnRatePercent")}
                  step={0.1}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">通胀率 (%)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    value={inputs.annualInflationRatePercent}
                    onChange={onNumberChange("annualInflationRatePercent")}
                    step={0.1}
                    min={0}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">管理费率 (%)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    value={inputs.annualFeePercent}
                    onChange={onNumberChange("annualFeePercent")}
                    step={0.1}
                    min={0}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                  onClick={() => setShowTable((s) => !s)}
                >
                  {showTable ? "隐藏年度明细" : "显示年度明细"}
                </button>

                <button
                  className="text-sm text-gray-500 hover:text-gray-700"
                  onClick={() => {
                    setInputs({
                      initialInvestment: 10000,
                      monthlyContribution: 2000,
                      years: 10,
                      annualReturnRatePercent: 8,
                      annualInflationRatePercent: 2,
                      annualFeePercent: 0.5,
                    });
                  }}
                >
                  重置示例
                </button>
              </div>
            </div>
          </div>

          {/* 右侧：结果展示 */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">最终资产（名义）</h3>
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(result.finalNominal)}</div>
                <p className="text-xs text-gray-500 mt-2">按月复利，年化净回报率约 {formatPercent(result.netAnnual)}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">最终资产（扣除通胀）</h3>
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(result.finalReal)}</div>
                <p className="text-xs text-gray-500 mt-2">以当前币值折算</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">总投入</h3>
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(result.totalContributions)}</div>
                <p className="text-xs text-gray-500 mt-2">包含初始投入与每月定投</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">总收益 / ROI</h3>
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(result.gain)}</div>
                <p className="text-xs text-gray-500 mt-2">ROI：{formatPercent(result.roi)}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">近似年化收益率</h3>
                <div className="text-2xl font-bold text-gray-900">{formatPercent(result.annualizedApprox)}</div>
                <p className="text-xs text-gray-500 mt-2">基于均匀投入假设的近似估计，非严格IRR</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">回本时间（收益覆盖本金）</h3>
                <div className="text-2xl font-bold text-gray-900">{paybackText}</div>
                <p className="text-xs text-gray-500 mt-2">从开始投资起计算</p>
              </div>
            </div>

            {showTable && (
              <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">年度明细</h3>
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-gray-600">
                      <th className="text-left p-2">年份</th>
                      <th className="text-right p-2">期末资产</th>
                      <th className="text-right p-2">累计投入</th>
                      <th className="text-right p-2">累计收益</th>
                      <th className="text-right p-2">年度收益</th>
                      <th className="text-right p-2">期末资产（实际）</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.yearlyRows.length === 0 ? (
                      <tr>
                        <td className="p-2 text-gray-500" colSpan={6}>无数据</td>
                      </tr>
                    ) : (
                      result.yearlyRows.map((row) => (
                        <tr key={row.year} className="border-t">
                          <td className="p-2">第 {row.year} 年</td>
                          <td className="p-2 text-right">{formatCurrency(row.endBalance)}</td>
                          <td className="p-2 text-right">{formatCurrency(row.totalContributionToDate)}</td>
                          <td className="p-2 text-right">{formatCurrency(row.totalGainToDate)}</td>
                          <td className="p-2 text-right">{formatCurrency(row.yearReturnEarned)}</td>
                          <td className="p-2 text-right">{formatCurrency(row.realEndBalance)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <div className="text-xs text-gray-500 leading-5">
              <p>说明：</p>
              <ul className="list-disc pl-5 space-y-1 mt-1">
                <li>采用按月复利模型：每月先按净月收益率增长，再进行当月定投。</li>
                <li>净年化收益率 = (1+预期年化收益率) × (1-管理费率) - 1；净月收益率为其12次方根。</li>
                <li>“最终资产（实际）”为剔除通胀后的购买力等值：名义资产 / (1+通胀率)^年限。</li>
                <li>“近似年化收益率”基于均匀投入的平均资金占用估计，非严格IRR，仅作参考。</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}