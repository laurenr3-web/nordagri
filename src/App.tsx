import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { RealtimeCacheProvider } from '@/providers/RealtimeCacheProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
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
import TimeTracking from '@/pages/TimeTracking';

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
                {/* Redirect root to auth if not authenticated */}
                <Route path="/" element={<Navigate to="/auth" replace />} />
                <Route path="/auth" element={<Auth />} />
                
                {/* Protected routes */}
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
