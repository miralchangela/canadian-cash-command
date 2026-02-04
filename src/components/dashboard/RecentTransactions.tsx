import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Transaction } from '@/types/finance';
import { ArrowUpRight, ArrowDownRight, RefreshCw, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecentTransactionsProps {
  transactions: Transaction[];
  limit?: number;
}

const typeIcons = {
  income: ArrowDownRight,
  expense: ArrowUpRight,
  transfer: RefreshCw,
  refund: RotateCcw,
};

const typeStyles = {
  income: 'text-income',
  expense: 'text-expense',
  transfer: 'text-muted-foreground',
  refund: 'text-info',
};

export function RecentTransactions({ transactions, limit = 5 }: RecentTransactionsProps) {
  const displayTransactions = transactions.slice(0, limit);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
        <Badge variant="secondary" className="font-normal">
          {transactions.length} total
        </Badge>
      </CardHeader>
      <CardContent>
        {displayTransactions.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-muted-foreground">
            No transactions yet
          </div>
        ) : (
          <div className="space-y-4">
            {displayTransactions.map((transaction) => {
              const Icon = typeIcons[transaction.type];
              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-full',
                        transaction.type === 'income' && 'bg-income/10',
                        transaction.type === 'expense' && 'bg-expense/10',
                        transaction.type === 'transfer' && 'bg-muted',
                        transaction.type === 'refund' && 'bg-info/10'
                      )}
                    >
                      <Icon className={cn('h-4 w-4', typeStyles[transaction.type])} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground line-clamp-1">
                        {transaction.merchant || transaction.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(transaction.date)} •{' '}
                        {transaction.category?.name || 'Uncategorized'}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      'font-semibold tabular-nums',
                      typeStyles[transaction.type]
                    )}
                  >
                    {transaction.type === 'income' || transaction.type === 'refund'
                      ? '+'
                      : '-'}
                    {formatCurrency(Math.abs(transaction.amount))}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
