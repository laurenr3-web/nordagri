
import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { RealtimeCacheProvider } from '@/providers/RealtimeCacheProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { OfflineProvider } from '@/providers/OfflineProvider';
import { DemoDataProvider } from '@/components/ui/auth/components/DemoDataProvider';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import MobileMenu from '@/components/layout/MobileMenu';
import Footer from "@/components/layout/Footer";
import { DomainDiagnostic } from '@/components/diagnostic/DomainDiagnostic';
import { productionConfig } from '@/config/productionConfig';

// Composant de chargement amélioré
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    <div className="ml-4 text-lg">Chargement d'OptiTractor...</div>
  </div>
);

// Error boundary amélioré pour nordagri.ca
const ErrorFallback = ({ error }: { error?: Error }) => (
  <div className="flex items-center justify-center min-h-screen p-4">
    <div className="text-center max-w-md">
      <h2 className="text-xl font-semibold mb-2">Erreur de chargement</h2>
      <p className="text-muted-foreground mb-4">
        Une erreur s'est produite lors du chargement de la page.
      </p>
      {productionConfig.currentDomain === 'nordagri.ca' && (
        <div className="mb-4">
          <DomainDiagnostic />
        </div>
      )}
      <button 
        onClick={() => window.location.reload()} 
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
      >
        Recharger la page
      </button>
      {error && (
        <details className="mt-4 text-xs text-left">
          <summary>Détails de l'erreur</summary>
          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
            {error.message}
          </pre>
        </details>
      )}
    </div>
  </div>
);

// Pages chargées de manière asynchrone avec gestion d'erreur améliorée
const Dashboard = lazy(() => 
  import('@/pages/Dashboard').catch((err) => {
    console.error('Erreur chargement Dashboard:', err);
    return { default: () => <ErrorFallback error={err} /> };
  })
);

const Equipment = lazy(() => 
  import('@/pages/Equipment').catch((err) => {
    console.error('Erreur chargement Equipment:', err);
    return { default: () => <ErrorFallback error={err} /> };
  })
);

const EquipmentDetail = lazy(() => 
  import('@/pages/EquipmentDetail').catch((err) => {
    console.error('Erreur chargement EquipmentDetail:', err);
    return { default: () => <ErrorFallback error={err} /> };
  })
);

const Maintenance = lazy(() => 
  import('@/pages/Maintenance').catch((err) => {
    console.error('Erreur chargement Maintenance:', err);
    return { default: () => <ErrorFallback error={err} /> };
  })
);

const Parts = lazy(() => 
  import('@/pages/Parts').catch((err) => {
    console.error('Erreur chargement Parts:', err);
    return { default: () => <ErrorFallback error={err} /> };
  })
);

const Interventions = lazy(() => 
  import('@/pages/Interventions').catch((err) => {
    console.error('Erreur chargement Interventions:', err);
    return { default: () => <ErrorFallback error={err} /> };
  })
);

const Settings = lazy(() => 
  import('@/pages/Settings').catch((err) => {
    console.error('Erreur chargement Settings:', err);
    return { default: () => <ErrorFallback error={err} /> };
  })
);

const TimeTracking = lazy(() => 
  import('@/pages/TimeTracking').catch((err) => {
    console.error('Erreur chargement TimeTracking:', err);
    return { default: () => <ErrorFallback error={err} /> };
  })
);

const TimeEntryDetail = lazy(() => 
  import('@/pages/TimeEntryDetail').catch((err) => {
    console.error('Erreur chargement TimeEntryDetail:', err);
    return { default: () => <ErrorFallback error={err} /> };
  })
);

const TimeTrackingStatistics = lazy(() => 
  import('@/pages/TimeTrackingStatistics').catch((err) => {
    console.error('Erreur chargement TimeTrackingStatistics:', err);
    return { default: () => <ErrorFallback error={err} /> };
  })
);

const Auth = lazy(() => 
  import('@/pages/Auth').catch((err) => {
    console.error('Erreur chargement Auth:', err);
    return { default: () => <ErrorFallback error={err} /> };
  })
);

const AuthCallback = lazy(() => 
  import('@/pages/Auth/Callback').catch((err) => {
    console.error('Erreur chargement AuthCallback:', err);
    return { default: () => <ErrorFallback error={err} /> };
  })
);

const ScanRedirect = lazy(() => 
  import('@/pages/ScanRedirect').catch((err) => {
    console.error('Erreur chargement ScanRedirect:', err);
    return { default: () => <ErrorFallback error={err} /> };
  })
);

const LegalPage = lazy(() => 
  import('@/pages/Legal').catch((err) => {
    console.error('Erreur chargement Legal:', err);
    return { default: () => <ErrorFallback error={err} /> };
  })
);

const Pricing = lazy(() => 
  import('@/pages/Pricing').catch((err) => {
    console.error('Erreur chargement Pricing:', err);
    return { default: () => <ErrorFallback error={err} /> };
  })
);

const BentoDemo = lazy(() => 
  import('@/pages/BentoDemo').catch((err) => {
    console.error('Erreur chargement BentoDemo:', err);
    return { default: () => <ErrorFallback error={err} /> };
  })
);

const NotFound = lazy(() => 
  import('@/pages/NotFound').catch((err) => {
    console.error('Erreur chargement NotFound:', err);
    return { default: () => <ErrorFallback error={err} /> };
  })
);

// Configuration Query Client optimisée pour nordagri.ca
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: productionConfig.currentDomain === 'nordagri.ca' ? 1000 * 60 * 10 : 1000 * 60 * 5, // 10 minutes pour nordagri.ca
      gcTime: productionConfig.currentDomain === 'nordagri.ca' ? 1000 * 60 * 30 : 1000 * 60 * 10, // 30 minutes pour nordagri.ca
      retry: productionConfig.retryAttempts,
      retryDelay: productionConfig.authRetryDelay,
    },
  },
});

// Log de diagnostic pour nordagri.ca
if (productionConfig.currentDomain === 'nordagri.ca') {
  console.log('🚀 OptiTractor démarrage sur nordagri.ca:', {
    timestamp: new Date().toISOString(),
    config: productionConfig,
    userAgent: navigator.userAgent
  });
}

function App() {
  try {
    return (
      <ThemeProvider defaultTheme="light" storageKey="agri-erp-theme">
        <QueryClientProvider client={queryClient}>
          <RealtimeCacheProvider>
            <Router>
              <AuthProvider>
                <DemoDataProvider>
                  <OfflineProvider autoSyncInterval={60000} showOfflineIndicator={true}>
                    <Suspense fallback={<LoadingSpinner />}>
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
                        <Route path="/legal" element={<LegalPage />} />
                        <Route path="/pricing" element={<Pricing />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                    <MobileMenu />
                    <Toaster />
                    <Footer />
                  </OfflineProvider>
                </DemoDataProvider>
              </AuthProvider>
            </Router>
          </RealtimeCacheProvider>
        </QueryClientProvider>
      </ThemeProvider>
    );
  } catch (error) {
    console.error('❌ Erreur critique dans App.tsx:', error);
    return <ErrorFallback error={error instanceof Error ? error : new Error('Erreur inconnue')} />;
  }
}

export default App;
