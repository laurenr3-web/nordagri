
import React, { useState } from 'react';
import MainLayout from '@/ui/layouts/MainLayout';
import Header from '@/components/index/Header';
import ViewManager from '@/components/index/ViewManager';

const Index = () => {
  const [currentMonth] = useState(new Date());
  const [currentView, setCurrentView] = useState<'main' | 'calendar' | 'alerts'>('main');

  const handleViewChange = (view: 'main' | 'calendar' | 'alerts') => {
    setCurrentView(view);
  };

  return (
    <MainLayout>
      <div className="w-full overflow-x-hidden">
        <Header 
          currentView={currentView}
          setCurrentView={handleViewChange}
        />
        
        <ViewManager 
          currentView={currentView} 
          currentMonth={currentMonth} 
        />
      </div>
    </MainLayout>
  );
};

export default Index;
