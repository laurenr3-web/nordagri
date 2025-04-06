
import React, { useState } from 'react';
import MainLayout from '@/ui/layouts/MainLayout';
import Header from '@/components/index/Header';
import ViewManager from '@/components/index/ViewManager';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  // Current month for calendar
  const [currentMonth] = useState(new Date());
  const [currentView, setCurrentView] = useState<'main' | 'calendar' | 'alerts'>('main');
  const isMobile = useIsMobile();

  const handleViewChange = (view: 'main' | 'calendar' | 'alerts') => {
    setCurrentView(view);
  };

  return (
    <MainLayout>
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="p-3">
          <Header 
            currentView={currentView}
            setCurrentView={handleViewChange}
          />
        </div>
        
        <div className={`flex-1 overflow-auto px-2 pb-2 ${isMobile ? 'mobile-pb-safe' : ''}`}>
          <div className="mx-auto h-full max-w-7xl">
            <ViewManager 
              currentView={currentView} 
              currentMonth={currentMonth} 
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
