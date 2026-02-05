import { useState, useEffect } from 'react';
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
import { cn } from '@/lib/utils';
import { Category } from '@/types/finance';
import {sampleCategories} from '@/pages/Categories'

// ------------------------
type TransactionType = 'income' | 'expense' | 'transfer' | 'refund';

interface Transaction {
  id: string;
  date: string;
  description: string;
  merchant?: string;
  amount: number;
  currency: string;
  type: TransactionType;
  category?: string;
  account?: string;
  is_recurring?: boolean;
  is_pending?: boolean;
  is_ignored?: boolean;
}

const STORAGE_KEY = 'transactions';

const typeColors: Record<TransactionType, string> = {
  income: 'bg-income/10 text-income border-income/20',
  expense: 'bg-expense/10 text-expense border-expense/20',
  transfer: 'bg-muted text-muted-foreground border-border',
  refund: 'bg-info/10 text-info border-info/20',
};

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [form, setForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    type: 'expense',
    description: '',
    merchant: '',
    amount: '',
    currency: 'CAD',
    category: '',
    account: '',
    notes: '',
  });

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setTransactions(JSON.parse(stored));
    // categories already initialized from sampleCategories
  }, []);

  function saveTransactions(data: Transaction[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setTransactions(data);
  }

  function openDialog(transaction?: Transaction) {
    if (transaction) {
      setEditId(transaction.id);
      setForm({
        date: transaction.date,
        type: transaction.type,
        description: transaction.description,
        merchant: transaction.merchant || '',
        amount: transaction.amount.toString(),
        currency: transaction.currency,
        category: transaction.category || '',
        account: transaction.account || '',
        notes: '',
      });
    } else {
      setEditId(null);
      setForm({
        date: format(new Date(), 'yyyy-MM-dd'),
        type: 'expense',
        description: '',
        merchant: '',
        amount: '',
        currency: 'CAD',
        category: '',
        account: '',
        notes: '',
      });
    }
    setIsDialogOpen(true);
  }

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.id]: e.target.value });
  }

  function handleSelectChange(field: keyof typeof form, value: string) {
    setForm({ ...form, [field]: value });
  }

  function saveTransaction() {
    if (!form.description || !form.amount) {
      alert('Description and amount are required');
      return;
    }

    const newTransaction: Transaction = {
      id: editId || Date.now().toString(),
      date: form.date,
      description: form.description,
      merchant: form.merchant,
      amount: Number(form.amount),
      currency: form.currency,
      type: form.type as TransactionType,
      category: form.category,
      account: form.account,
      is_recurring: false,
      is_pending: false,
      is_ignored: false,
    };

    const updated = editId
      ? transactions.map(t => (t.id === editId ? newTransaction : t))
      : [newTransaction, ...transactions];

    saveTransactions(updated);
    setIsDialogOpen(false);
  }

  function deleteTransaction(id: string) {
    if (!confirm('Delete transaction?')) return;
    saveTransactions(transactions.filter(t => t.id !== id));
  }

  function toggleIgnore(id: string) {
    saveTransactions(
      transactions.map(t => (t.id === id ? { ...t, is_ignored: !t.is_ignored } : t))
    );
  }

  function exportCSV() {
    if (transactions.length === 0) {
      alert('No data');
      return;
    }

    let csv =
      'Date,Description,Merchant,Type,Category,Account,Amount,Currency\n';
    transactions.forEach(t => {
      csv += `${t.date},"${t.description}","${t.merchant || ''}",${t.type},${
        t.category || ''
      },${t.account || ''},${t.amount},${t.currency}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch =
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.merchant || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    return matchesSearch && matchesType && matchesCategory;
  });

  const uniqueCategories = Array.from(
    new Set(transactions.map(t => t.category).filter(Boolean))
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
            <Button variant="outline" size="sm" onClick={exportCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button size="sm" onClick={() => openDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Transaction
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
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
                {uniqueCategories.map(cat => (
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
                filteredTransactions.map(transaction => (
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
                            <Badge variant="secondary" className="text-xs px-1.5 py-0">
                              Recurring
                            </Badge>
                          )}
                          {transaction.is_pending && (
                            <Badge variant="outline" className="text-xs px-1.5 py-0">
                              Pending
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {transaction.category || 'Uncategorized'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {transaction.account || '—'}
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
                        {transaction.type === 'income' || transaction.type === 'refund'
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
                          <DropdownMenuItem onClick={() => openDialog(transaction)}>
                            <Edit2 className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Tag className="mr-2 h-4 w-4" />
                            Change Category
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleIgnore(transaction.id)}>
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
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => deleteTransaction(transaction.id)}
                          >
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

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editId ? 'Edit Transaction' : 'Add Transaction'}</DialogTitle>
              <DialogDescription>
                {editId
                  ? 'Update your transaction details.'
                  : 'Manually add a new transaction to your records.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={form.date}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={form.type}
                    onValueChange={val => handleSelectChange('type', val)}
                  >
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
                <Input
                  id="description"
                  placeholder="Enter description"
                  value={form.description}
                  onChange={handleFormChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="merchant">Merchant (optional)</Label>
                <Input
                  id="merchant"
                  placeholder="Store or company name"
                  value={form.merchant}
                  onChange={handleFormChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={form.currency}
                    onValueChange={val => handleSelectChange('currency', val)}
                  >
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
                  <Select
                    value={form.category}
                    onValueChange={val => handleSelectChange('category', val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                    {sampleCategories
                      .filter(c => c.parent_id)
                      .map(c => (
                        <SelectItem key={c.id} value={c.name}>
                          {c.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account">Account</Label>
                  <Select
                    value={form.account}
                    onValueChange={val => handleSelectChange('account', val)}
                  >
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
                  value={form.notes}
                  onChange={handleFormChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveTransaction}>
                {editId ? 'Update Transaction' : 'Add Transaction'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
