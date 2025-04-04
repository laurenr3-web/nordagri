
import React, { useState } from 'react';
import MainLayout from '@/ui/layouts/MainLayout';
import Header from '@/components/index/Header';
import ViewManager from '@/components/index/ViewManager';

const Index = () => {
  // Current month for calendar
  const [currentMonth] = useState(new Date());
  const [currentView, setCurrentView] = useState<'main' | 'calendar' | 'alerts'>('main');

  const handleViewChange = (view: 'main' | 'calendar' | 'alerts') => {
    setCurrentView(view);
  };

  return (
    <MainLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <div className="h-full">
            <Header 
              currentView={currentView}
              setCurrentView={handleViewChange}
            />
            
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
