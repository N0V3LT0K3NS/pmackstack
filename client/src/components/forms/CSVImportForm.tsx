import React, { useState } from 'react';
import { dataEntryApi } from '../../lib/dataEntry';
import type { CSVImportResult } from '../../lib/dataEntry';
import Papa from 'papaparse';

interface CSVImportFormProps {
  onSuccess?: () => void;
}

const CSVImportForm: React.FC<CSVImportFormProps> = ({ onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<CSVImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setResult(null);

    // Parse CSV for preview
    Papa.parse(selectedFile, {
      header: true,
      preview: 5, // Show first 5 rows
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError('Error parsing CSV: ' + results.errors[0].message);
          return;
        }
        setPreviewData(results.data);
      },
      error: (error) => {
        setError('Error reading file: ' + error.message);
      }
    });
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setError(null);

    try {
      // Parse full CSV
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            if (results.errors.length > 0) {
              throw new Error('CSV parsing error: ' + results.errors[0].message);
            }

            const importResult = await dataEntryApi.importCSV(results.data);
            setResult(importResult.data);
            
            if (importResult.data.successful > 0 && onSuccess) {
              onSuccess();
            }
          } catch (err: any) {
            setError(err.message || 'Failed to import CSV data');
          } finally {
            setImporting(false);
          }
        },
        error: (error) => {
          setError('Error reading file: ' + error.message);
          setImporting(false);
        }
      });
    } catch (err: any) {
      setError(err.message || 'Failed to import CSV data');
      setImporting(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      await dataEntryApi.downloadCSVTemplate();
    } catch (err: any) {
      setError(err.message || 'Failed to download template');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 mb-2">CSV Import Instructions</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Download the template to see the required format</li>
          <li>• Include headers: storeCode, fiscalYear, weekNumber, totalSales, variableHours, numTransactions, averageWage</li>
          <li>• Store codes should match existing stores (anna, char, fell, vabe, will)</li>
          <li>• All numeric values should be positive</li>
        </ul>
      </div>

      <div className="space-y-4">
        <button
          onClick={downloadTemplate}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Download CSV Template
        </button>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select CSV File
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {previewData.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Preview (First 5 rows)</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(previewData[0]).map((header) => (
                      <th key={header} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewData.map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).map((value: any, cellIndex) => (
                        <td key={cellIndex} className="px-3 py-2 whitespace-nowrap text-gray-900">
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {file && (
          <button
            onClick={handleImport}
            disabled={importing}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
          >
            {importing ? 'Importing...' : 'Import Data'}
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {result && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-sm font-medium text-green-800 mb-2">Import Results</h3>
          <div className="text-sm text-green-700">
            <p>✅ Successfully imported: {result.successful} entries</p>
            {result.failed > 0 && (
              <>
                <p>❌ Failed to import: {result.failed} entries</p>
                {result.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium">Errors:</p>
                    <ul className="ml-4 space-y-1">
                      {result.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CSVImportForm;

 