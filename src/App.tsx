
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

// Composant de chargement
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
  </div>
);

// Pages chargées de manière asynchrone
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Equipment = lazy(() => import('@/pages/Equipment'));
const EquipmentDetail = lazy(() => import('@/pages/EquipmentDetail'));
const Maintenance = lazy(() => import('@/pages/Maintenance'));
const Parts = lazy(() => import('@/pages/Parts'));
const Interventions = lazy(() => import('@/pages/Interventions'));
const Settings = lazy(() => import('@/pages/Settings'));
const TimeTracking = lazy(() => import('@/pages/TimeTracking'));
const TimeEntryDetail = lazy(() => import('@/pages/TimeEntryDetail'));
const TimeTrackingStatistics = lazy(() => import('@/pages/TimeTrackingStatistics'));
const Auth = lazy(() => import('@/pages/Auth'));
const AuthCallback = lazy(() => import('@/pages/Auth/Callback'));
const ScanRedirect = lazy(() => import('@/pages/ScanRedirect'));
const LegalPage = lazy(() => import('@/pages/Legal'));
const Pricing = lazy(() => import('@/pages/Pricing'));
const BentoDemo = lazy(() => import('@/pages/BentoDemo'));
const NotFound = lazy(() => import('@/pages/NotFound'));

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
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/auth/callback" element={<AuthCallback />} />
                      <Route path="/dashboard" element={
                        <ProtectedRoute>
                          <Dashboard />
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
