// Core financial types for WealthFlow

export type TransactionType = 'income' | 'expense' | 'transfer' | 'refund';
export type CategoryType = 'income' | 'expense' | 'savings' | 'debt' | 'transfer';
export type AccountType = 'checking' | 'savings' | 'credit_card' | 'investment' | 'cash' | 'other';
export type RecurringFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
export type RegisteredAccountType = 'TFSA' | 'RRSP' | 'FHSA' | 'RESP';

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  institution?: string;
  currency: string;
  balance: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  parent_id?: string;
  type: CategoryType;
  icon?: string;
  color?: string;
  is_system: boolean;
  is_active: boolean;
  created_at: string;
  children?: Category[];
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id?: string;
  category_id?: string;
  import_batch_id?: string;
  date: string;
  description: string;
  merchant?: string;
  amount: number;
  original_amount?: number;
  currency: string;
  original_currency?: string;
  exchange_rate?: number;
  type: TransactionType;
  is_recurring: boolean;
  recurring_id?: string;
  is_split: boolean;
  parent_transaction_id?: string;
  notes?: string;
  tags?: string[];
  is_ignored: boolean;
  is_pending: boolean;
  hash?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  account?: Account;
  category?: Category;
}

export interface RecurringTransaction {
  id: string;
  user_id: string;
  account_id?: string;
  category_id?: string;
  description: string;
  merchant?: string;
  amount: number;
  currency: string;
  type: 'income' | 'expense';
  frequency: RecurringFrequency;
  start_date: string;
  end_date?: string;
  next_due_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoryRule {
  id: string;
  user_id: string;
  category_id: string;
  rule_type: 'merchant' | 'description' | 'amount_range' | 'keyword';
  pattern: string;
  min_amount?: number;
  max_amount?: number;
  priority: number;
  is_active: boolean;
  created_at: string;
  category?: Category;
}

export interface ImportBatch {
  id: string;
  user_id: string;
  account_id?: string;
  filename: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total_rows: number;
  imported_rows: number;
  duplicate_rows: number;
  error_message?: string;
  header_mapping?: HeaderMapping;
  created_at: string;
  completed_at?: string;
}

export interface HeaderMapping {
  date: string;
  description: string;
  amount: string;
  debit?: string;
  credit?: string;
  currency?: string;
  merchant?: string;
}

export interface NetWorthSnapshot {
  id: string;
  user_id: string;
  snapshot_date: string;
  total_assets: number;
  total_liabilities: number;
  net_worth: number;
  breakdown?: Record<string, number>;
  created_at: string;
}

export interface RegisteredContribution {
  id: string;
  user_id: string;
  account_type: RegisteredAccountType;
  year: number;
  contribution_limit: number;
  total_contributed: number;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  display_name?: string;
  default_currency: string;
  fiscal_year_start_month: number;
  onboarding_completed: boolean;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Dashboard KPI types
export interface DashboardKPIs {
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  savingsRate: number;
  netWorth: number;
  monthlyChange: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}

// CSV Import types
export interface CSVPreviewRow {
  [key: string]: string;
}

export interface CSVPreviewData {
  headers: string[];
  rows: CSVPreviewRow[];
  totalRows: number;
}

// Default Canadian category tree
export const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'user_id' | 'created_at'>[] = [
  // Income
  { name: 'Income', type: 'income', is_system: true, is_active: true },
  { name: 'Salary', type: 'income', is_system: true, is_active: true },
  { name: 'Freelance', type: 'income', is_system: true, is_active: true },
  { name: 'Government Benefits', type: 'income', is_system: true, is_active: true },
  { name: 'Investment Income', type: 'income', is_system: true, is_active: true },
  { name: 'Refunds', type: 'income', is_system: true, is_active: true },
  
  // Fixed Expenses
  { name: 'Fixed Expenses', type: 'expense', is_system: true, is_active: true },
  { name: 'Rent/Mortgage', type: 'expense', is_system: true, is_active: true },
  { name: 'Utilities', type: 'expense', is_system: true, is_active: true },
  { name: 'Insurance', type: 'expense', is_system: true, is_active: true },
  { name: 'Phone/Internet', type: 'expense', is_system: true, is_active: true },
  { name: 'Subscriptions', type: 'expense', is_system: true, is_active: true },
  
  // Variable Expenses
  { name: 'Variable Expenses', type: 'expense', is_system: true, is_active: true },
  { name: 'Groceries', type: 'expense', is_system: true, is_active: true },
  { name: 'Dining Out', type: 'expense', is_system: true, is_active: true },
  { name: 'Transportation', type: 'expense', is_system: true, is_active: true },
  { name: 'Shopping', type: 'expense', is_system: true, is_active: true },
  { name: 'Entertainment', type: 'expense', is_system: true, is_active: true },
  { name: 'Health & Wellness', type: 'expense', is_system: true, is_active: true },
  { name: 'Personal Care', type: 'expense', is_system: true, is_active: true },
  { name: 'Education', type: 'expense', is_system: true, is_active: true },
  { name: 'Travel', type: 'expense', is_system: true, is_active: true },
  { name: 'Gifts', type: 'expense', is_system: true, is_active: true },
  { name: 'Miscellaneous', type: 'expense', is_system: true, is_active: true },
  
  // Savings & Investments
  { name: 'Savings & Investments', type: 'savings', is_system: true, is_active: true },
  { name: 'TFSA', type: 'savings', is_system: true, is_active: true },
  { name: 'RRSP', type: 'savings', is_system: true, is_active: true },
  { name: 'FHSA', type: 'savings', is_system: true, is_active: true },
  { name: 'Emergency Fund', type: 'savings', is_system: true, is_active: true },
  { name: 'Non-Registered', type: 'savings', is_system: true, is_active: true },
  
  // Debt
  { name: 'Debt Payments', type: 'debt', is_system: true, is_active: true },
  { name: 'Credit Card Payment', type: 'debt', is_system: true, is_active: true },
  { name: 'Student Loan', type: 'debt', is_system: true, is_active: true },
  { name: 'Auto Loan', type: 'debt', is_system: true, is_active: true },
  { name: 'Personal Loan', type: 'debt', is_system: true, is_active: true },
  
  // Transfer
  { name: 'Transfer', type: 'transfer', is_system: true, is_active: true },
];

// 2024 Canada contribution limits
export const CONTRIBUTION_LIMITS_2024 = {
  TFSA: 7000,
  RRSP: 31560,
  FHSA: 8000,
  RESP: 50000, // Lifetime limit
};
