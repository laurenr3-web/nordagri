
import { Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { RealtimeCacheProvider } from '@/providers/RealtimeCacheProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import MobileMenu from '@/components/layout/MobileMenu';
import { useEffect } from 'react';

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
  // Load the fix scripts
  useEffect(() => {
    const loadFixScripts = () => {
      const scripts = [
        '/button-fix.js',
        '/radix-fix.js',
        '/fix-accessibility.js'
      ];
      
      scripts.forEach(src => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        document.head.appendChild(script);
      });
      
      console.log('🛠️ Script de réparation en cours d\'exécution...');
    };
    
    loadFixScripts();
    
    return () => {
      console.log('✅ Réparation terminée! Les boutons devraient maintenant fonctionner.');
    };
  }, []);
  
  return (
    <RealtimeCacheProvider>
      <AuthProvider>
        <MobileMenu />
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
        <Toaster />
      </AuthProvider>
    </RealtimeCacheProvider>
  );
}

export default App;
