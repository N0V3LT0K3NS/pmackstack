import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from '@/components/layout/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { Login } from '@/pages/Login';
import { DataEntry } from '@/pages/DataEntry';
import { RenojaDashboard } from '@/pages/RenojaDashboard';
import RenojaDataEntry from '@/pages/RenojaDataEntry';

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
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="data-entry" element={<DataEntry />} />
              <Route path="renoja" element={<RenojaDashboard />} />
              <Route path="renoja/data-entry" element={<RenojaDataEntry />} />
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
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App
