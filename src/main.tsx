
// Import WDYR first to ensure it's loaded before React
import './wdyr';

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
import { monitorPerformance } from './lib/performance';
import { patchDomOperations, cleanupOrphanedPortals } from './utils/dom-helpers';

// Initialize performance monitoring in development
if (process.env.NODE_ENV === 'development') {
  monitorPerformance();
  
  // Apply DOM operation patches
  patchDomOperations();
}

// Créer un script pour corriger les erreurs DOM
const initDomFixing = () => {
  // Rendre disponible globalement pour les corrections d'urgence
  (window as any).__fixDOMErrors = () => {
    patchDomOperations();
    cleanupOrphanedPortals();
  };
  
  // Cleanup périodique des portails
  setInterval(() => {
    cleanupOrphanedPortals();
  }, 10000);
};

// Initialiser les correctifs DOM
initDomFixing();

// Create a Query Client for React Query with enhanced configuration and error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
    },
    mutations: {
      // Configuration pour éviter les mutations simultanées
      // qui peuvent causer des erreurs DOM
      retry: 1,
      onSettled: () => {
        // Nettoyer les éléments de portail orphelins après chaque mutation
        setTimeout(() => {
          cleanupOrphanedPortals();
        }, 100);
      },
    },
  },
});

// Disable React's development mode double-invocation 
// of component effects and rendering for this build
// to avoid ref issues
const strictMode = false;

// Create stable React element tree with proper error boundaries
const root = ReactDOM.createRoot(document.getElementById('root')!);

const AppWithProviders = (
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
);

// Render without StrictMode to avoid double-rendering issues
// which can cause ref problems in development
root.render(strictMode ? <React.StrictMode>{AppWithProviders}</React.StrictMode> : AppWithProviders);
