
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { RealtimeCacheProvider } from '@/providers/RealtimeCacheProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import MobileMenu from '@/components/layout/MobileMenu';
import '@/i18n'; // i18n setup
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";

// Pages
import Index from '@/pages/Index';
import Equipment from '@/pages/Equipment';
import EquipmentDetail from '@/pages/EquipmentDetail';
import Maintenance from '@/pages/Maintenance';
import Parts from '@/pages/Parts';
import Interventions from '@/pages/Interventions';
import Dashboard from '@/pages/Dashboard';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';
import Auth from '@/pages/Auth';
import AuthCallback from '@/pages/Auth/Callback'; // Import de la nouvelle page de callback
import ScanRedirect from '@/pages/ScanRedirect';
import TimeTracking from '@/pages/TimeTracking';
import TimeEntryDetail from '@/pages/TimeEntryDetail';
import TimeTrackingStatistics from '@/pages/TimeTrackingStatistics';
import Footer from "@/components/layout/Footer";
import LegalPage from "@/pages/Legal";
import Pricing from "@/pages/Pricing";
import BentoDemo from '@/pages/BentoDemo';

const queryClient = new QueryClient();

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider defaultTheme="light" storageKey="agri-erp-theme">
        <QueryClientProvider client={queryClient}>
          <RealtimeCacheProvider>
            <Router>
              <AuthProvider>
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
                  <Route path="*" element={<NotFound />} />
                  <Route path="/legal" element={<LegalPage />} />
                  <Route path="/pricing" element={<Pricing />} />
                </Routes>
                <MobileMenu />
                <Toaster />
                <Footer />
              </AuthProvider>
            </Router>
          </RealtimeCacheProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
}

export default App;
