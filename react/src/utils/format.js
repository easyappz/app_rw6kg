export function formatPrice(value) {
  const number = Number(value || 0);
  try {
    return number.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });
  } catch (e) {
    return `${number} ₽`;
  }
}

export function compactNumber(num) {
  const n = Number(num || 0);
  if (n < 1000) return String(n);
  if (n < 1000000) return `${Math.round(n / 100) / 10}k`;
  return `${Math.round(n / 100000) / 10}m`;
}
