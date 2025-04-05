
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { RealtimeCacheProvider } from '@/providers/RealtimeCacheProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import MobileMenu from '@/components/layout/MobileMenu';
import AppRoutes from '@/core/routes';

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
                <Route path={AppRoutes.HOME} element={<Index />} />
                <Route path={AppRoutes.AUTH} element={<Auth />} />
                <Route path={AppRoutes.DASHBOARD} element={
                  <ProtectedLayout>
                    <Dashboard />
                  </ProtectedLayout>
                } />
                <Route path={AppRoutes.EQUIPMENT} element={
                  <ProtectedLayout>
                    <Equipment />
                  </ProtectedLayout>
                } />
                <Route path={AppRoutes.EQUIPMENT_DETAIL()} element={
                  <ProtectedLayout>
                    <EquipmentDetail />
                  </ProtectedLayout>
                } />
                <Route path={AppRoutes.MAINTENANCE} element={
                  <ProtectedLayout>
                    <Maintenance />
                  </ProtectedLayout>
                } />
                <Route path={AppRoutes.PARTS} element={
                  <ProtectedLayout>
                    <Parts />
                  </ProtectedLayout>
                } />
                <Route path={AppRoutes.INTERVENTIONS} element={
                  <ProtectedLayout>
                    <Interventions />
                  </ProtectedLayout>
                } />
                <Route path={AppRoutes.SETTINGS} element={
                  <ProtectedLayout>
                    <Settings />
                  </ProtectedLayout>
                } />
                {/* Route pour le scan de QR code */}
                <Route path={AppRoutes.QR_SCAN} element={<ScanRedirect />} />
                {/* Route pour les pages non trouvées */}
                <Route path={AppRoutes.NOT_FOUND} element={<NotFound />} />
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
