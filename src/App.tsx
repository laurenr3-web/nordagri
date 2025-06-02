
import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { RealtimeCacheProvider } from '@/providers/RealtimeCacheProvider';
import { SimpleAuthProvider } from '@/providers/SimpleAuthProvider';
import { OfflineProvider } from '@/providers/OfflineProvider';
import { SimpleProtectedRoute } from '@/components/auth/SimpleProtectedRoute';
import MobileMenu from '@/components/layout/MobileMenu';
import Footer from "@/components/layout/Footer";

// Composant de chargement
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
  </div>
);

// Error boundary pour les imports qui échouent
const ErrorFallback = ({ error }: { error?: Error }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <h2 className="text-xl font-semibold mb-2">Erreur de chargement</h2>
      <p className="text-muted-foreground mb-4">
        Une erreur s'est produite lors du chargement de la page.
      </p>
      <button 
        onClick={() => window.location.reload()} 
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
      >
        Recharger la page
      </button>
    </div>
  </div>
);

// Pages chargées de manière asynchrone avec gestion d'erreur
const Home = lazy(() => 
  import('@/pages/Home').catch(() => ({ 
    default: () => <ErrorFallback /> 
  }))
);

const Dashboard = lazy(() => 
  import('@/pages/Dashboard').catch(() => ({ 
    default: () => <ErrorFallback /> 
  }))
);

const Equipment = lazy(() => 
  import('@/pages/Equipment').catch(() => ({ 
    default: () => <ErrorFallback /> 
  }))
);

const EquipmentDetail = lazy(() => 
  import('@/pages/EquipmentDetail').catch(() => ({ 
    default: () => <ErrorFallback /> 
  }))
);

const Maintenance = lazy(() => 
  import('@/pages/Maintenance').catch(() => ({ 
    default: () => <ErrorFallback /> 
  }))
);

const Parts = lazy(() => 
  import('@/pages/Parts').catch(() => ({ 
    default: () => <ErrorFallback /> 
  }))
);

const Interventions = lazy(() => 
  import('@/pages/Interventions').catch(() => ({ 
    default: () => <ErrorFallback /> 
  }))
);

const Settings = lazy(() => 
  import('@/pages/Settings').catch(() => ({ 
    default: () => <ErrorFallback /> 
  }))
);

const TimeTracking = lazy(() => 
  import('@/pages/TimeTracking').catch(() => ({ 
    default: () => <ErrorFallback /> 
  }))
);

const TimeEntryDetail = lazy(() => 
  import('@/pages/TimeEntryDetail').catch(() => ({ 
    default: () => <ErrorFallback /> 
  }))
);

const TimeTrackingStatistics = lazy(() => 
  import('@/pages/TimeTrackingStatistics').catch(() => ({ 
    default: () => <ErrorFallback /> 
  }))
);

const Auth = lazy(() => 
  import('@/pages/Auth').catch(() => ({ 
    default: () => <ErrorFallback /> 
  }))
);

const AuthCallback = lazy(() => 
  import('@/pages/Auth/Callback').catch(() => ({ 
    default: () => <ErrorFallback /> 
  }))
);

const ScanRedirect = lazy(() => 
  import('@/pages/ScanRedirect').catch(() => ({ 
    default: () => <ErrorFallback /> 
  }))
);

const LegalPage = lazy(() => 
  import('@/pages/Legal').catch(() => ({ 
    default: () => <ErrorFallback /> 
  }))
);

const Pricing = lazy(() => 
  import('@/pages/Pricing').catch(() => ({ 
    default: () => <ErrorFallback /> 
  }))
);

const BentoDemo = lazy(() => 
  import('@/pages/BentoDemo').catch(() => ({ 
    default: () => <ErrorFallback /> 
  }))
);

const NotFound = lazy(() => 
  import('@/pages/NotFound').catch(() => ({ 
    default: () => <ErrorFallback /> 
  }))
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (anciennement cacheTime)
    },
  },
});

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="agri-erp-theme">
      <QueryClientProvider client={queryClient}>
        <RealtimeCacheProvider>
          <SimpleAuthProvider>
            <Router>
              <OfflineProvider autoSyncInterval={60000} showOfflineIndicator={true}>
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route path="/dashboard" element={
                      <SimpleProtectedRoute>
                        <Dashboard />
                      </SimpleProtectedRoute>
                    } />
                    <Route path="/equipment" element={
                      <SimpleProtectedRoute>
                        <Equipment />
                      </SimpleProtectedRoute>
                    } />
                    <Route path="/equipment/:id" element={
                      <SimpleProtectedRoute>
                        <EquipmentDetail />
                      </SimpleProtectedRoute>
                    } />
                    <Route path="/maintenance" element={
                      <SimpleProtectedRoute>
                        <Maintenance />
                      </SimpleProtectedRoute>
                    } />
                    <Route path="/parts" element={
                      <SimpleProtectedRoute>
                        <Parts />
                      </SimpleProtectedRoute>
                    } />
                    <Route path="/interventions" element={
                      <SimpleProtectedRoute>
                        <Interventions />
                      </SimpleProtectedRoute>
                    } />
                    <Route path="/settings" element={
                      <SimpleProtectedRoute>
                        <Settings />
                      </SimpleProtectedRoute>
                    } />
                    <Route path="/time-tracking" element={
                      <SimpleProtectedRoute>
                        <TimeTracking />
                      </SimpleProtectedRoute>
                    } />
                    <Route path="/time-tracking/detail/:id" element={
                      <SimpleProtectedRoute>
                        <TimeEntryDetail />
                      </SimpleProtectedRoute>
                    } />
                    <Route path="/time-tracking/statistics" element={
                      <SimpleProtectedRoute>
                        <TimeTrackingStatistics />
                      </SimpleProtectedRoute>
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
            </Router>
          </SimpleAuthProvider>
        </RealtimeCacheProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
