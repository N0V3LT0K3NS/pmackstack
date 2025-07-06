import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ApiTest() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const testResults: any = {};

    // Test 1: Check environment variables
    testResults.envVars = {
      VITE_API_URL: import.meta.env.VITE_API_URL || 'NOT SET',
      MODE: import.meta.env.MODE,
      DEV: import.meta.env.DEV,
      PROD: import.meta.env.PROD,
    };

    // Test 2: Health check
    try {
      const healthResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/health`);
      testResults.healthCheck = {
        status: healthResponse.status,
        statusText: healthResponse.statusText,
        data: await healthResponse.text(),
      };
    } catch (error: any) {
      testResults.healthCheck = {
        error: error.message,
      };
    }

    // Test 3: Login test
    try {
      const loginResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: 'exec@kilwins.com',
          password: 'demo123',
        }),
      });
      
      const loginData = await loginResponse.json();
      testResults.loginTest = {
        status: loginResponse.status,
        success: loginData.success,
        hasToken: !!loginData.data?.token,
        user: loginData.data?.user,
      };
    } catch (error: any) {
      testResults.loginTest = {
        error: error.message,
      };
    }

    setResults(testResults);
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>API Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={runTests} disabled={loading}>
            {loading ? 'Running Tests...' : 'Run API Tests'}
          </Button>
          
          {Object.keys(results).length > 0 && (
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(results, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 