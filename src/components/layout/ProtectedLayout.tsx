
import React, { ReactNode, Suspense } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import MainLayout from '@/ui/layouts/MainLayout';
import { LayoutProvider } from '@/ui/layouts/MainLayoutContext';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useRoutePreloading } from '@/hooks/useRoutePreloading';

interface ProtectedLayoutProps {
  children: ReactNode;
}

const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({ children }) => {
  // Utiliser le hook de préchargement pour optimiser les navigations futures
  useRoutePreloading();
  
  return (
    <ProtectedRoute>
      <LayoutProvider>
        <MainLayout>
          <Suspense fallback={<LoadingSpinner message="Chargement du contenu sécurisé..." />}>
            {children}
          </Suspense>
        </MainLayout>
      </LayoutProvider>
    </ProtectedRoute>
  );
};

export default ProtectedLayout;
