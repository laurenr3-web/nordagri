
import React, { ReactNode, memo, useMemo } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import MainLayout from '@/ui/layouts/MainLayout';
import { LayoutProvider } from '@/ui/layouts/MainLayoutContext';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useRoutePreloading } from '@/hooks/useRoutePreloading';

interface ProtectedLayoutProps {
  children: ReactNode;
}

// Utilisation de React.memo pour optimiser les rendus
const ProtectedLayout: React.FC<ProtectedLayoutProps> = memo(({ children }) => {
  // Préchargement optimisé des routes
  useRoutePreloading();
  
  // Mémoriser le contenu suspendu pour éviter des rendus inutiles
  const suspendedContent = useMemo(() => (
    <ProtectedRoute>
      <LayoutProvider>
        <MainLayout>
          <React.Suspense fallback={<LoadingSpinner message="Chargement du contenu sécurisé..." />}>
            {children}
          </React.Suspense>
        </MainLayout>
      </LayoutProvider>
    </ProtectedRoute>
  ), [children]);
  
  return suspendedContent;
});

// Ajouter un displayName pour améliorer le débogage
ProtectedLayout.displayName = 'ProtectedLayout';

export default ProtectedLayout;
