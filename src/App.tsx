
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { RealtimeCacheProvider } from '@/providers/RealtimeCacheProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { LayoutProvider } from '@/ui/layouts/MainLayoutContext';
import MainLayout from '@/ui/layouts/MainLayout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

import './App.css';

// Créer un client Query
const queryClient = new QueryClient();

// Lazy loading des pages
const Index = lazy(() => import('@/pages/Index'));
const Equipment = lazy(() => import('@/pages/Equipment'));
const EquipmentDetail = lazy(() => import('@/pages/EquipmentDetail'));
const Maintenance = lazy(() => import('@/pages/Maintenance'));
const Parts = lazy(() => import('@/pages/Parts'));
const Interventions = lazy(() => import('@/pages/Interventions'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Settings = lazy(() => import('@/pages/Settings'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const Auth = lazy(() => import('@/pages/Auth'));
const ScanRedirect = lazy(() => import('@/pages/ScanRedirect'));
const Search = lazy(() => import('@/pages/Search'));
const Profile = lazy(() => import('@/pages/Profile'));
const Home = lazy(() => import('@/pages/Home'));

// Préchargement des pages fréquemment visitées
const preloadHomePage = () => import('@/pages/Home');
const preloadEquipmentPage = () => import('@/pages/Equipment');
const preloadDashboardPage = () => import('@/pages/Dashboard');

// Composant de préchargement pour les liens fréquemment utilisés
const PreloadLink = ({ children }) => {
  React.useEffect(() => {
    // Préchargement après le rendu initial
    const timer = setTimeout(() => {
      preloadHomePage();
      preloadEquipmentPage();
      preloadDashboardPage();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="agri-erp-theme">
      <QueryClientProvider client={queryClient}>
        <RealtimeCacheProvider>
          <Router>
            <AuthProvider>
              <PreloadLink>
                <LayoutProvider>
                  <Routes>
                    <Route element={<MainLayout />}>
                      <Route path="/" element={
                        <Suspense fallback={<LoadingSpinner message="Chargement de la page d'accueil..." />}>
                          <Index />
                        </Suspense>
                      } />
                      <Route path="/home" element={
                        <Suspense fallback={<LoadingSpinner message="Chargement de la page d'accueil..." />}>
                          <Home />
                        </Suspense>
                      } />
                      <Route path="/auth" element={
                        <Suspense fallback={<LoadingSpinner message="Préparation de l'authentification..." />}>
                          <Auth />
                        </Suspense>
                      } />
                      <Route path="/dashboard" element={
                        <Suspense fallback={<LoadingSpinner message="Chargement du tableau de bord..." />}>
                          <Dashboard />
                        </Suspense>
                      } />
                      <Route path="/equipment" element={
                        <Suspense fallback={<LoadingSpinner message="Chargement des équipements..." />}>
                          <Equipment />
                        </Suspense>
                      } />
                      <Route path="/equipment/:id" element={
                        <Suspense fallback={<LoadingSpinner message="Chargement des détails..." />}>
                          <EquipmentDetail />
                        </Suspense>
                      } />
                      <Route path="/maintenance" element={
                        <Suspense fallback={<LoadingSpinner message="Chargement de la maintenance..." />}>
                          <Maintenance />
                        </Suspense>
                      } />
                      <Route path="/parts" element={
                        <Suspense fallback={<LoadingSpinner message="Chargement des pièces..." />}>
                          <Parts />
                        </Suspense>
                      } />
                      <Route path="/interventions" element={
                        <Suspense fallback={<LoadingSpinner message="Chargement des interventions..." />}>
                          <Interventions />
                        </Suspense>
                      } />
                      <Route path="/settings" element={
                        <Suspense fallback={<LoadingSpinner message="Chargement des paramètres..." />}>
                          <Settings />
                        </Suspense>
                      } />
                      <Route path="/profile" element={
                        <Suspense fallback={<LoadingSpinner message="Chargement du profil..." />}>
                          <Profile />
                        </Suspense>
                      } />
                      <Route path="/search" element={
                        <Suspense fallback={<LoadingSpinner message="Préparation de la recherche..." />}>
                          <Search />
                        </Suspense>
                      } />
                      {/* Route pour QR code scanning */}
                      <Route path="/scan/:id" element={
                        <Suspense fallback={<LoadingSpinner message="Analyse du QR code..." />}>
                          <ScanRedirect />
                        </Suspense>
                      } />
                      <Route path="*" element={
                        <Suspense fallback={<LoadingSpinner message="Page non trouvée..." />}>
                          <NotFound />
                        </Suspense>
                      } />
                    </Route>
                  </Routes>
                  
                  <Toaster />
                </LayoutProvider>
              </PreloadLink>
            </AuthProvider>
          </Router>
        </RealtimeCacheProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
