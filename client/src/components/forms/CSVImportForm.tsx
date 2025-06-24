import React, { useState, useRef } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { dataEntryApi } from '../../lib/dataEntry';
import type { CSVImportResult } from '../../lib/dataEntry';
import Papa from 'papaparse';

interface CSVImportFormProps {
  onSuccess?: (result: CSVImportResult) => void;
  onError?: (error: string) => void;
}

export const CSVImportForm: React.FC<CSVImportFormProps> = ({ onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setLoading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          onError?.(`CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`);
          setLoading(false);
          return;
        }

        setCsvData(results.data);
        setPreviewData(results.data.slice(0, 5)); // Show first 5 rows for preview
        setLoading(false);
      },
      error: (error) => {
        onError?.(`Failed to parse CSV: ${error.message}`);
        setLoading(false);
      }
    });
  };

  const handleImport = async () => {
    if (csvData.length === 0) {
      onError?.('No data to import');
      return;
    }

    setLoading(true);
    try {
      const result = await dataEntryApi.importCSV(csvData);
      onSuccess?.(result.data);
      
      // Reset form
      setCsvData([]);
      setPreviewData([]);
      setFileName('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to import CSV';
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await dataEntryApi.downloadCSVTemplate();
    } catch (error) {
      onError?.('Failed to download template');
    }
  };

  const clearFile = () => {
    setCsvData([]);
    setPreviewData([]);
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">CSV Data Import</h2>
      
      <div className="space-y-4">
        {/* Template Download */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Need a template?</h3>
          <p className="text-sm text-blue-700 mb-3">
            Download our CSV template to ensure your data is in the correct format.
          </p>
          <Button 
            variant="outline" 
            onClick={handleDownloadTemplate}
            className="text-blue-700 border-blue-300 hover:bg-blue-100"
          >
            Download CSV Template
          </Button>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload CSV File
          </label>
          <div className="flex items-center space-x-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            {fileName && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearFile}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Clear
              </Button>
            )}
          </div>
          {fileName && (
            <p className="text-sm text-gray-600 mt-1">
              Selected: {fileName} ({csvData.length} rows)
            </p>
          )}
        </div>

        {/* Preview */}
        {previewData.length > 0 && (
          <div>
            <h3 className="font-medium text-gray-900 mb-2">
              Data Preview (first 5 rows)
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(previewData[0]).map(header => (
                      <th 
                        key={header}
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewData.map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).map((value: any, cellIndex) => (
                        <td 
                          key={cellIndex}
                          className="px-3 py-2 whitespace-nowrap text-gray-900"
                        >
                          {String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Import Button */}
        <div className="flex justify-end space-x-3">
          <Button
            onClick={handleImport}
            disabled={loading || csvData.length === 0}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {loading ? 'Importing...' : `Import ${csvData.length} Records`}
          </Button>
        </div>

        {/* Expected Format Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Expected CSV Format:</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Required columns:</strong> storeCode, fiscalYear, weekNumber, totalSales, variableHours, numTransactions, averageWage</p>
            <p><strong>Optional columns:</strong> notes</p>
            <p><strong>Example:</strong> storeCode=anna, fiscalYear=2025, weekNumber=1, totalSales=15000.00, variableHours=120.5, numTransactions=350, averageWage=15.50</p>
          </div>
        </div>
      </div>
    </Card>
  );
}; 