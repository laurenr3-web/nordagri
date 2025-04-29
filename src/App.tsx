import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from 'sonner';
import { OfflineProvider } from '@/providers/OfflineProvider';
import IndexPage from '@/components/index/IndexPage';
import EquipmentPage from '@/components/equipment/EquipmentPage';
import EquipmentDetailPage from '@/components/equipment/EquipmentDetailPage';
import PartsPage from '@/components/parts/PartsPage';
import PartDetailPage from '@/components/parts/PartDetailPage';
import InterventionsPage from '@/components/interventions/InterventionsPage';
import InterventionDetailPage from '@/components/interventions/InterventionDetailPage';
import MaintenancePage from '@/components/maintenance/MaintenancePage';
import MaintenanceDetailPage from '@/components/maintenance/MaintenanceDetailPage';
import TimeTrackingPage from '@/components/time-tracking/TimeTrackingPage';
import TimeTrackingDetailPage from '@/components/time-tracking/TimeTrackingDetailPage';
import TeamPage from '@/components/team/TeamPage';
import SettingsPage from '@/components/settings/SettingsPage';
import NotFoundPage from '@/components/NotFoundPage';
import AppLayout from '@/components/layout/AppLayout';
import LoginPage from '@/components/auth/LoginPage';
import RegisterPage from '@/components/auth/RegisterPage';
import { AuthProvider } from '@/providers/AuthProvider';
import { RequireAuth } from '@/components/auth/RequireAuth';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="nordagri-theme">
      <OfflineProvider>
        <Router>
          <div className="min-h-screen bg-background flex flex-col">
            {/* Main content */}
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              <Route path="/" element={<RequireAuth><AppLayout><IndexPage /></AppLayout></RequireAuth>} />
              <Route path="/equipment" element={<RequireAuth><AppLayout><EquipmentPage /></AppLayout></RequireAuth>} />
              <Route path="/equipment/:id" element={<RequireAuth><AppLayout><EquipmentDetailPage /></AppLayout></RequireAuth>} />
              
              <Route path="/parts" element={<RequireAuth><AppLayout><PartsPage /></AppLayout></RequireAuth>} />
              <Route path="/parts/:id" element={<RequireAuth><AppLayout><PartDetailPage /></AppLayout></RequireAuth>} />
              
              <Route path="/interventions" element={<RequireAuth><AppLayout><InterventionsPage /></AppLayout></RequireAuth>} />
              <Route path="/interventions/:id" element={<RequireAuth><AppLayout><InterventionDetailPage /></AppLayout></RequireAuth>} />
              
              <Route path="/maintenance" element={<RequireAuth><AppLayout><MaintenancePage /></AppLayout></RequireAuth>} />
              <Route path="/maintenance/:id" element={<RequireAuth><AppLayout><MaintenanceDetailPage /></AppLayout></RequireAuth>} />
              
              <Route path="/time-tracking" element={<RequireAuth><AppLayout><TimeTrackingPage /></AppLayout></RequireAuth>} />
              <Route path="/time-tracking/detail/:id" element={<RequireAuth><AppLayout><TimeTrackingDetailPage /></AppLayout></RequireAuth>} />
              
              <Route path="/team" element={<RequireAuth><AppLayout><TeamPage /></AppLayout></RequireAuth>} />
              <Route path="/settings" element={<RequireAuth><AppLayout><SettingsPage /></AppLayout></RequireAuth>} />
              
              <Route path="*" element={<AppLayout><NotFoundPage /></AppLayout>} />
            </Routes>
            
            {/* Toaster for notifications */}
            <Toaster position="top-right" expand={false} richColors />
          </div>
        </Router>
      </OfflineProvider>
    </ThemeProvider>
  );
}

export default App;
