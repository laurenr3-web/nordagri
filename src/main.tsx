
// Importer WDYR en premier pour s'assurer qu'il est chargé avant React
import './wdyr';

import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/providers/AuthProvider';
import { UserSettingsProvider } from '@/providers/UserSettingsProvider';
import ErrorBoundary from '@/components/ErrorBoundary';
import App from './App';
import './styles/index.css';
import { monitorPerformance } from './lib/performance';

// Initialize performance monitoring in development
if (process.env.NODE_ENV === 'development') {
  monitorPerformance();
}

// Create a Query Client for React Query with enhanced configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        // Ne pas réessayer en cas d'erreur d'authentification
        if (error?.status === 401 || error?.status === 403) return false;
        return failureCount < 2;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000 // 10 minutes (anciennement cacheTime)
    },
    mutations: {
      retry: 1
    }
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <UserSettingsProvider>
              <ThemeProvider defaultTheme="light" storageKey="farm-theme">
                <Suspense fallback={
                  <div className="flex items-center justify-center h-screen">
                    <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                }>
                  <App />
                </Suspense>
              </ThemeProvider>
            </UserSettingsProvider>
          </AuthProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);
