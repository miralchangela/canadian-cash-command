import { useState } from 'react';
import { Plus, Edit2, Trash2, ChevronRight, FolderTree, Tag, MoreHorizontal, GripVertical } from 'lucide-react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Category, CategoryRule, CategoryType } from '@/types/finance';

// Sample categories with hierarchy
const sampleCategories: Category[] = [
  { id: '1', user_id: 'demo', name: 'Income', type: 'income', is_system: true, is_active: true, created_at: '', color: '#22c55e' },
  { id: '2', user_id: 'demo', name: 'Salary', type: 'income', parent_id: '1', is_system: true, is_active: true, created_at: '', color: '#22c55e' },
  { id: '3', user_id: 'demo', name: 'Freelance', type: 'income', parent_id: '1', is_system: true, is_active: true, created_at: '', color: '#22c55e' },
  { id: '4', user_id: 'demo', name: 'Government Benefits', type: 'income', parent_id: '1', is_system: true, is_active: true, created_at: '', color: '#22c55e' },
  
  { id: '10', user_id: 'demo', name: 'Fixed Expenses', type: 'expense', is_system: true, is_active: true, created_at: '', color: '#ef4444' },
  { id: '11', user_id: 'demo', name: 'Rent/Mortgage', type: 'expense', parent_id: '10', is_system: true, is_active: true, created_at: '', color: '#ef4444' },
  { id: '12', user_id: 'demo', name: 'Utilities', type: 'expense', parent_id: '10', is_system: true, is_active: true, created_at: '', color: '#ef4444' },
  { id: '13', user_id: 'demo', name: 'Insurance', type: 'expense', parent_id: '10', is_system: true, is_active: true, created_at: '', color: '#ef4444' },
  { id: '14', user_id: 'demo', name: 'Subscriptions', type: 'expense', parent_id: '10', is_system: true, is_active: true, created_at: '', color: '#ef4444' },
  
  { id: '20', user_id: 'demo', name: 'Variable Expenses', type: 'expense', is_system: true, is_active: true, created_at: '', color: '#f97316' },
  { id: '21', user_id: 'demo', name: 'Groceries', type: 'expense', parent_id: '20', is_system: true, is_active: true, created_at: '', color: '#f97316' },
  { id: '22', user_id: 'demo', name: 'Dining Out', type: 'expense', parent_id: '20', is_system: true, is_active: true, created_at: '', color: '#f97316' },
  { id: '23', user_id: 'demo', name: 'Transportation', type: 'expense', parent_id: '20', is_system: true, is_active: true, created_at: '', color: '#f97316' },
  { id: '24', user_id: 'demo', name: 'Shopping', type: 'expense', parent_id: '20', is_system: true, is_active: true, created_at: '', color: '#f97316' },
  { id: '25', user_id: 'demo', name: 'Entertainment', type: 'expense', parent_id: '20', is_system: true, is_active: true, created_at: '', color: '#f97316' },
  
  { id: '30', user_id: 'demo', name: 'Savings & Investments', type: 'savings', is_system: true, is_active: true, created_at: '', color: '#0ea5e9' },
  { id: '31', user_id: 'demo', name: 'TFSA', type: 'savings', parent_id: '30', is_system: true, is_active: true, created_at: '', color: '#0ea5e9' },
  { id: '32', user_id: 'demo', name: 'RRSP', type: 'savings', parent_id: '30', is_system: true, is_active: true, created_at: '', color: '#0ea5e9' },
  { id: '33', user_id: 'demo', name: 'FHSA', type: 'savings', parent_id: '30', is_system: true, is_active: true, created_at: '', color: '#0ea5e9' },
  { id: '34', user_id: 'demo', name: 'Emergency Fund', type: 'savings', parent_id: '30', is_system: true, is_active: true, created_at: '', color: '#0ea5e9' },
];

// Sample categorization rules
const sampleRules: CategoryRule[] = [
  { id: '1', user_id: 'demo', category_id: '21', rule_type: 'merchant', pattern: 'loblaws', priority: 10, is_active: true, created_at: '' },
  { id: '2', user_id: 'demo', category_id: '21', rule_type: 'merchant', pattern: 'no frills', priority: 10, is_active: true, created_at: '' },
  { id: '3', user_id: 'demo', category_id: '22', rule_type: 'merchant', pattern: 'tim hortons', priority: 10, is_active: true, created_at: '' },
  { id: '4', user_id: 'demo', category_id: '22', rule_type: 'merchant', pattern: 'starbucks', priority: 10, is_active: true, created_at: '' },
  { id: '5', user_id: 'demo', category_id: '14', rule_type: 'merchant', pattern: 'netflix', priority: 10, is_active: true, created_at: '' },
  { id: '6', user_id: 'demo', category_id: '14', rule_type: 'merchant', pattern: 'spotify', priority: 10, is_active: true, created_at: '' },
  { id: '7', user_id: 'demo', category_id: '23', rule_type: 'merchant', pattern: 'petro-canada', priority: 10, is_active: true, created_at: '' },
  { id: '8', user_id: 'demo', category_id: '4', rule_type: 'keyword', pattern: 'gst/hst credit', priority: 5, is_active: true, created_at: '' },
];

const typeColors: Record<CategoryType, string> = {
  income: 'bg-income/10 text-income border-income/20',
  expense: 'bg-expense/10 text-expense border-expense/20',
  savings: 'bg-savings/10 text-savings border-savings/20',
  debt: 'bg-warning/10 text-warning border-warning/20',
  transfer: 'bg-muted text-muted-foreground border-border',
};

const typeLabels: Record<CategoryType, string> = {
  income: 'Income',
  expense: 'Expense',
  savings: 'Savings',
  debt: 'Debt',
  transfer: 'Transfer',
};

export default function Categories() {
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isAddRuleOpen, setIsAddRuleOpen] = useState(false);

  // Group categories by parent
  const parentCategories = sampleCategories.filter((c) => !c.parent_id);
  const getChildren = (parentId: string) =>
    sampleCategories.filter((c) => c.parent_id === parentId);

  // Get category name by id
  const getCategoryName = (id: string) =>
    sampleCategories.find((c) => c.id === id)?.name || 'Unknown';

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Categories & Rules
            </h1>
            <p className="text-muted-foreground">
              Manage spending categories and auto-categorization rules
            </p>
          </div>
        </div>

        <Tabs defaultValue="categories" className="space-y-6">
          <TabsList>
            <TabsTrigger value="categories">
              <FolderTree className="mr-2 h-4 w-4" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="rules">
              <Tag className="mr-2 h-4 w-4" />
              Categorization Rules
            </TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="space-y-6">
            <div className="flex justify-end">
              <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Category</DialogTitle>
                    <DialogDescription>
                      Create a new category for organizing your transactions.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Category Name</Label>
                      <Input id="name" placeholder="e.g., Pet Expenses" />
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
                          <SelectItem value="savings">Savings</SelectItem>
                          <SelectItem value="debt">Debt</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parent">Parent Category (optional)</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="None (top-level category)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {parentCategories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddCategoryOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setIsAddCategoryOpen(false)}>
                      Create Category
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Categories Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {parentCategories.map((parent) => {
                const children = getChildren(parent.id);
                return (
                  <Card key={parent.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: parent.color }}
                          />
                          <CardTitle className="text-lg">{parent.name}</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={typeColors[parent.type]}>
                            {typeLabels[parent.type]}
                          </Badge>
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
                                <Plus className="mr-2 h-4 w-4" />
                                Add Subcategory
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
                    </CardHeader>
                    <CardContent>
                      {children.length > 0 ? (
                        <div className="space-y-2">
                          {children.map((child) => (
                            <div
                              key={child.id}
                              className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 transition-colors hover:bg-muted"
                            >
                              <div className="flex items-center gap-2">
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">{child.name}</span>
                              </div>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No subcategories
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="rules" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Auto-Categorization Rules</CardTitle>
                    <CardDescription>
                      Rules are applied in priority order when importing transactions
                    </CardDescription>
                  </div>
                  <Dialog open={isAddRuleOpen} onOpenChange={setIsAddRuleOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Rule
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Categorization Rule</DialogTitle>
                        <DialogDescription>
                          Create a rule to automatically categorize transactions.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label>Rule Type</Label>
                          <Select defaultValue="merchant">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="merchant">Merchant Contains</SelectItem>
                              <SelectItem value="description">Description Contains</SelectItem>
                              <SelectItem value="keyword">Keyword Match</SelectItem>
                              <SelectItem value="amount_range">Amount Range</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Pattern to Match</Label>
                          <Input placeholder="e.g., costco, amazon, etc." />
                        </div>
                        <div className="space-y-2">
                          <Label>Assign to Category</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {sampleCategories
                                .filter((c) => c.parent_id)
                                .map((c) => (
                                  <SelectItem key={c.id} value={c.id}>
                                    {c.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Priority (higher = first)</Label>
                          <Input type="number" defaultValue="10" min="1" max="100" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddRuleOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={() => setIsAddRuleOpen(false)}>
                          Create Rule
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]"></TableHead>
                      <TableHead>Pattern</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-center">Priority</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sampleRules.map((rule) => (
                      <TableRow key={rule.id} className="table-row-hover">
                        <TableCell>
                          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {rule.pattern}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">
                            {rule.rule_type.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getCategoryName(rule.category_id)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center font-mono">
                          {rule.priority}
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
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
