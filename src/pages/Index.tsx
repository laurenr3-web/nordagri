
import React, { useState } from 'react';
import MainLayout from '@/ui/layouts/MainLayout';
import ViewManager from '@/components/index/ViewManager';
import { LayoutWrapper } from '@/components/layout/LayoutWrapper';
import { PageHeader } from '@/components/layout/PageHeader';

const Index = () => {
  const [currentMonth] = useState(new Date());
  const [currentView, setCurrentView] = useState<'main' | 'calendar' | 'alerts'>('main');

  const handleViewChange = (view: 'main' | 'calendar' | 'alerts') => {
    setCurrentView(view);
  };

  return (
    <MainLayout>
      <LayoutWrapper>
        <PageHeader 
          title="Tableau de bord"
          description="Vue d'ensemble de votre exploitation"
        />
        
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <button 
            onClick={() => handleViewChange('main')}
            className={`px-4 py-2 rounded-lg ${currentView === 'main' ? 'bg-primary text-white' : 'bg-secondary'}`}
          >
            Principal
          </button>
          <button 
            onClick={() => handleViewChange('calendar')}
            className={`px-4 py-2 rounded-lg ${currentView === 'calendar' ? 'bg-primary text-white' : 'bg-secondary'}`}
          >
            Calendrier
          </button>
          <button 
            onClick={() => handleViewChange('alerts')}
            className={`px-4 py-2 rounded-lg ${currentView === 'alerts' ? 'bg-primary text-white' : 'bg-secondary'}`}
          >
            Alertes
          </button>
        </div>
        
        <ViewManager 
          currentView={currentView} 
          currentMonth={currentMonth} 
        />
      </LayoutWrapper>
    </MainLayout>
  );
};

export default Index;
