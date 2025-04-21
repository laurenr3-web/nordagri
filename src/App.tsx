
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Import existing pages rather than missing ones
import Dashboard from './pages/Dashboard';
import Equipment from './pages/Equipment';
import EquipmentDetail from './pages/EquipmentDetail';
import Maintenance from './pages/Maintenance';
import Parts from './pages/Parts';
import Settings from './pages/Settings';
import Auth from './pages/Auth';
import NotFound from './pages/NotFound';
import TimeTracking from './pages/TimeTracking';

// Use existing providers and components
import { AuthProvider } from './providers/AuthProvider';
import { RealtimeCacheProvider } from './providers/RealtimeCacheProvider';
import useDataInitialization from './hooks/useDataInitialization';

// Create a new QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

function App() {
  // Initialize data and migrations
  const { isLoading: isDataInitializing, error: dataInitError } = useDataInitialization();

  // You might want to show a loading state while migrations are being applied
  if (isDataInitializing) {
    return <div className="p-8 text-center">Initializing application...</div>;
  }

  if (dataInitError) {
    return <div className="p-8 text-center text-red-500">Error initializing application: {dataInitError.message}</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RealtimeCacheProvider>
        <AuthProvider>
          <Router>
            <Toaster position="top-center" richColors closeButton />
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/equipment" element={<Equipment />} />
              <Route path="/equipment/:id" element={<EquipmentDetail />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/parts" element={<Parts />} />
              <Route path="/time-tracking" element={<TimeTracking />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </AuthProvider>
      </RealtimeCacheProvider>
    </QueryClientProvider>
  );
}

export default App;
