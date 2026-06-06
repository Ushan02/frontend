export function getDiscountPercent(labeledPrice, price) {
  const labeled = Number(labeledPrice);
  const current = Number(price);
  if (!Number.isFinite(labeled) || !Number.isFinite(current) || labeled <= current) {
    return 0;
  }
  return Math.round((1 - current / labeled) * 100);
}

export function isOnSale(labeledPrice, price) {
  return getDiscountPercent(labeledPrice, price) > 0;
}
