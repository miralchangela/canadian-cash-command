import { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle2, ArrowRight, X } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { HeaderMapping, CSVPreviewData } from '@/types/finance';

// Sample parsed CSV data for demo
const sampleCSVData: CSVPreviewData = {
  headers: ['Transaction Date', 'Description', 'Debit', 'Credit', 'Balance'],
  rows: [
    { 'Transaction Date': '2024-01-15', 'Description': 'LOBLAWS #1234', 'Debit': '156.42', 'Credit': '', 'Balance': '4523.58' },
    { 'Transaction Date': '2024-01-14', 'Description': 'NETFLIX.COM', 'Debit': '16.99', 'Credit': '', 'Balance': '4680.00' },
    { 'Transaction Date': '2024-01-13', 'Description': 'E-TRANSFER FROM JOHN', 'Debit': '', 'Credit': '500.00', 'Balance': '4696.99' },
    { 'Transaction Date': '2024-01-12', 'Description': 'TIM HORTONS #567', 'Debit': '8.45', 'Credit': '', 'Balance': '4196.99' },
    { 'Transaction Date': '2024-01-11', 'Description': 'AMAZON.CA MARKETPLACE', 'Debit': '89.99', 'Credit': '', 'Balance': '4205.44' },
  ],
  totalRows: 127,
};

type ImportStep = 'upload' | 'mapping' | 'preview' | 'importing' | 'complete';

const requiredMappings = ['date', 'description', 'amount'] as const;
const optionalMappings = ['merchant', 'currency', 'debit', 'credit'] as const;

export default function Import() {
  const [step, setStep] = useState<ImportStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CSVPreviewData | null>(null);
  const [headerMapping, setHeaderMapping] = useState<Partial<HeaderMapping>>({});
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [importProgress, setImportProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.name.endsWith('.csv')) {
      setFile(droppedFile);
      // Simulate CSV parsing
      setCsvData(sampleCSVData);
      setStep('mapping');
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Simulate CSV parsing
      setCsvData(sampleCSVData);
      setStep('mapping');
    }
  };

  const handleMappingChange = (field: keyof HeaderMapping, value: string) => {
    setHeaderMapping((prev) => ({ ...prev, [field]: value }));
  };

  const isValidMapping = () => {
    // Either amount OR (debit AND credit) must be mapped
    const hasAmount = !!headerMapping.amount;
    const hasDebitCredit = !!headerMapping.debit && !!headerMapping.credit;
    return !!headerMapping.date && !!headerMapping.description && (hasAmount || hasDebitCredit);
  };

  const handleStartImport = () => {
    setStep('importing');
    // Simulate import progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => setStep('complete'), 500);
      }
      setImportProgress(progress);
    }, 300);
  };

  const resetImport = () => {
    setStep('upload');
    setFile(null);
    setCsvData(null);
    setHeaderMapping({});
    setSelectedAccount('');
    setImportProgress(0);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Import Transactions
          </h1>
          <p className="text-muted-foreground">
            Upload CSV files from your bank or credit card to import transactions
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2">
          {['Upload', 'Map Headers', 'Preview', 'Import'].map((label, index) => {
            const stepIndex = ['upload', 'mapping', 'preview', 'importing'].indexOf(step);
            const isActive = index === stepIndex;
            const isComplete = index < stepIndex || step === 'complete';
            return (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors',
                    isComplete && 'bg-primary text-primary-foreground',
                    isActive && 'bg-primary/20 text-primary border-2 border-primary',
                    !isActive && !isComplete && 'bg-muted text-muted-foreground'
                  )}
                >
                  {isComplete ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                </div>
                <span
                  className={cn(
                    'text-sm font-medium',
                    isActive && 'text-foreground',
                    !isActive && 'text-muted-foreground'
                  )}
                >
                  {label}
                </span>
                {index < 3 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground mx-2" />
                )}
              </div>
            );
          })}
        </div>

        {/* Upload Step */}
        {step === 'upload' && (
          <Card>
            <CardHeader>
              <CardTitle>Upload CSV File</CardTitle>
              <CardDescription>
                Drag and drop a CSV file or click to browse. We support statements from major Canadian banks.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={cn(
                  'flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-colors',
                  isDragging
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
                )}
              >
                <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">
                  Drop your CSV file here
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  or click to browse files
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="csv-upload"
                />
                <Button asChild>
                  <label htmlFor="csv-upload" className="cursor-pointer">
                    <FileText className="mr-2 h-4 w-4" />
                    Select CSV File
                  </label>
                </Button>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-4">
                  <CheckCircle2 className="h-5 w-5 text-income mt-0.5" />
                  <div>
                    <p className="font-medium">Flexible Headers</p>
                    <p className="text-sm text-muted-foreground">
                      Map any CSV format to our system
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-4">
                  <CheckCircle2 className="h-5 w-5 text-income mt-0.5" />
                  <div>
                    <p className="font-medium">Duplicate Detection</p>
                    <p className="text-sm text-muted-foreground">
                      Automatically skip duplicate transactions
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-4">
                  <CheckCircle2 className="h-5 w-5 text-income mt-0.5" />
                  <div>
                    <p className="font-medium">Auto-Categorize</p>
                    <p className="text-sm text-muted-foreground">
                      Smart categorization based on rules
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mapping Step */}
        {step === 'mapping' && csvData && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Map CSV Headers</CardTitle>
                  <CardDescription>
                    Match your CSV columns to transaction fields
                  </CardDescription>
                </div>
                <Badge variant="secondary">
                  <FileText className="mr-1.5 h-3 w-3" />
                  {file?.name}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Account Selection */}
              <div className="space-y-2">
                <Label>Import to Account</Label>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger className="w-full max-w-sm">
                    <SelectValue placeholder="Select an account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="td-chequing">TD Chequing</SelectItem>
                    <SelectItem value="td-visa">TD Visa</SelectItem>
                    <SelectItem value="new">+ Create New Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Required Mappings */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  Required Fields
                </h4>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Date *</Label>
                    <Select
                      value={headerMapping.date || ''}
                      onValueChange={(v) => handleMappingChange('date', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        {csvData.headers.map((h) => (
                          <SelectItem key={h} value={h}>
                            {h}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Description *</Label>
                    <Select
                      value={headerMapping.description || ''}
                      onValueChange={(v) => handleMappingChange('description', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        {csvData.headers.map((h) => (
                          <SelectItem key={h} value={h}>
                            {h}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Amount (or map Debit/Credit below)</Label>
                    <Select
                      value={headerMapping.amount || ''}
                      onValueChange={(v) => handleMappingChange('amount', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {csvData.headers.map((h) => (
                          <SelectItem key={h} value={h}>
                            {h}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Optional Mappings */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  Optional Fields
                </h4>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Debit Column</Label>
                    <Select
                      value={headerMapping.debit || ''}
                      onValueChange={(v) => handleMappingChange('debit', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {csvData.headers.map((h) => (
                          <SelectItem key={h} value={h}>
                            {h}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Credit Column</Label>
                    <Select
                      value={headerMapping.credit || ''}
                      onValueChange={(v) => handleMappingChange('credit', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {csvData.headers.map((h) => (
                          <SelectItem key={h} value={h}>
                            {h}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select
                      value={headerMapping.currency || ''}
                      onValueChange={(v) => handleMappingChange('currency', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None (default CAD)</SelectItem>
                        {csvData.headers.map((h) => (
                          <SelectItem key={h} value={h}>
                            {h}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={resetImport}>
                  Cancel
                </Button>
                <Button
                  onClick={() => setStep('preview')}
                  disabled={!isValidMapping() || !selectedAccount}
                >
                  Continue to Preview
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Preview Step */}
        {step === 'preview' && csvData && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Preview Import</CardTitle>
                  <CardDescription>
                    Review the first 5 rows before importing
                  </CardDescription>
                </div>
                <Badge variant="outline">
                  {csvData.totalRows} transactions total
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Duplicate Detection</AlertTitle>
                <AlertDescription>
                  3 potential duplicates found based on date, description, and amount. These will be skipped during import.
                </AlertDescription>
              </Alert>

              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Category</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvData.rows.map((row, index) => {
                      const debit = parseFloat(row['Debit'] || '0');
                      const credit = parseFloat(row['Credit'] || '0');
                      const amount = credit || debit;
                      const isIncome = !!credit;
                      return (
                        <TableRow key={index}>
                          <TableCell>{row['Transaction Date']}</TableCell>
                          <TableCell className="font-medium">{row['Description']}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={isIncome ? 'bg-income/10 text-income' : 'bg-expense/10 text-expense'}
                            >
                              {isIncome ? 'Income' : 'Expense'}
                            </Badge>
                          </TableCell>
                          <TableCell className={cn('text-right font-semibold', isIncome ? 'text-income' : 'text-expense')}>
                            {isIncome ? '+' : '-'}${amount.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {index === 0 ? 'Groceries' : index === 1 ? 'Subscriptions' : index === 2 ? 'Income' : 'Uncategorized'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep('mapping')}>
                  Back to Mapping
                </Button>
                <Button onClick={handleStartImport}>
                  Import {csvData.totalRows - 3} Transactions
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Importing Step */}
        {step === 'importing' && (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center text-center">
                <div className="mb-6">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse-soft">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Importing Transactions</h3>
                <p className="text-muted-foreground mb-6">
                  Processing your CSV file...
                </p>
                <div className="w-full max-w-md space-y-2">
                  <Progress value={importProgress} className="h-2" />
                  <p className="text-sm text-muted-foreground">
                    {Math.round(importProgress)}% complete
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Complete Step */}
        {step === 'complete' && (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center text-center">
                <div className="mb-6">
                  <div className="h-16 w-16 rounded-full bg-income/10 flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-income" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Import Complete!</h3>
                <p className="text-muted-foreground mb-6">
                  Successfully imported 124 transactions. 3 duplicates were skipped.
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={resetImport}>
                    Import Another File
                  </Button>
                  <Button onClick={() => window.location.href = '/transactions'}>
                    View Transactions
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
