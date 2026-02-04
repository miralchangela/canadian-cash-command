import { useState } from 'react';
import { format } from 'date-fns';
import {
  Search,
  Filter,
  Download,
  Plus,
  MoreHorizontal,
  ArrowUpDown,
  Edit2,
  Trash2,
  Tag,
  Eye,
  EyeOff,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Transaction, TransactionType } from '@/types/finance';
import { cn } from '@/lib/utils';

// Extended sample data
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
    account: { id: '1', user_id: 'demo', name: 'TD Chequing', type: 'checking', currency: 'CAD', balance: 5000, is_active: true, created_at: '', updated_at: '' },
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
    account: { id: '2', user_id: 'demo', name: 'TD Visa', type: 'credit_card', currency: 'CAD', balance: -1200, is_active: true, created_at: '', updated_at: '' },
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
    account: { id: '2', user_id: 'demo', name: 'TD Visa', type: 'credit_card', currency: 'CAD', balance: -1200, is_active: true, created_at: '', updated_at: '' },
  },
  {
    id: '4',
    user_id: 'demo',
    date: '2024-01-12',
    description: 'Tim Hortons Coffee',
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
    account: { id: '2', user_id: 'demo', name: 'TD Visa', type: 'credit_card', currency: 'CAD', balance: -1200, is_active: true, created_at: '', updated_at: '' },
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
    account: { id: '1', user_id: 'demo', name: 'TD Chequing', type: 'checking', currency: 'CAD', balance: 5000, is_active: true, created_at: '', updated_at: '' },
  },
  {
    id: '6',
    user_id: 'demo',
    date: '2024-01-10',
    description: 'Rent Payment',
    merchant: 'Property Management Co.',
    amount: 1800,
    currency: 'CAD',
    type: 'expense',
    is_recurring: true,
    is_split: false,
    is_ignored: false,
    is_pending: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: { id: '6', user_id: 'demo', name: 'Rent/Mortgage', type: 'expense', is_system: true, is_active: true, created_at: '' },
    account: { id: '1', user_id: 'demo', name: 'TD Chequing', type: 'checking', currency: 'CAD', balance: 5000, is_active: true, created_at: '', updated_at: '' },
  },
  {
    id: '7',
    user_id: 'demo',
    date: '2024-01-09',
    description: 'GST/HST Credit',
    merchant: 'CRA',
    amount: 125,
    currency: 'CAD',
    type: 'income',
    is_recurring: true,
    is_split: false,
    is_ignored: false,
    is_pending: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: { id: '7', user_id: 'demo', name: 'Government Benefits', type: 'income', is_system: true, is_active: true, created_at: '' },
    account: { id: '1', user_id: 'demo', name: 'TD Chequing', type: 'checking', currency: 'CAD', balance: 5000, is_active: true, created_at: '', updated_at: '' },
  },
  {
    id: '8',
    user_id: 'demo',
    date: '2024-01-08',
    description: 'Amazon Purchase Refund',
    merchant: 'Amazon.ca',
    amount: 45.99,
    currency: 'CAD',
    type: 'refund',
    is_recurring: false,
    is_split: false,
    is_ignored: false,
    is_pending: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: { id: '8', user_id: 'demo', name: 'Refunds', type: 'income', is_system: true, is_active: true, created_at: '' },
    account: { id: '2', user_id: 'demo', name: 'TD Visa', type: 'credit_card', currency: 'CAD', balance: -1200, is_active: true, created_at: '', updated_at: '' },
  },
];

const typeColors: Record<TransactionType, string> = {
  income: 'bg-income/10 text-income border-income/20',
  expense: 'bg-expense/10 text-expense border-expense/20',
  transfer: 'bg-muted text-muted-foreground border-border',
  refund: 'bg-info/10 text-info border-info/20',
};

export default function Transactions() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredTransactions = sampleTransactions.filter((t) => {
    const matchesSearch =
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.merchant?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    const matchesCategory =
      categoryFilter === 'all' || t.category?.name === categoryFilter;
    return matchesSearch && matchesType && matchesCategory;
  });

  const uniqueCategories = Array.from(
    new Set(sampleTransactions.map((t) => t.category?.name).filter(Boolean))
  );

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Transactions
            </h1>
            <p className="text-muted-foreground">
              View and manage all your financial transactions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Transaction
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add Transaction</DialogTitle>
                  <DialogDescription>
                    Manually add a new transaction to your records.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        defaultValue={format(new Date(), 'yyyy-MM-dd')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <Select defaultValue="expense">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="income">Income</SelectItem>
                          <SelectItem value="expense">Expense</SelectItem>
                          <SelectItem value="transfer">Transfer</SelectItem>
                          <SelectItem value="refund">Refund</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input id="description" placeholder="Enter description" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="merchant">Merchant (optional)</Label>
                    <Input id="merchant" placeholder="Store or company name" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {uniqueCategories.map((cat) => (
                            <SelectItem key={cat} value={cat || ''}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="account">Account</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="td-chequing">TD Chequing</SelectItem>
                          <SelectItem value="td-visa">TD Visa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add any additional notes"
                      rows={2}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={() => setIsAddDialogOpen(false)}>
                    Add Transaction
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
                <SelectItem value="refund">Refund</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px]">
                <Tag className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueCategories.map((cat) => (
                  <SelectItem key={cat} value={cat || ''}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[100px]">
                  <Button variant="ghost" size="sm" className="-ml-3 h-8">
                    Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-32 text-center text-muted-foreground"
                  >
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => (
                  <TableRow
                    key={transaction.id}
                    className={cn(
                      'table-row-hover',
                      transaction.is_ignored && 'opacity-50'
                    )}
                  >
                    <TableCell className="font-medium">
                      {formatDate(transaction.date)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {transaction.merchant || transaction.description}
                        </span>
                        {transaction.merchant && (
                          <span className="text-xs text-muted-foreground line-clamp-1">
                            {transaction.description}
                          </span>
                        )}
                        <div className="mt-1 flex items-center gap-2">
                          {transaction.is_recurring && (
                            <Badge
                              variant="secondary"
                              className="text-xs px-1.5 py-0"
                            >
                              Recurring
                            </Badge>
                          )}
                          {transaction.is_pending && (
                            <Badge
                              variant="outline"
                              className="text-xs px-1.5 py-0"
                            >
                              Pending
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {transaction.category?.name || 'Uncategorized'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {transaction.account?.name || '—'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn('capitalize', typeColors[transaction.type])}
                      >
                        {transaction.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={cn(
                          'font-semibold tabular-nums',
                          transaction.type === 'income' && 'text-income',
                          transaction.type === 'expense' && 'text-expense',
                          transaction.type === 'refund' && 'text-info'
                        )}
                      >
                        {transaction.type === 'income' ||
                        transaction.type === 'refund'
                          ? '+'
                          : '-'}
                        {formatCurrency(Math.abs(transaction.amount))}
                      </span>
                    </TableCell>
                    <TableCell>
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
                            <Tag className="mr-2 h-4 w-4" />
                            Change Category
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            {transaction.is_ignored ? (
                              <>
                                <Eye className="mr-2 h-4 w-4" />
                                Include
                              </>
                            ) : (
                              <>
                                <EyeOff className="mr-2 h-4 w-4" />
                                Ignore
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination hint */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>Showing {filteredTransactions.length} transactions</p>
        </div>
      </div>
    </AppLayout>
  );
}
