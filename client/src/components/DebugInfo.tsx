import React from 'react';

export function DebugInfo() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const env = import.meta.env.VITE_ENV;
  
  return (
    <div className="fixed top-0 left-0 bg-red-500 text-white p-2 text-xs z-50 max-w-md">
      <div><strong>Debug Info:</strong></div>
      <div>VITE_API_URL: {apiUrl || 'NOT SET'}</div>
      <div>VITE_ENV: {env || 'NOT SET'}</div>
      <div>Mode: {import.meta.env.MODE}</div>
      <div>All env vars: {JSON.stringify(import.meta.env, null, 2)}</div>
    </div>
  );
} 