
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Suspense } from 'react';
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
import EmergencyParts from '@/pages/EmergencyParts'; 
import Interventions from '@/pages/Interventions';
import Dashboard from '@/pages/Dashboard';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';
import Auth from '@/pages/Auth';

function App() {
  // The fix scripts loading code has been removed
  
  return (
    <RealtimeCacheProvider>
      <AuthProvider>
        <MobileMenu />
        <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
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
            {/* Single route for parts with both slash and no-slash paths */}
            <Route path="/parts/*" element={
              <ProtectedRoute>
                <Parts />
              </ProtectedRoute>
            } />
            <Route path="parts/*" element={
              <ProtectedRoute>
                <Parts />
              </ProtectedRoute>
            } />
            {/* Routes for emergency parts */}
            <Route path="/emergency-parts/*" element={
              <ProtectedRoute>
                <EmergencyParts />
              </ProtectedRoute>
            } />
            <Route path="emergency-parts/*" element={
              <ProtectedRoute>
                <EmergencyParts />
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <Toaster />
      </AuthProvider>
    </RealtimeCacheProvider>
  );
}

export default App;
