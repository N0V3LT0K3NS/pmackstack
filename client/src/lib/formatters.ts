import { format as dateFnsFormat } from 'date-fns';

export function formatCurrency(value: number, compact = false): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: compact ? 0 : 2,
    maximumFractionDigits: compact ? 0 : 2,
    notation: compact ? 'compact' : 'standard',
  });
  return formatter.format(value);
}

export function formatNumber(value: number, compact = false): string {
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    notation: compact ? 'compact' : 'standard',
  });
  return formatter.format(value);
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatDate(date: Date | string, formatStr = 'MMM d, yyyy'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateFnsFormat(dateObj, formatStr);
}

export function formatDateShort(date: Date | string): string {
  return formatDate(date, 'MMM d');
}

export function formatDateRange(start: Date | string, end: Date | string): string {
  return `${formatDate(start, 'MMM d')} - ${formatDate(end, 'MMM d, yyyy')}`;
}

// Labor cost efficiency helpers
export function getLaborEfficiencyColor(percent: number): string {
  if (percent < 18) return 'text-success-600';
  if (percent < 22) return 'text-success-500';
  if (percent < 25) return 'text-warning-500';
  return 'text-error-600';
}

export function getLaborEfficiencyBgColor(percent: number): string {
  if (percent < 18) return 'bg-success-50';
  if (percent < 22) return 'bg-success-50';
  if (percent < 25) return 'bg-warning-50';
  return 'bg-error-50';
}

export function getLaborEfficiencyLabel(percent: number): string {
  if (percent < 18) return 'Excellent';
  if (percent < 22) return 'Good';
  if (percent < 25) return 'Warning';
  return 'Critical';
} 