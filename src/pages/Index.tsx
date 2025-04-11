
import React, { Suspense, useCallback } from 'react';
import Header from '@/components/index/Header';
import ViewManager from '@/components/index/ViewManager';
import { useIsMobile } from '@/hooks/use-mobile';
import { ConnectionStatus } from '@/components/ui/connection-status';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useRealtimeCache } from '@/providers/RealtimeCacheProvider';
import { useDashboardData } from '@/hooks/dashboard/useDashboardData';

/**
 * Page d'index principale de l'application
 * - Optimisée avec React.memo pour les rendus
 * - Chargement asynchrone des composants
 * - Gestion appropriée des états de chargement
 */
const Index = React.memo(() => {
  // États et hooks
  const [currentView, setCurrentView] = React.useState<'main' | 'calendar' | 'alerts'>('main');
  const currentMonth = React.useMemo(() => new Date(), []);
  const isMobile = useIsMobile();
  const { isOfflineMode, prefetchCriticalData } = useRealtimeCache();
  const { loading: isDashboardDataLoading } = useDashboardData();
  
  // Gestionnaire de changement de vue optimisé
  const handleViewChange = useCallback((view: 'main' | 'calendar' | 'alerts') => {
    setCurrentView(view);
  }, []);

  // Précharger les données en mode hors ligne
  React.useEffect(() => {
    if (isOfflineMode) {
      prefetchCriticalData();
    }
  }, [isOfflineMode, prefetchCriticalData]);

  return (
    <>
      <div className="flex flex-1 flex-col overflow-hidden bg-background">
        <div className="flex items-center justify-between p-3 border-b">
          <Header 
            currentView={currentView}
            setCurrentView={handleViewChange}
          />
          <ConnectionStatus className="ml-2" />
        </div>
        
        <div className={`flex-1 overflow-auto px-2 pb-2 ${isMobile ? 'mobile-pb-safe' : ''}`}>
          <div className="mx-auto h-full max-w-7xl">
            <Suspense fallback={
              <LoadingSpinner 
                message="Chargement du tableau de bord..." 
                size="lg" 
                centered 
              />
            }>
              <ViewManager 
                currentView={currentView} 
                currentMonth={currentMonth} 
              />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
});

Index.displayName = 'Index';

export default Index;
