import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/formatters';
import { CONTRIBUTION_LIMITS_2024 } from '@/types/finance';

interface RegisteredAccountCardProps {
  accountType: 'TFSA' | 'RRSP' | 'FHSA';
  contributed: number;
  limit?: number;
}

const accountDescriptions = {
  TFSA: 'Tax-Free Savings Account',
  RRSP: 'Registered Retirement Savings Plan',
  FHSA: 'First Home Savings Account',
};

const accountColors = {
  TFSA: 'bg-chart-1',
  RRSP: 'bg-chart-2',
  FHSA: 'bg-chart-3',
};

export function RegisteredAccountCard({
  accountType,
  contributed,
  limit = CONTRIBUTION_LIMITS_2024[accountType],
}: RegisteredAccountCardProps) {
  const percentage = Math.min((contributed / limit) * 100, 100);
  const remaining = Math.max(limit - contributed, 0);
  const isMaxed = contributed >= limit;

  return (
    <Card className="relative overflow-hidden">
      <div
        className={`absolute left-0 top-0 h-1 w-full ${accountColors[accountType]}`}
      />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">{accountType}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {accountDescriptions[accountType]}
            </p>
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            2024
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold">
              {formatCurrency(contributed)}
            </span>
            <span className="text-sm text-muted-foreground">
              of {formatCurrency(limit)}
            </span>
          </div>
          <Progress
            value={percentage}
            className="h-2"
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Room remaining</span>
          <span className={isMaxed ? 'font-medium text-income' : 'font-medium'}>
            {isMaxed ? 'Maxed out! 🎉' : formatCurrency(remaining)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
