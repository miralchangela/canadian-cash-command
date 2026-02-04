import { useState } from 'react';
import { Plus, Edit2, Trash2, CreditCard, Building2, Wallet, PiggyBank, MoreHorizontal, TrendingUp } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatCurrency } from '@/lib/formatters';
import { Account, AccountType } from '@/types/finance';
import { cn } from '@/lib/utils';

// Sample accounts
const sampleAccounts: Account[] = [
  { id: '1', user_id: 'demo', name: 'TD Chequing', type: 'checking', institution: 'TD Bank', currency: 'CAD', balance: 5432.18, is_active: true, created_at: '', updated_at: '' },
  { id: '2', user_id: 'demo', name: 'TD Visa Infinite', type: 'credit_card', institution: 'TD Bank', currency: 'CAD', balance: -1847.32, is_active: true, created_at: '', updated_at: '' },
  { id: '3', user_id: 'demo', name: 'High Interest Savings', type: 'savings', institution: 'EQ Bank', currency: 'CAD', balance: 12500.00, is_active: true, created_at: '', updated_at: '' },
  { id: '4', user_id: 'demo', name: 'TFSA - Wealthsimple', type: 'investment', institution: 'Wealthsimple', currency: 'CAD', balance: 28750.45, is_active: true, created_at: '', updated_at: '' },
  { id: '5', user_id: 'demo', name: 'RRSP - Questrade', type: 'investment', institution: 'Questrade', currency: 'CAD', balance: 15200.00, is_active: true, created_at: '', updated_at: '' },
  { id: '6', user_id: 'demo', name: 'Cash', type: 'cash', institution: '', currency: 'CAD', balance: 250.00, is_active: true, created_at: '', updated_at: '' },
];

const accountIcons: Record<AccountType, typeof CreditCard> = {
  checking: Building2,
  savings: PiggyBank,
  credit_card: CreditCard,
  investment: TrendingUp,
  cash: Wallet,
  other: Wallet,
};

const accountTypeLabels: Record<AccountType, string> = {
  checking: 'Chequing',
  savings: 'Savings',
  credit_card: 'Credit Card',
  investment: 'Investment',
  cash: 'Cash',
  other: 'Other',
};

export default function Accounts() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Calculate totals
  const totalAssets = sampleAccounts
    .filter((a) => a.balance > 0)
    .reduce((sum, a) => sum + a.balance, 0);
  const totalLiabilities = sampleAccounts
    .filter((a) => a.balance < 0)
    .reduce((sum, a) => sum + Math.abs(a.balance), 0);
  const netWorth = totalAssets - totalLiabilities;

  // Group accounts by type
  const groupedAccounts = sampleAccounts.reduce((acc, account) => {
    const group = account.type;
    if (!acc[group]) acc[group] = [];
    acc[group].push(account);
    return acc;
  }, {} as Record<AccountType, Account[]>);

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Accounts
            </h1>
            <p className="text-muted-foreground">
              Manage your bank accounts, credit cards, and investments
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Account</DialogTitle>
                <DialogDescription>
                  Add a new bank account, credit card, or investment account.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Account Name</Label>
                  <Input id="name" placeholder="e.g., TD Chequing" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Account Type</Label>
                    <Select defaultValue="checking">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="checking">Chequing</SelectItem>
                        <SelectItem value="savings">Savings</SelectItem>
                        <SelectItem value="credit_card">Credit Card</SelectItem>
                        <SelectItem value="investment">Investment</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select defaultValue="CAD">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CAD">CAD</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="institution">Financial Institution</Label>
                  <Input id="institution" placeholder="e.g., TD Bank" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="balance">Current Balance</Label>
                  <Input id="balance" type="number" step="0.01" placeholder="0.00" />
                  <p className="text-xs text-muted-foreground">
                    Enter negative for credit card balances (amount owed)
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsAddDialogOpen(false)}>
                  Add Account
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="bg-gradient-to-br from-income/10 to-income/5 border-income/20">
            <CardHeader className="pb-2">
              <CardDescription>Total Assets</CardDescription>
              <CardTitle className="text-2xl text-income">
                {formatCurrency(totalAssets)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-gradient-to-br from-expense/10 to-expense/5 border-expense/20">
            <CardHeader className="pb-2">
              <CardDescription>Total Liabilities</CardDescription>
              <CardTitle className="text-2xl text-expense">
                {formatCurrency(totalLiabilities)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardDescription>Net Worth</CardDescription>
              <CardTitle className="text-2xl text-primary">
                {formatCurrency(netWorth)}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Accounts by Type */}
        <div className="space-y-6">
          {Object.entries(groupedAccounts).map(([type, accounts]) => {
            const Icon = accountIcons[type as AccountType];
            const groupTotal = accounts.reduce((sum, a) => sum + a.balance, 0);
            
            return (
              <Card key={type}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {accountTypeLabels[type as AccountType]}
                        </CardTitle>
                        <CardDescription>
                          {accounts.length} account{accounts.length !== 1 ? 's' : ''}
                        </CardDescription>
                      </div>
                    </div>
                    <span className={cn(
                      'text-lg font-bold',
                      groupTotal >= 0 ? 'text-foreground' : 'text-expense'
                    )}>
                      {formatCurrency(groupTotal)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {accounts.map((account) => (
                      <div
                        key={account.id}
                        className="flex items-center justify-between rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-medium">{account.name}</p>
                            {account.institution && (
                              <p className="text-sm text-muted-foreground">
                                {account.institution}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className={cn(
                              'text-lg font-semibold tabular-nums',
                              account.balance >= 0 ? 'text-foreground' : 'text-expense'
                            )}>
                              {formatCurrency(account.balance)}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {account.currency}
                            </Badge>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit2 className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                Update Balance
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
