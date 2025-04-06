
import React, { useState, Suspense, useEffect } from 'react';
import MainLayout from '@/ui/layouts/MainLayout';
import Header from '@/components/index/Header';
import ViewManager from '@/components/index/ViewManager';
import { useIsMobile } from '@/hooks/use-mobile';
import { ConnectionStatus } from '@/components/ui/connection-status';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import { useRealtimeCache } from '@/providers/RealtimeCacheProvider';
import { useDashboardData } from '@/hooks/dashboard/useDashboardData';
import { toast } from 'sonner';

const Index = () => {
  // État actuel
  const [currentMonth] = useState(new Date());
  const [currentView, setCurrentView] = useState<'main' | 'calendar' | 'alerts'>('main');
  const isMobile = useIsMobile();
  const { isOfflineMode, prefetchCriticalData } = useRealtimeCache();
  
  // Précharger les données du dashboard pour le mode hors ligne
  useEffect(() => {
    if (isOfflineMode) {
      // Nous sommes en mode hors ligne, vérifions si les données sont disponibles
      prefetchCriticalData();
    }
  }, [isOfflineMode, prefetchCriticalData]);

  const handleViewChange = (view: 'main' | 'calendar' | 'alerts') => {
    setCurrentView(view);
  };

  return (
    <MainLayout>
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b">
          <Header 
            currentView={currentView}
            setCurrentView={handleViewChange}
          />
          <ConnectionStatus className="ml-2" />
        </div>
        
        <div className={`flex-1 overflow-auto px-2 pb-2 ${isMobile ? 'mobile-pb-safe' : ''}`}>
          <div className="mx-auto h-full max-w-7xl">
            <Suspense fallback={<SkeletonLoader variant="grid" count={8} />}>
              <ViewManager 
                currentView={currentView} 
                currentMonth={currentMonth} 
              />
            </Suspense>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
