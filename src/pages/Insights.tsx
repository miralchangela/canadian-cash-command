import { TrendingUp, TrendingDown, AlertTriangle, Lightbulb, Target, ArrowRight } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, formatPercent } from '@/lib/formatters';

// Sample insights data
const insights = [
  {
    id: '1',
    type: 'warning',
    title: 'Dining spending up 23%',
    description: 'Your dining expenses increased from $228 to $280 compared to last month.',
    action: 'Review transactions',
    category: 'Dining Out',
  },
  {
    id: '2',
    type: 'success',
    title: 'Great savings month!',
    description: 'You saved 34.5% of your income this month, above your 30% goal.',
    action: 'Keep it up',
    category: 'Savings',
  },
  {
    id: '3',
    type: 'info',
    title: 'TFSA contribution room',
    description: 'You have $2,500 remaining in your 2024 TFSA contribution limit.',
    action: 'Contribute now',
    category: 'TFSA',
  },
  {
    id: '4',
    type: 'warning',
    title: 'Subscription creep detected',
    description: 'You have 8 active subscriptions totaling $156/month. Review if all are needed.',
    action: 'Review subscriptions',
    category: 'Subscriptions',
  },
];

const savingsGoals = [
  { name: 'Emergency Fund', current: 12500, target: 20000, color: 'bg-chart-3' },
  { name: 'Vacation', current: 2800, target: 5000, color: 'bg-chart-2' },
  { name: 'New Laptop', current: 1200, target: 2000, color: 'bg-chart-5' },
];

const spendingTrends = [
  { category: 'Groceries', current: 650, previous: 580, trend: 'up' },
  { category: 'Transportation', current: 350, previous: 420, trend: 'down' },
  { category: 'Entertainment', current: 200, previous: 150, trend: 'up' },
  { category: 'Utilities', current: 185, previous: 180, trend: 'up' },
];

const insightIcons = {
  warning: AlertTriangle,
  success: TrendingUp,
  info: Lightbulb,
};

const insightStyles = {
  warning: 'border-warning/30 bg-warning/5',
  success: 'border-income/30 bg-income/5',
  info: 'border-info/30 bg-info/5',
};

const insightIconStyles = {
  warning: 'bg-warning/20 text-warning',
  success: 'bg-income/20 text-income',
  info: 'bg-info/20 text-info',
};

export default function Insights() {
  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Financial Insights
          </h1>
          <p className="text-muted-foreground">
            Personalized insights and recommendations based on your spending patterns
          </p>
        </div>

        {/* Active Insights */}
        <div className="space-y-4">
          <h2 className="font-display text-xl font-semibold">This Month's Insights</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {insights.map((insight) => {
              const Icon = insightIcons[insight.type as keyof typeof insightIcons];
              return (
                <Card
                  key={insight.id}
                  className={insightStyles[insight.type as keyof typeof insightStyles]}
                >
                  <CardContent className="p-5">
                    <div className="flex gap-4">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                          insightIconStyles[insight.type as keyof typeof insightIconStyles]
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold">{insight.title}</h3>
                          <Badge variant="secondary" className="shrink-0">
                            {insight.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {insight.description}
                        </p>
                        <Button variant="ghost" size="sm" className="h-8 px-0 text-primary">
                          {insight.action}
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Savings Goals */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Savings Goals
                  </CardTitle>
                  <CardDescription>Track your progress toward financial goals</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  Add Goal
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {savingsGoals.map((goal) => {
                const percentage = (goal.current / goal.target) * 100;
                return (
                  <div key={goal.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{goal.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(goal.current)} of {formatCurrency(goal.target)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={percentage} className="h-2 flex-1" />
                      <span className="w-12 text-right text-sm font-medium">
                        {Math.round(percentage)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Spending Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Spending Trends</CardTitle>
              <CardDescription>Compare this month to last month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {spendingTrends.map((item) => {
                  const change = ((item.current - item.previous) / item.previous) * 100;
                  const isUp = item.trend === 'up';
                  return (
                    <div
                      key={item.category}
                      className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full ${
                            isUp ? 'bg-expense/10' : 'bg-income/10'
                          }`}
                        >
                          {isUp ? (
                            <TrendingUp className="h-4 w-4 text-expense" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-income" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{item.category}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(item.previous)} → {formatCurrency(item.current)}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={isUp ? 'text-expense' : 'text-income'}
                      >
                        {isUp ? '+' : ''}
                        {formatPercent(change)}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Summary */}
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-display text-xl font-semibold">January 2024 Summary</h3>
                <p className="text-muted-foreground">
                  You're doing well! Your savings rate is above average for Canadians.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-8 text-center">
                <div>
                  <p className="text-2xl font-bold text-income">{formatCurrency(5500)}</p>
                  <p className="text-sm text-muted-foreground">Income</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-expense">{formatCurrency(3600)}</p>
                  <p className="text-sm text-muted-foreground">Spent</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(1900)}</p>
                  <p className="text-sm text-muted-foreground">Saved</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
