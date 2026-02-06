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
import { Upload, FileText, CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// -----------------------------
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

// -----------------------------
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
  // Parse CSV - Dynamic delimiter detection
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

        // Detect delimiter (comma, tab, semicolon)
        const firstLine = lines[0];
        const delimiters = [',', '\t', ';', '|'];
        let bestDelimiter = ',';
        let maxColumns = 0;

        delimiters.forEach((delimiter) => {
          const columns = firstLine.split(delimiter).length;
          if (columns > maxColumns) {
            maxColumns = columns;
            bestDelimiter = delimiter;
          }
        });

        // Check if first line is header or data
        const firstLineParts = firstLine.split(bestDelimiter).map((v) => v.trim());
        const isHeader = firstLineParts.some((part) =>
          isNaN(parseFloat(part)) && part.length > 0
        );

        let headers: string[];
        let dataLines: string[];

        if (isHeader) {
          headers = firstLineParts;
          dataLines = lines.slice(1);
        } else {
          // Auto-generate headers if no header row
          headers = firstLineParts.map((_, i) => `Column ${i + 1}`);
          dataLines = lines;
        }

        // Parse rows
        const rows = dataLines.map((line) => {
          const values = line.split(bestDelimiter).map((v) => v.trim());
          const obj: Record<string, string> = {};
          headers.forEach((h, i) => {
            obj[h] = values[i] || '';
          });
          return obj;
        });

        setCsvData({ headers, rows, totalRows: rows.length });
        setParseError(null);

        // Auto-detect mapping
        autoDetectMapping(rows, headers);
        setStep('mapping');
      } catch (error) {
        setParseError('Failed to parse CSV file. Please check the file format.');
        console.error('Parse error:', error);
      }
    };
    reader.onerror = () => {
      setParseError('Failed to read file');
    };
    reader.readAsText(file);
  };

  // -----------------------------
  // Auto-detect column mapping
  // -----------------------------
  const autoDetectMapping = (rows: Record<string, string>[], headers: string[]) => {
    if (!rows.length) return;

    const mapping: HeaderMapping = {};

    // Helper to check if value looks like a date
    const isDateLike = (val: string) => {
      if (!val) return false;
      return /\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/.test(val) ||
             /\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}/.test(val);
    };

    // Helper to check if value is numeric
    const isNumeric = (val: string) => {
      if (!val) return false;
      const cleaned = val.replace(/[,\$\s]/g, '');
      return !isNaN(parseFloat(cleaned)) && isFinite(parseFloat(cleaned));
    };

    // Sample multiple rows for better detection
    const sampleSize = Math.min(5, rows.length);
    const samples = rows.slice(0, sampleSize);

    headers.forEach((header) => {
      const headerLower = header.toLowerCase();
      const sampleValues = samples.map((row) => row[header]);

      // Date detection
      if (!mapping.date && (
        headerLower.includes('date') ||
        headerLower.includes('trans') ||
        sampleValues.every(isDateLike)
      )) {
        mapping.date = header;
      }

      // Description detection
      if (!mapping.description && (
        headerLower.includes('description') ||
        headerLower.includes('detail') ||
        headerLower.includes('memo') ||
        headerLower.includes('narrative') ||
        sampleValues.every((v) => v && !isNumeric(v) && !isDateLike(v) && v.length > 3)
      )) {
        mapping.description = header;
      }

      // Debit detection
      if (!mapping.debit && (
        headerLower.includes('debit') ||
        headerLower.includes('withdrawal') ||
        headerLower.includes('spent')
      )) {
        mapping.debit = header;
      }

      // Credit detection
      if (!mapping.credit && (
        headerLower.includes('credit') ||
        headerLower.includes('deposit') ||
        headerLower.includes('received')
      )) {
        mapping.credit = header;
      }

      // Balance detection
      if (!mapping.balance && (
        headerLower.includes('balance') ||
        headerLower.includes('running')
      )) {
        mapping.balance = header;
      }

      // Amount detection (single column for both debit/credit)
      if (!mapping.amount && !mapping.debit && !mapping.credit && (
        headerLower.includes('amount') ||
        (sampleValues.every(isNumeric) && !headerLower.includes('balance'))
      )) {
        mapping.amount = header;
      }
    });

    setHeaderMapping(mapping);
  };

  // -----------------------------
  // Build preview transactions - Simple & Direct
  // -----------------------------
  const buildPreview = (): Transaction[] => {
    if (!csvData) return [];

    return csvData.rows.map((row, index) => {
      const date = headerMapping.date ? row[headerMapping.date] || '' : '';
      const description = headerMapping.description ? row[headerMapping.description] || '' : '';
      const creditRaw = headerMapping.credit ? row[headerMapping.credit] || '' : '';
      const debitRaw = headerMapping.debit ? row[headerMapping.debit] || '' : '';
      const balanceRaw = headerMapping.balance ? row[headerMapping.balance] || '' : '';

      const credit = parseFloat(creditRaw) || 0;
      const debit = parseFloat(debitRaw) || 0;
      const balance = parseFloat(balanceRaw) || 0;
      let amount = 0;
      let type: 'income' | 'expense' = 'expense';

      // Credit column = expenses, Debit column = income/credits
      if (credit > 0) {
        amount = credit;
        type = 'expense';
      } else if (debit > 0) {
        amount = debit;
        type = 'income';
      }

      return {
        id: btoa(`${date}-${description}-${amount}-${index}`),
        date,
        description,
        amount,
        type,
        currency: 'CAD',
        account: selectedAccount,
        balance: balance || undefined,
      };
    }).filter((t) => t.amount > 0); // Filter out empty rows
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

  const handleMappingChange = (field: keyof HeaderMapping, value: string) => {
    setHeaderMapping((prev) => ({
      ...prev,
      [field]: value === EMPTY_VALUE ? undefined : value,
    }));
  };

  const preparePreview = () => {
    if (!csvData) return;
    const preview = buildPreview(csvData, headerMapping);
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
                    <Label>{field.charAt(0).toUpperCase() + field.slice(1)}</Label>
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
              <div className="mt-4">
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
              <CardDescription>Check the first rows before import</CardDescription>
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
                      <TableCell>{t.description}</TableCell>
                      <TableCell>{t.type}</TableCell>
                      <TableCell className="text-right">{t.amount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-between mt-4">
                <Button variant="outline" onClick={() => setStep('mapping')}>Back</Button>
                <Button onClick={handleStartImport}>Start Import</Button>
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
              <p>{previewRows.length} transactions imported, {duplicateCount} duplicates skipped.</p>
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