export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatDate(date: Date | string, formatString: string = 'MMM dd, yyyy'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[dateObj.getMonth()];
  const day = dateObj.getDate();
  const year = dateObj.getFullYear();

  if (formatString === 'MMM dd, yyyy') {
    return `${month} ${day}, ${year}`;
  }

  if (formatString === 'yyyy-MM-dd') {
    const monthNum = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dayNum = String(day).padStart(2, '0');
    return `${year}-${monthNum}-${dayNum}`;
  }

  return dateObj.toLocaleDateString();
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatNumber(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}