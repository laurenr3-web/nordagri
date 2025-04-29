
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from 'sonner';
import { OfflineProvider } from '@/providers/OfflineProvider';
import AppLayout from '@/components/layout/AppLayout';
import NotFound from '@/pages/NotFound';
import Dashboard from '@/pages/Dashboard';
import Equipment from '@/pages/Equipment';
import EquipmentDetail from '@/pages/EquipmentDetail';
import Parts from '@/pages/Parts';
import Settings from '@/pages/Settings';
import TimeTracking from '@/pages/TimeTracking';
import TimeTrackingStatistics from '@/pages/TimeTrackingStatistics';
import Auth from '@/pages/Auth';
import Interventions from '@/pages/Interventions';
import ScanRedirect from '@/pages/ScanRedirect';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="nordagri-theme">
      <OfflineProvider>
        <Router>
          <div className="min-h-screen bg-background flex flex-col">
            {/* Main content */}
            <Routes>
              <Route path="/login" element={<Auth />} />
              <Route path="/register" element={<Auth />} />
              
              <Route path="/" element={<Dashboard />} />
              <Route path="/equipment" element={<Equipment />} />
              <Route path="/equipment/:id" element={<EquipmentDetail />} />
              
              <Route path="/parts" element={<Parts />} />
              
              <Route path="/interventions" element={<Interventions />} />
              
              <Route path="/settings" element={<Settings />} />
              
              <Route path="/time-tracking" element={<TimeTracking />} />
              <Route path="/time-tracking/statistics" element={<TimeTrackingStatistics />} />
              
              <Route path="/scan/:id" element={<ScanRedirect />} />
              
              <Route path="*" element={<NotFound />} />
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
