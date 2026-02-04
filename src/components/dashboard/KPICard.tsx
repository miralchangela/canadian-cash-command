import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCurrency, formatPercent } from '@/lib/formatters';

interface KPICardProps {
  title: string;
  value: number;
  change?: number;
  changeLabel?: string;
  format?: 'currency' | 'percent' | 'number';
  icon?: ReactNode;
  variant?: 'default' | 'income' | 'expense' | 'savings' | 'neutral';
  className?: string;
}

const variantStyles = {
  default: 'bg-card',
  income: 'bg-gradient-to-br from-income/10 to-income/5 border-income/20',
  expense: 'bg-gradient-to-br from-expense/10 to-expense/5 border-expense/20',
  savings: 'bg-gradient-to-br from-savings/10 to-savings/5 border-savings/20',
  neutral: 'bg-gradient-to-br from-muted to-muted/50',
};

const valueStyles = {
  default: 'text-foreground',
  income: 'text-income',
  expense: 'text-expense',
  savings: 'text-savings',
  neutral: 'text-foreground',
};

export function KPICard({
  title,
  value,
  change,
  changeLabel,
  format = 'currency',
  icon,
  variant = 'default',
  className,
}: KPICardProps) {
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return formatCurrency(val);
      case 'percent':
        return formatPercent(val);
      default:
        return val.toLocaleString('en-CA');
    }
  };

  const isPositiveChange = change !== undefined && change > 0;
  const isNegativeChange = change !== undefined && change < 0;
  const isNeutralChange = change === 0;

  return (
    <div
      className={cn(
        'kpi-card border rounded-xl transition-all duration-300 hover:shadow-card-hover',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={cn('text-2xl font-bold tracking-tight font-display', valueStyles[variant])}>
            {formatValue(value)}
          </p>
        </div>
        {icon && (
          <div className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg',
            variant === 'income' && 'bg-income/20 text-income',
            variant === 'expense' && 'bg-expense/20 text-expense',
            variant === 'savings' && 'bg-savings/20 text-savings',
            variant === 'default' && 'bg-primary/10 text-primary',
            variant === 'neutral' && 'bg-muted-foreground/10 text-muted-foreground',
          )}>
            {icon}
          </div>
        )}
      </div>

      {change !== undefined && (
        <div className="mt-4 flex items-center gap-2">
          <div
            className={cn(
              'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
              isPositiveChange && 'bg-income/10 text-income',
              isNegativeChange && 'bg-expense/10 text-expense',
              isNeutralChange && 'bg-muted text-muted-foreground'
            )}
          >
            {isPositiveChange && <TrendingUp className="h-3 w-3" />}
            {isNegativeChange && <TrendingDown className="h-3 w-3" />}
            {isNeutralChange && <Minus className="h-3 w-3" />}
            <span>
              {isPositiveChange && '+'}
              {formatPercent(Math.abs(change))}
            </span>
          </div>
          {changeLabel && (
            <span className="text-xs text-muted-foreground">{changeLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
