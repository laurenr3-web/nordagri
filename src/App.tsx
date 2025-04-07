
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { RealtimeCacheProvider } from '@/providers/RealtimeCacheProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { LayoutProvider } from '@/ui/layouts/MainLayoutContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import MainLayout from '@/ui/layouts/MainLayout';

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
              <LayoutProvider>
                <SidebarProvider>
                  <Routes>
                    <Route element={<MainLayout />}>
                      <Route path="/" element={<Index />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/equipment" element={<Equipment />} />
                      <Route path="/equipment/:id" element={<EquipmentDetail />} />
                      <Route path="/maintenance" element={<Maintenance />} />
                      <Route path="/parts" element={<Parts />} />
                      <Route path="/interventions" element={<Interventions />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/search" element={<div>Search Page</div>} />
                      {/* Route for QR code scanning */}
                      <Route path="/scan/:id" element={<ScanRedirect />} />
                      <Route path="*" element={<NotFound />} />
                    </Route>
                  </Routes>
                  
                  <Toaster />
                </SidebarProvider>
              </LayoutProvider>
            </AuthProvider>
          </Router>
        </RealtimeCacheProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
