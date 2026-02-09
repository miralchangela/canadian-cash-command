import React, { useState, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Upload, FileText, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const EMPTY_VALUE = '__NONE__';

type Step = 'upload' | 'mapping' | 'preview' | 'importing' | 'complete';

interface CSVData {
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
}

interface HeaderMapping {
  date?: string;
  description?: string;
  debit?: string;
  credit?: string;
  balance?: string;
  amount?: string;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  balance?: number;
  currency: string;
  account: string;
}

export default function ImportTransactionsPage() {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CSVData | null>(null);
  const [headerMapping, setHeaderMapping] = useState<HeaderMapping>({});
  const [selectedAccount, setSelectedAccount] = useState('Default Account');
  const [previewRows, setPreviewRows] = useState<Transaction[]>([]);
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [importProgress, setImportProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // -----------------------------
  // Parse CSV
  // -----------------------------
  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter((l) => l.trim() !== '');
        if (!lines.length) {
          setParseError('CSV file is empty');
          return;
        }

        // Detect delimiter
        const firstLine = lines[0];
        const delimiters = ['\t', ',', ';', '|'];
        let bestDelimiter = '\t';
        let maxColumns = 0;
        delimiters.forEach((delimiter) => {
          const columns = firstLine.split(delimiter).length;
          if (columns > maxColumns) {
            maxColumns = columns;
            bestDelimiter = delimiter;
          }
        });

        const rows = lines.map((line) => {
          const values = line.split(bestDelimiter).map((v) => v.trim());
          return {
            date: values[0] || '',
            description: values[1] || '',
            debit: values[2] || '',
            credit: values[3] || '',
            balance: values[4] || '',
          };
        });

        setCsvData({ headers: ['date', 'description', 'debit', 'credit', 'balance'], rows, totalRows: rows.length });
        setParseError(null);

        setHeaderMapping({ date: 'date', description: 'description', debit: 'debit', credit: 'credit', balance: 'balance' });
        setStep('mapping');
      } catch (error) {
        setParseError('Failed to parse CSV file. Please check the file format.');
        console.error('Parse error:', error);
      }
    };
    reader.onerror = () => setParseError('Failed to read file');
    reader.readAsText(file);
  };

  // -----------------------------
  // Build preview
  // -----------------------------
  const buildPreview = (): Transaction[] => {
    if (!csvData) return [];

    const parseAmount = (value?: string) => {
      if (!value) return 0;
      let cleaned = value.toString().replace(/[$,₹\s]/g, '').trim();
      if (cleaned.startsWith('(') && cleaned.endsWith(')')) cleaned = '-' + cleaned.slice(1, -1);
      const num = parseFloat(cleaned);
      return isNaN(num) ? 0 : num;
    };

    const result: Transaction[] = [];

    csvData.rows.forEach((row, idx) => {
      const date = row.date;
      const description = row.description;
      const debit = parseAmount(row.debit);
      const credit = parseAmount(row.credit);
      const balance = parseAmount(row.balance);

      let amount = 0;
      let type: 'income' | 'expense' = 'expense';

      if (credit > 0) {
        amount = credit;
        type = 'income';
      } else if (debit > 0) {
        amount = debit;
        type = 'expense';
      } else if (description.toUpperCase().includes('PAYMENT') || description.toUpperCase().includes('THANK YOU')) {
        amount = credit || debit;
        type = 'income';
      }

      result.push({
        id: `${date}-${description}-${amount}-${idx}`,
        date,
        description,
        amount: Math.abs(amount),
        type,
        currency: 'CAD',
        account: selectedAccount,
        balance: balance || undefined,
      });
    });

    return result;
  };

  // -----------------------------
  // Detect duplicates
  // -----------------------------
  const detectDuplicates = (transactions: Transaction[]) => {
    const existing = JSON.parse(localStorage.getItem('transactions') || '[]');
    const existingIds = new Set(existing.map((t: Transaction) => t.id));

    const unique: Transaction[] = [];
    let duplicates = 0;

    transactions.forEach((t) => {
      if (existingIds.has(t.id)) duplicates++;
      else unique.push(t);
    });

    return { unique, duplicates };
  };

  // -----------------------------
  // Save transactions
  // -----------------------------
  const saveTransactions = (transactions: Transaction[]) => {
    const existing = JSON.parse(localStorage.getItem('transactions') || '[]');
    localStorage.setItem('transactions', JSON.stringify([...existing, ...transactions]));
  };

  // -----------------------------
  // Handlers
  // -----------------------------
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.name.endsWith('.csv')) {
      setFile(droppedFile);
      parseCSV(droppedFile);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  };

  const preparePreview = () => {
    if (!csvData) return;
    const preview = buildPreview();
    const { unique, duplicates } = detectDuplicates(preview);
    setPreviewRows(unique);
    setDuplicateCount(duplicates);
    setStep('preview');
  };

  const handleStartImport = () => {
    setStep('importing');
    saveTransactions(previewRows);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => setStep('complete'), 500);
      }
      setImportProgress(progress);
    }, 200);
  };

  const resetImport = () => {
    setStep('upload');
    setFile(null);
    setCsvData(null);
    setHeaderMapping({});
    setSelectedAccount('Default Account');
    setImportProgress(0);
    setPreviewRows([]);
    setDuplicateCount(0);
  };

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Import Transactions</h1>
          <p className="text-muted-foreground">Upload CSV files from your bank or credit card to import transactions</p>
        </div>

        {/* Upload Step */}
        {step === 'upload' && (
          <Card>
            <CardHeader>
              <CardTitle>Upload CSV File</CardTitle>
              <CardDescription>Drag and drop a CSV file or click to browse.</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={cn(
                  'flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-colors',
                  isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
                )}
              >
                <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">Drop your CSV file here</p>
                <p className="text-sm text-muted-foreground mb-4">or click to browse files</p>
                <input type="file" accept=".csv" onChange={handleFileSelect} className="hidden" id="csv-upload" />
                <Button asChild>
                  <label htmlFor="csv-upload" className="cursor-pointer">
                    <FileText className="mr-2 h-4 w-4" />
                    Select CSV File
                  </label>
                </Button>
              </div>
              {parseError && <p className="text-red-500 mt-2">{parseError}</p>}
            </CardContent>
          </Card>
        )}

        {/* Mapping Step */}
        {step === 'mapping' && csvData && (
          <Card>
            <CardHeader>
              <CardTitle>Map CSV Headers</CardTitle>
              <CardDescription>Select which columns correspond to date, description, debit/credit, etc.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(['date','description','debit','credit','balance'] as (keyof HeaderMapping)[]).map((field) => (
                  <div key={field} className="space-y-2">
                    <Label>
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                      {field === 'debit' && <span className="text-xs text-muted-foreground ml-1">(Expenses)</span>}
                      {field === 'credit' && <span className="text-xs text-muted-foreground ml-1">(Payment / Refund)</span>}
                    </Label>
                    <Select
                      value={headerMapping[field] ?? EMPTY_VALUE}
                      onValueChange={(v) => handleMappingChange(field, v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={EMPTY_VALUE}>None</SelectItem>
                        {csvData.headers.filter((h) => h.trim() !== '').map((h) => (
                          <SelectItem key={h} value={h}>{h}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-4">
                {/* Back Button */}
                <Button variant="outline" onClick={() => setStep('upload')}>Back</Button>
                <Button onClick={preparePreview}>Preview Transactions</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Preview Step */}
        {step === 'preview' && (
          <Card>
            <CardHeader>
              <CardTitle>Preview Transactions</CardTitle>
              <CardDescription>Check the first rows before import ({previewRows.length} transactions found)</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewRows.slice(0, 10).map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>{t.date}</TableCell>
                      <TableCell className="max-w-xs truncate">{t.description}</TableCell>
                      <TableCell>
                        <span className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                          t.type === 'income'
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        )}>
                          {t.type === 'income' ? 'Refund / Payment' : 'Expense'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${t.amount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-between mt-4">
                <Button variant="outline" onClick={() => setStep('mapping')}>Back</Button>
                <Button onClick={handleStartImport}>
                  Import {previewRows.length} Transaction{previewRows.length !== 1 ? 's' : ''}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Importing Step */}
        {step === 'importing' && (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="flex flex-col items-center">
                <Upload className="h-12 w-12 animate-spin mb-4" />
                <p>Importing Transactions...</p>
                <Progress value={importProgress} className="h-2 mt-2" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Complete Step */}
        {step === 'complete' && (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Import Complete!</h3>
              <p>{previewRows.length} transactions imported{duplicateCount > 0 ? `, ${duplicateCount} duplicates skipped` : ''}.</p>
              <div className="flex justify-center gap-3 mt-4">
                <Button variant="outline" onClick={resetImport}>Import Another File</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
