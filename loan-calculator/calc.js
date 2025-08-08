(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.LoanCalc = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function toMonthlyRate(annualRatePercent) {
    if (annualRatePercent < 0) throw new Error('annualRatePercent must be >= 0');
    return annualRatePercent / 100 / 12;
  }

  function round2(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  function calculateEMI(principal, annualRatePercent, months) {
    if (months <= 0) throw new Error('months must be > 0');
    if (principal < 0) throw new Error('principal must be >= 0');
    const r = toMonthlyRate(annualRatePercent);
    if (r === 0) return round2(principal / months);
    const pow = Math.pow(1 + r, months);
    const payment = principal * r * pow / (pow - 1);
    return round2(payment);
  }

  function generateEMISchedule(principal, annualRatePercent, months) {
    const r = toMonthlyRate(annualRatePercent);
    const payment = r === 0 ? principal / months : principal * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1);

    const schedule = [];
    let remaining = principal;
    for (let i = 1; i <= months; i++) {
      const interestRaw = remaining * r;
      let principalPayRaw = payment - interestRaw;
      let paymentOut = payment;

      // For the last installment, adjust to clear remaining due to rounding
      if (i === months) {
        principalPayRaw = remaining;
        paymentOut = principalPayRaw + interestRaw;
      }

      const interest = round2(interestRaw);
      const principalPay = round2(principalPayRaw);
      remaining = remaining - principalPay;
      if (i === months) remaining = 0; // force exact end

      schedule.push({
        period: i,
        payment: round2(paymentOut),
        principal: principalPay,
        interest: interest,
        remaining: round2(Math.max(remaining, 0))
      });
    }
    return schedule;
  }

  function generateEqualPrincipalSchedule(principal, annualRatePercent, months) {
    const r = toMonthlyRate(annualRatePercent);
    const monthlyPrincipalRaw = principal / months;

    const schedule = [];
    let remaining = principal;

    for (let i = 1; i <= months; i++) {
      const interestRaw = remaining * r;
      let principalPayRaw = monthlyPrincipalRaw;
      if (i === months) {
        principalPayRaw = remaining;
      }
      const paymentRaw = principalPayRaw + interestRaw;

      const interest = round2(interestRaw);
      const principalPay = round2(principalPayRaw);
      remaining = remaining - principalPay;
      if (i === months) remaining = 0;

      schedule.push({
        period: i,
        payment: round2(paymentRaw),
        principal: principalPay,
        interest: interest,
        remaining: round2(Math.max(remaining, 0))
      });
    }
    return schedule;
  }

  function summarizeSchedule(schedule) {
    const totals = schedule.reduce((acc, row) => {
      acc.payment += row.payment;
      acc.principal += row.principal;
      acc.interest += row.interest;
      return acc;
    }, { payment: 0, principal: 0, interest: 0 });

    return {
      totalPayment: round2(totals.payment),
      totalPrincipal: round2(totals.principal),
      totalInterest: round2(totals.interest),
      periods: schedule.length,
      monthlyAverage: schedule.length ? round2(totals.payment / schedule.length) : 0
    };
  }

  function mergeSchedules(a, b) {
    const maxLen = Math.max(a.length, b.length);
    const merged = [];
    for (let i = 0; i < maxLen; i++) {
      const ra = a[i] || { payment: 0, principal: 0, interest: 0, remaining: 0 };
      const rb = b[i] || { payment: 0, principal: 0, interest: 0, remaining: 0 };
      merged.push({
        period: i + 1,
        payment: round2(ra.payment + rb.payment),
        principal: round2(ra.principal + rb.principal),
        interest: round2(ra.interest + rb.interest),
        remaining: round2(Math.max((ra.remaining || 0) + (rb.remaining || 0), 0))
      });
    }
    return merged;
  }

  return {
    calculateEMI,
    generateEMISchedule,
    generateEqualPrincipalSchedule,
    summarizeSchedule,
    mergeSchedules
  };
});