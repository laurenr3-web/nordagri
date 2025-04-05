import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { RealtimeCacheProvider } from '@/providers/RealtimeCacheProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import MobileMenu from '@/components/layout/MobileMenu';

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
import ScanRedirect from '@/pages/ScanRedirect';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="agri-erp-theme">
      <QueryClientProvider client={queryClient}>
        <RealtimeCacheProvider>
          <Router>
            <AuthProvider>
              <Routes>
                {/* Redirection de / vers /dashboard pour une meilleure cohérence */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={
                  <ProtectedLayout>
                    <Dashboard />
                  </ProtectedLayout>
                } />
                <Route path="/equipment" element={
                  <ProtectedLayout>
                    <Equipment />
                  </ProtectedLayout>
                } />
                <Route path="/equipment/:id" element={
                  <ProtectedLayout>
                    <EquipmentDetail />
                  </ProtectedLayout>
                } />
                <Route path="/maintenance" element={
                  <ProtectedLayout>
                    <Maintenance />
                  </ProtectedLayout>
                } />
                <Route path="/parts" element={
                  <ProtectedLayout>
                    <Parts />
                  </ProtectedLayout>
                } />
                <Route path="/interventions" element={
                  <ProtectedLayout>
                    <Interventions />
                  </ProtectedLayout>
                } />
                <Route path="/settings" element={
                  <ProtectedLayout>
                    <Settings />
                  </ProtectedLayout>
                } />
                {/* Route pour le scan de QR code */}
                <Route path="/scan/:id" element={<ScanRedirect />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <MobileMenu />
              <Toaster />
            </AuthProvider>
          </Router>
        </RealtimeCacheProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
