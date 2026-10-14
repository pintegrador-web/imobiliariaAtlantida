export const formatDateBR = (isoDate) => {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
};

export const getWeekdayFromISO = (isoDate) => {
  const date = new Date(isoDate + 'T12:00:00');
  return date.getDay();
};

export const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);