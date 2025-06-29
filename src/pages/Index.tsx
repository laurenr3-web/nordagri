
import React, { useState } from 'react';
import MainLayout from '@/ui/layouts/MainLayout';
import ViewManager from '@/components/index/ViewManager';
import { LayoutWrapper } from '@/components/layout/LayoutWrapper';
import { PageHeader } from '@/components/layout/PageHeader';
import { ConfigurationDiagnostic } from '@/components/diagnostics/ConfigurationDiagnostic';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

const Index = () => {
  const [currentMonth] = useState(new Date());
  const [currentView, setCurrentView] = useState<'main' | 'calendar' | 'alerts'>('main');
  const [showDiagnostic, setShowDiagnostic] = useState(false);

  const handleViewChange = (view: 'main' | 'calendar' | 'alerts') => {
    setCurrentView(view);
  };

  // Afficher le diagnostic automatiquement si on utilise les fallbacks
  const usingFallbacks = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;

  return (
    <MainLayout>
      <LayoutWrapper>
        <PageHeader 
          title="Tableau de bord"
          description="Vue d'ensemble de votre exploitation"
        />
        
        {(showDiagnostic || usingFallbacks) && (
          <div className="mb-6">
            <ConfigurationDiagnostic />
          </div>
        )}
        
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
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDiagnostic(!showDiagnostic)}
            className="ml-auto"
          >
            <Settings className="h-4 w-4 mr-2" />
            Diagnostic
          </Button>
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
