import { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Wallet,
  CalendarDays,
} from 'lucide-react';
import { KPICard } from '@/components/dashboard/KPICard';
import { ExpenseBreakdownChart } from '@/components/dashboard/ExpenseBreakdownChart';
import { IncomeExpenseTrendChart } from '@/components/dashboard/IncomeExpenseTrendChart';
import { RegisteredAccountCard } from '@/components/dashboard/RegisteredAccountCard';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { MonthlyComparisonChart } from '@/components/dashboard/MonthlyComparisonChart';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AppLayout } from '@/components/layout/AppLayout';
import { Transaction } from '@/types/finance';

// Sample demo data
const sampleTransactions: Transaction[] = [
  {
    id: '1',
    user_id: 'demo',
    date: '2024-01-15',
    description: 'Monthly Salary',
    merchant: 'Tech Corp Inc.',
    amount: 5500,
    currency: 'CAD',
    type: 'income',
    is_recurring: true,
    is_split: false,
    is_ignored: false,
    is_pending: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: { id: '1', user_id: 'demo', name: 'Salary', type: 'income', is_system: true, is_active: true, created_at: '' },
  },
  {
    id: '2',
    user_id: 'demo',
    date: '2024-01-14',
    description: 'Loblaw Groceries',
    merchant: 'Loblaws',
    amount: 156.42,
    currency: 'CAD',
    type: 'expense',
    is_recurring: false,
    is_split: false,
    is_ignored: false,
    is_pending: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: { id: '2', user_id: 'demo', name: 'Groceries', type: 'expense', is_system: true, is_active: true, created_at: '' },
  },
  {
    id: '3',
    user_id: 'demo',
    date: '2024-01-13',
    description: 'Netflix Subscription',
    merchant: 'Netflix',
    amount: 16.99,
    currency: 'CAD',
    type: 'expense',
    is_recurring: true,
    is_split: false,
    is_ignored: false,
    is_pending: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: { id: '3', user_id: 'demo', name: 'Subscriptions', type: 'expense', is_system: true, is_active: true, created_at: '' },
  },
  {
    id: '4',
    user_id: 'demo',
    date: '2024-01-12',
    description: 'Tim Hortons',
    merchant: 'Tim Hortons',
    amount: 8.45,
    currency: 'CAD',
    type: 'expense',
    is_recurring: false,
    is_split: false,
    is_ignored: false,
    is_pending: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: { id: '4', user_id: 'demo', name: 'Dining Out', type: 'expense', is_system: true, is_active: true, created_at: '' },
  },
  {
    id: '5',
    user_id: 'demo',
    date: '2024-01-11',
    description: 'TFSA Contribution',
    merchant: 'Wealthsimple',
    amount: 500,
    currency: 'CAD',
    type: 'expense',
    is_recurring: true,
    is_split: false,
    is_ignored: false,
    is_pending: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: { id: '5', user_id: 'demo', name: 'TFSA', type: 'savings', is_system: true, is_active: true, created_at: '' },
  },
];

const expenseBreakdownData = [
  { name: 'Housing', value: 1800, color: 'hsl(var(--chart-1))' },
  { name: 'Groceries', value: 650, color: 'hsl(var(--chart-2))' },
  { name: 'Transportation', value: 350, color: 'hsl(var(--chart-3))' },
  { name: 'Dining', value: 280, color: 'hsl(var(--chart-4))' },
  { name: 'Entertainment', value: 200, color: 'hsl(var(--chart-5))' },
  { name: 'Other', value: 320, color: 'hsl(var(--chart-6))' },
];

const trendData = [
  { month: 'Jul', income: 5500, expenses: 3800, savings: 1700 },
  { month: 'Aug', income: 5500, expenses: 4100, savings: 1400 },
  { month: 'Sep', income: 5700, expenses: 3600, savings: 2100 },
  { month: 'Oct', income: 5500, expenses: 3900, savings: 1600 },
  { month: 'Nov', income: 5800, expenses: 4200, savings: 1600 },
  { month: 'Dec', income: 6200, expenses: 4800, savings: 1400 },
  { month: 'Jan', income: 5500, expenses: 3600, savings: 1900 },
];

const monthlyComparisonData = [
  { month: 'Dec 23', income: 5200, expenses: 4100 },
  { month: 'Jan 24', income: 5500, expenses: 3600 },
];

export default function Dashboard() {
  const [dateRange, setDateRange] = useState('this-month');

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Financial Overview
            </h1>
            <p className="text-muted-foreground">
              Track your income, expenses, and savings at a glance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[160px]">
                <CalendarDays className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                <SelectItem value="this-year">This Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Total Income"
            value={5500}
            change={5.2}
            changeLabel="vs last month"
            icon={<DollarSign className="h-5 w-5" />}
            variant="income"
            className="animate-slide-up"
          />
          <KPICard
            title="Total Expenses"
            value={3600}
            change={-8.3}
            changeLabel="vs last month"
            icon={<TrendingDown className="h-5 w-5" />}
            variant="expense"
            className="animate-slide-up delay-100"
          />
          <KPICard
            title="Net Cash Flow"
            value={1900}
            change={12.1}
            changeLabel="vs last month"
            icon={<TrendingUp className="h-5 w-5" />}
            variant="savings"
            className="animate-slide-up delay-200"
          />
          <KPICard
            title="Savings Rate"
            value={34.5}
            format="percent"
            change={3.2}
            changeLabel="vs last month"
            icon={<PiggyBank className="h-5 w-5" />}
            variant="default"
            className="animate-slide-up delay-300"
          />
        </div>

        {/* Net Worth Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-6 text-primary-foreground shadow-glow animate-slide-up delay-400">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-primary-foreground/80">
                Total Net Worth
              </p>
              <p className="font-display text-4xl font-bold">$47,250.00</p>
              <p className="mt-1 text-sm text-primary-foreground/70">
                <span className="text-accent">↑ 4.2%</span> from last month
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                className="bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"
              >
                <Wallet className="mr-2 h-4 w-4" />
                View Breakdown
              </Button>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          <IncomeExpenseTrendChart data={trendData} />
          <ExpenseBreakdownChart data={expenseBreakdownData} />
        </div>

        {/* Registered Accounts */}
        <div>
          <h2 className="mb-4 font-display text-xl font-semibold">
            Registered Accounts (2024)
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <RegisteredAccountCard
              accountType="TFSA"
              contributed={4500}
            />
            <RegisteredAccountCard
              accountType="RRSP"
              contributed={8200}
            />
            <RegisteredAccountCard
              accountType="FHSA"
              contributed={3000}
            />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          <RecentTransactions transactions={sampleTransactions} />
          <MonthlyComparisonChart data={monthlyComparisonData} />
        </div>
      </div>
    </AppLayout>
  );
}
