
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/providers/AuthProvider';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Toaster as SonnerToaster } from 'sonner';
import { SupabaseErrorHandler } from '@/components/ui/supabase-error-handler';

// Layouts
import MainLayout from '@/ui/layouts/MainLayout';
import AuthLayout from '@/ui/layouts/AuthLayout';

// Pages
import Dashboard from '@/pages/Dashboard';
import Equipment from '@/pages/Equipment';
import EquipmentDetail from '@/pages/EquipmentDetail';
import Parts from '@/pages/Parts';
import Maintenance from '@/pages/Maintenance';
import Interventions from '@/pages/Interventions';
import InterventionDetail from '@/pages/InterventionDetail';
import Settings from '@/pages/Settings';
import Auth from '@/pages/Auth';
import NotFound from '@/pages/NotFound';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  // Log app version on startup
  useEffect(() => {
    console.log('App version:', import.meta.env.VITE_APP_VERSION || 'development');
  }, []);

  return (
    <SupabaseErrorHandler>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ThemeProvider defaultTheme="system" storageKey="nordagri-theme">
              <Toaster />
              <SonnerToaster position="top-right" closeButton richColors />
              <Routes>
                {/* Auth routes */}
                <Route path="/auth" element={<AuthLayout />}>
                  <Route index element={<Auth />} />
                </Route>
                
                {/* Protected routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Dashboard />} />
                  <Route path="equipment" element={<Equipment />} />
                  <Route path="equipment/:id" element={<EquipmentDetail />} />
                  <Route path="parts" element={<Parts />} />
                  <Route path="maintenance" element={<Maintenance />} />
                  <Route path="interventions" element={<Interventions />} />
                  <Route path="interventions/:id" element={<InterventionDetail />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
                
                {/* 404 route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ThemeProvider>
          </AuthProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </SupabaseErrorHandler>
  );
}

export default App;
