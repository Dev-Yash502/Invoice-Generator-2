export function formatINR(val: number): string {
  const rounded = Math.round(val);
  return '₹' + rounded.toLocaleString('en-IN');
}

export function formatINRWithDecimals(val: number): string {
  return '₹' + val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
