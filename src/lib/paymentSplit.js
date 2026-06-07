export function computePaymentSplit(total, cashPercent) {
  const pct = Number(cashPercent);
  if (!Number.isInteger(pct) || pct < 1 || pct > 99) return null;

  const cashAmount = Math.round(total * pct) / 100;
  const cardAmount = Math.round((total - cashAmount) * 100) / 100;

  return {
    cashPercent: pct,
    cardPercent: 100 - pct,
    cashAmount,
    cardAmount,
  };
}
