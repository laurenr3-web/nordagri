
import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { RealtimeCacheProvider } from '@/providers/RealtimeCacheProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { OfflineProvider } from '@/providers/OfflineProvider';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import MobileMenu from '@/components/layout/MobileMenu';
import '@/i18n'; // i18n setup
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";
import Footer from "@/components/layout/Footer";
import { withPreviewToken } from '@/utils/previewRouting';
import Dashboard from '@/pages/Dashboard';
import Auth from '@/pages/Auth';
import Equipment from '@/pages/Equipment';
import Maintenance from '@/pages/Maintenance';
import Parts from '@/pages/Parts';
import Interventions from '@/pages/Interventions';
import TimeTracking from '@/pages/TimeTracking';
import Planning from '@/pages/Planning';

// Composant de chargement
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

import EquipmentDetail from '@/pages/EquipmentDetail';
import Settings from '@/pages/Settings';
import TimeEntryDetail from '@/pages/TimeEntryDetail';
import TimeTrackingStatistics from '@/pages/TimeTrackingStatistics';

// Pages principales chargées eagerly pour éviter les délais

// Pages secondaires chargées de manière asynchrone
const AuthCallback = lazy(() => import('@/pages/Auth/Callback'));
const ScanRedirect = lazy(() => import('@/pages/ScanRedirect'));
const LegalPage = lazy(() => import('@/pages/Legal'));
const Pricing = lazy(() => import('@/pages/Pricing'));
const BentoDemo = lazy(() => import('@/pages/BentoDemo'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const AcceptInvitation = lazy(() => import('@/pages/AcceptInvitation'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (anciennement cacheTime)
    },
  },
});

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider defaultTheme="light" storageKey="agri-erp-theme">
        <QueryClientProvider client={queryClient}>
          <RealtimeCacheProvider>
            <Router>
              <AuthProvider>
                <OfflineProvider autoSyncInterval={60000} showOfflineIndicator={true}>
                  <Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                      <Route path="/" element={<Navigate to={withPreviewToken('/dashboard')} replace />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/accept-invitation" element={<AcceptInvitation />} />
                      <Route path="/auth/callback" element={<AuthCallback />} />
                      <Route path="/dashboard" element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      } />
                      <Route path="/planning" element={
                        <ProtectedRoute>
                          <Planning />
                        </ProtectedRoute>
                      } />
                      <Route path="/equipment" element={
                        <ProtectedRoute>
                          <Equipment />
                        </ProtectedRoute>
                      } />
                      <Route path="/equipment/:id" element={
                        <ProtectedRoute>
                          <EquipmentDetail />
                        </ProtectedRoute>
                      } />
                      <Route path="/maintenance" element={
                        <ProtectedRoute>
                          <Maintenance />
                        </ProtectedRoute>
                      } />
                      <Route path="/parts" element={
                        <ProtectedRoute>
                          <Parts />
                        </ProtectedRoute>
                      } />
                      <Route path="/interventions" element={
                        <ProtectedRoute>
                          <Interventions />
                        </ProtectedRoute>
                      } />
                      <Route path="/settings" element={
                        <ProtectedRoute>
                          <Settings />
                        </ProtectedRoute>
                      } />
                      <Route path="/time-tracking" element={
                        <ProtectedRoute>
                          <TimeTracking />
                        </ProtectedRoute>
                      } />
                      <Route path="/time-tracking/detail/:id" element={
                        <ProtectedRoute>
                          <TimeEntryDetail />
                        </ProtectedRoute>
                      } />
                      <Route path="/time-tracking/statistics" element={
                        <ProtectedRoute>
                          <TimeTrackingStatistics />
                        </ProtectedRoute>
                      } />
                      <Route path="/scan/:id" element={<ScanRedirect />} />
                      <Route path="/bento-demo" element={<BentoDemo />} />
                      <Route path="/legal" element={<LegalPage />} />
                      <Route path="/pricing" element={<Pricing />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                  <MobileMenu />
                  <Toaster />
                  <Footer />
                </OfflineProvider>
              </AuthProvider>
            </Router>
          </RealtimeCacheProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
}

export default App;
