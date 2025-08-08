const assert = require('assert');
const LoanCalc = require('./calc.js');

function approxEqual(a, b, eps = 0.02) { // 2% tolerance
  const denom = Math.max(1, Math.abs(b));
  assert.ok(Math.abs(a - b) / denom <= eps, `Expected ${a} ≈ ${b}`);
}

(function testEMI() {
  const principal = 1_000_000;
  const rate = 4.2; // % annual
  const months = 360;

  const monthly = LoanCalc.calculateEMI(principal, rate, months);
  // Rough expectation around 4890 for 4.2%/30Y
  approxEqual(monthly, 4890, 0.02);

  const schedule = LoanCalc.generateEMISchedule(principal, rate, months);
  assert.strictEqual(schedule.length, months);
  const summary = LoanCalc.summarizeSchedule(schedule);
  approxEqual(summary.totalPrincipal, principal, 0.0001);
  // Interest should be positive
  assert.ok(summary.totalInterest > 0);
  // Remaining at the end should be zero
  assert.strictEqual(schedule[schedule.length - 1].remaining, 0);
})();

(function testEqualPrincipal() {
  const principal = 900_000;
  const rate = 3.1;
  const months = 240;

  const schedule = LoanCalc.generateEqualPrincipalSchedule(principal, rate, months);
  assert.strictEqual(schedule.length, months);
  const summary = LoanCalc.summarizeSchedule(schedule);
  approxEqual(summary.totalPrincipal, principal, 0.0001);
  assert.ok(summary.totalInterest > 0);
  // Payments should strictly decrease or stay same (with rounding)
  for (let i = 1; i < schedule.length; i++) {
    assert.ok(schedule[i].payment <= schedule[i - 1].payment + 0.01, 'payments should not increase');
  }
})();

(function testMerge() {
  const a = LoanCalc.generateEMISchedule(500_000, 4.3, 120);
  const b = LoanCalc.generateEqualPrincipalSchedule(300_000, 3.1, 120);
  const m = LoanCalc.mergeSchedules(a, b);
  assert.strictEqual(m.length, 120);
  const sa = LoanCalc.summarizeSchedule(a);
  const sb = LoanCalc.summarizeSchedule(b);
  const sm = LoanCalc.summarizeSchedule(m);
  approxEqual(sm.totalPayment, sa.totalPayment + sb.totalPayment, 0.0001);
})();

console.log('All tests passed.');