
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/providers/AuthProvider';
import { UserSettingsProvider } from '@/providers/UserSettingsProvider';
import ErrorBoundary from '@/components/ErrorBoundary';
import App from './App';
import './styles/index.css';

// Create a Query Client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
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
