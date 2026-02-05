import { useState } from 'react'
import Papa from 'papaparse'

type ParsedCSV = {
  rows: string[][]
  columnCount: number
}

export default function CsvUploader({
  onParsed,
}: {
  onParsed: (data: ParsedCSV) => void
}) {
  const [error, setError] = useState<string | null>(null)

  const handleFile = (file: File) => {
    Papa.parse<string[]>(file, {
      skipEmptyLines: true,
      complete: (result) => {
        if (!result.data.length) {
          setError('CSV is empty')
          return
        }

        const rows = result.data as string[][]
        const columnCount = rows[0].length

        onParsed({
          rows: rows.slice(0, 10), // preview only
          columnCount,
        })
      },
      error: () => setError('Failed to parse CSV'),
    })
  }

  return (
    <div>
      <input
        type="file"
        accept=".csv"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />
      {error && <p className="text-red-500">{error}</p>}
    </div>
  )
}
