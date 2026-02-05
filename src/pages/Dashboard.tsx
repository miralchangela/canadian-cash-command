import { useState, useEffect } from 'react';
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
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/finance';

export default function Dashboard() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('this-month');

  // Fetch user transactions
  const fetchTransactions = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from<Transaction>('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });
    if (error) console.error(error);
    else setTransactions(data || []);
    setLoading(false);
  };

  // Add transaction
  const addTransaction = async (
    newTransaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>
  ) => {
    if (!user) return;
    const { error } = await supabase
      .from('transactions')
      .insert([{ ...newTransaction, user_id: user.id }]);
    if (error) console.error(error);
    else fetchTransactions();
  };

  // Delete transaction
  const deleteTransaction = async (id: string) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) console.error(error);
    else fetchTransactions();
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  // Compute dynamic KPIs
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netCashFlow = totalIncome - totalExpenses;
  const savingsRate = totalIncome ? (netCashFlow / totalIncome) * 100 : 0;

  // Dynamic trend data
  const trendData = transactions.reduce<
    { month: string; income: number; expenses: number; savings: number }[]
  >((acc, t) => {
    const month = new Date(t.date).toLocaleString('default', { month: 'short' });
    let existing = acc.find((m) => m.month === month);
    if (!existing) {
      existing = { month, income: 0, expenses: 0, savings: 0 };
      acc.push(existing);
    }
    if (t.type === 'income') existing.income += t.amount;
    if (t.type === 'expense') existing.expenses += t.amount;
    existing.savings = existing.income - existing.expenses;
    return acc;
  }, []);

  // Dynamic expense breakdown
  const expenseBreakdownData = transactions
    .filter((t) => t.type === 'expense')
    .reduce<{ name: string; value: number; color: string }[]>((acc, t, i) => {
      const existing = acc.find((e) => e.name === t.category.name);
      if (existing) existing.value += t.amount;
      else
        acc.push({
          name: t.category.name,
          value: t.amount,
          color: `hsl(var(--chart-${(i % 6) + 1}))`,
        });
      return acc;
    }, []);

  // Registered account totals
  const tfsaTotal = transactions
    .filter((t) => t.category.name === 'TFSA')
    .reduce((sum, t) => sum + t.amount, 0);

  const rrspTotal = transactions
    .filter((t) => t.category.name === 'RRSP')
    .reduce((sum, t) => sum + t.amount, 0);

  const fhsaTotal = transactions
    .filter((t) => t.category.name === 'FHSA')
    .reduce((sum, t) => sum + t.amount, 0);

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
          <KPICard title="Total Income" value={totalIncome} icon={<DollarSign className="h-5 w-5" />} variant="income" />
          <KPICard title="Total Expenses" value={totalExpenses} icon={<TrendingDown className="h-5 w-5" />} variant="expense" />
          <KPICard title="Net Cash Flow" value={netCashFlow} icon={<TrendingUp className="h-5 w-5" />} variant="savings" />
          <KPICard title="Savings Rate" value={savingsRate} format="percent" icon={<PiggyBank className="h-5 w-5" />} />
        </div>

        {/* Net Worth Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-6 text-primary-foreground shadow-glow">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-primary-foreground/80">Total Net Worth</p>
              <p className="font-display text-4xl font-bold">${netCashFlow.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary">
                <Wallet className="mr-2 h-4 w-4" /> View Breakdown
              </Button>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          {transactions.length > 0 ? (
            <>
              <IncomeExpenseTrendChart data={trendData} />
              <ExpenseBreakdownChart data={expenseBreakdownData} />
            </>
          ) : (
            <p className="col-span-3 text-center text-muted-foreground">
              No data to display charts. Add transactions to see trends.
            </p>
          )}
        </div>

        {/* Registered Accounts */}
        <div>
          <h2 className="mb-4 font-display text-xl font-semibold">Registered Accounts (2024)</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <RegisteredAccountCard accountType="TFSA" contributed={tfsaTotal} />
            <RegisteredAccountCard accountType="RRSP" contributed={rrspTotal} />
            <RegisteredAccountCard accountType="FHSA" contributed={fhsaTotal} />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {transactions.length > 0 ? (
            <RecentTransactions transactions={transactions} onAdd={addTransaction} onDelete={deleteTransaction} />
          ) : (
            <p className="text-center text-muted-foreground">
              No transactions yet. Add your first transaction to get started!
            </p>
          )}
          <MonthlyComparisonChart data={[]} />
        </div>
      </div>
    </AppLayout>
  );
}
