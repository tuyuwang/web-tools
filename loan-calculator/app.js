(function () {
  'use strict';

  function $(id) { return document.getElementById(id); }
  function fmt(n) { return (Number(n)).toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 }); }

  function toggleGroups() {
    const loanType = $('loanType').value;
    const single = $('singleLoanGroup');
    const combined = $('combinedLoanGroup');
    if (loanType === 'combined') {
      single.classList.add('hidden');
      combined.classList.remove('hidden');
    } else {
      single.classList.remove('hidden');
      combined.classList.add('hidden');
    }
  }

  function readInputs() {
    const loanType = $('loanType').value;
    const repayMethod = $('repayMethod').value;
    const years = Number($('years').value);
    const months = Math.round(years * 12);

    if (loanType === 'combined') {
      const pC = Number($('principalCommercial').value);
      const rC = Number($('annualRateCommercial').value);
      const pF = Number($('principalFund').value);
      const rF = Number($('annualRateFund').value);
      if (!(pC > 0 || pF > 0)) throw new Error('请输入组合贷款的金额');
      if (!(rC >= 0 && rF >= 0)) throw new Error('请输入有效的年利率');
      return { type: 'combined', repayMethod, months, parts: [
        { principal: pC || 0, rate: rC || 0 },
        { principal: pF || 0, rate: rF || 0 }
      ] };
    } else {
      const p = Number($('principal').value);
      const r = Number($('annualRate').value);
      if (!(p > 0)) throw new Error('请输入贷款金额');
      if (!(r >= 0)) throw new Error('请输入有效的年利率');
      return { type: 'single', repayMethod, months, principal: p, rate: r };
    }
  }

  function renderSummary(container, schedule, principalTotal, repayMethod) {
    const summary = LoanCalc.summarizeSchedule(schedule);
    const monthlyText = repayMethod === 'emi' ? '月供（固定）' : '首月月供';

    const first = schedule[0] || { payment: 0 };
    const second = schedule[1] || null;
    const decrease = (second ? first.payment - second.payment : 0);

    container.innerHTML = '' +
      `<div class="item"><span class="label">贷款总额</span><span class="value">￥${fmt(principalTotal)}</span></div>` +
      `<div class="item"><span class="label">${monthlyText}</span><span class="value">￥${fmt(first.payment)}</span></div>` +
      `<div class="item"><span class="label">支付利息总额</span><span class="value">￥${fmt(summary.totalInterest)}</span></div>` +
      `<div class="item"><span class="label">还款总额</span><span class="value">￥${fmt(summary.totalPayment)}</span></div>` +
      (repayMethod === 'equal_principal' ? `<div class="item"><span class="label">每月递减</span><span class="value">￥${fmt(decrease)}</span></div>` : '') +
      `<div class="item"><span class="label">期数</span><span class="value">${summary.periods} 期</span></div>`;
  }

  function renderTable(tbody, schedule) {
    tbody.innerHTML = '';
    const frag = document.createDocumentFragment();
    for (const row of schedule) {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${row.period}</td>` +
        `<td>${fmt(row.payment)}</td>` +
        `<td>${fmt(row.principal)}</td>` +
        `<td>${fmt(row.interest)}</td>` +
        `<td>${fmt(row.remaining)}</td>`;
      frag.appendChild(tr);
    }
    tbody.appendChild(frag);
  }

  function handleCalc() {
    try {
      const input = readInputs();
      const repayMethod = input.repayMethod;

      let schedule = [];
      let principalTotal = 0;

      if (input.type === 'single') {
        principalTotal = input.principal;
        schedule = repayMethod === 'emi'
          ? LoanCalc.generateEMISchedule(input.principal, input.rate, input.months)
          : LoanCalc.generateEqualPrincipalSchedule(input.principal, input.rate, input.months);
      } else {
        const parts = input.parts.filter(p => p.principal > 0);
        principalTotal = parts.reduce((s, p) => s + p.principal, 0);
        const schedules = parts.map(p => repayMethod === 'emi'
          ? LoanCalc.generateEMISchedule(p.principal, p.rate, input.months)
          : LoanCalc.generateEqualPrincipalSchedule(p.principal, p.rate, input.months)
        );
        schedule = schedules.reduce((acc, cur) => LoanCalc.mergeSchedules(acc, cur));
      }

      $('result').classList.remove('hidden');
      renderSummary($('summary'), schedule, principalTotal, repayMethod);
      renderTable($('scheduleTable').querySelector('tbody'), schedule);
    } catch (err) {
      alert(err.message || String(err));
    }
  }

  function handleReset() {
    $('principal').value = '';
    $('annualRate').value = '';
    $('principalCommercial').value = '';
    $('annualRateCommercial').value = '';
    $('principalFund').value = '';
    $('annualRateFund').value = '';
    $('years').value = 30;
    $('result').classList.add('hidden');
    $('summary').innerHTML = '';
    $('scheduleTable').querySelector('tbody').innerHTML = '';
  }

  document.addEventListener('DOMContentLoaded', function () {
    $('loanType').addEventListener('change', toggleGroups);
    $('calcBtn').addEventListener('click', function (e) { e.preventDefault(); handleCalc(); });
    $('resetBtn').addEventListener('click', function (e) { e.preventDefault(); handleReset(); });
    toggleGroups();
  });
})();