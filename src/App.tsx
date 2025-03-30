import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { RealtimeCacheProvider } from '@/providers/RealtimeCacheProvider';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import ErrorBoundary from '@/components/ErrorBoundary';
import MobileMenu from '@/components/layout/MobileMenu';
import { Loading } from '@/components/ui/loading';

// Regular import for the Index page to keep initial load fast
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';

// Lazy load other pages
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Equipment = lazy(() => import('@/pages/Equipment'));
const EquipmentDetail = lazy(() => import('@/pages/EquipmentDetail'));
const Maintenance = lazy(() => import('@/pages/Maintenance'));
const Parts = lazy(() => import('@/pages/Parts'));
const EmergencyParts = lazy(() => import('@/pages/EmergencyParts'));
const Interventions = lazy(() => import('@/pages/Interventions'));
const Settings = lazy(() => import('@/pages/Settings'));
const NotFound = lazy(() => import('@/pages/NotFound'));

function App() {
  // Always initialize hooks at the top level
  const appReady = true; // This ensures hooks are always called in the same order

  return (
    <RealtimeCacheProvider>
      <ErrorBoundary 
        fallback={
          <div className="flex items-center justify-center h-screen bg-background">
            <div className="w-full max-w-md mx-auto p-6 bg-card rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-4 text-destructive">Application Error</h2>
              <p className="mb-4">An unexpected error occurred in the application.</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded"
              >
                Reload Application
              </button>
            </div>
          </div>
        }
      >
        <MobileMenu />
        <Suspense fallback={<Loading text="Chargement de l'application..." />}>
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
      </ErrorBoundary>
    </RealtimeCacheProvider>
  );
}

export default App;
