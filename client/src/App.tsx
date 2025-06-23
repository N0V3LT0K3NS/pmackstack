import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { Layout } from '@/components/layout/Layout';
import { Dashboard } from '@/pages/Dashboard';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="stores" element={<div>Stores Page</div>} />
            <Route path="analytics" element={<div>Analytics Page</div>} />
            <Route path="reports" element={<div>Reports Page</div>} />
            <Route path="labor" element={<div>Labor Page</div>} />
            <Route path="forecasts" element={<div>Forecasts Page</div>} />
            <Route path="schedule" element={<div>Schedule Page</div>} />
            <Route path="settings" element={<div>Settings Page</div>} />
          </Route>
        </Routes>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App
