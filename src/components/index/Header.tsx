
import React, { useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, CalendarClock, AlertTriangle } from 'lucide-react';

interface HeaderProps {
  currentView: 'main' | 'calendar' | 'alerts';
  setCurrentView: (view: 'main' | 'calendar' | 'alerts') => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView }) => {
  // Utilisation de la date actuelle au lieu d'une date codée en dur
  const currentMonthLabel = useMemo(() => {
    const date = new Date();
    // Format du mois en français
    return new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(date);
  }, []);

  return (
    <header className="wavy-header mb-8 animate-fade-in">
      <div className="agri-gradient rounded-xl p-8 shadow-lg text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="chip chip-primary mb-2">Agricultural ERP Dashboard</div>
            <h1 className="text-3xl font-medium tracking-tight mb-1">Welcome Back</h1>
            <p className="text-agri-light">
              Here's what's happening with your agricultural equipment today
            </p>
          </div>
          
          <Tabs 
            value={currentView} 
            onValueChange={value => setCurrentView(value as 'main' | 'calendar' | 'alerts')} 
            className="mt-4 sm:mt-0"
          >
            <TabsList className="grid w-full grid-cols-3 md:w-auto bg-white/10">
              <TabsTrigger 
                value="main" 
                className="gap-2 text-white data-[state=active]:bg-white data-[state=active]:text-agri-dark"
                aria-label="Afficher le tableau de bord"
              >
                <LayoutDashboard size={16} />
                <span className="hidden sm:inline px-[23px]">Dashboard</span>
                <span className="sm:hidden">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger 
                value="calendar" 
                className="gap-2 text-white data-[state=active]:bg-white data-[state=active]:text-agri-dark"
                aria-label="Afficher le calendrier"
              >
                <CalendarClock size={16} />
                <span>{currentMonthLabel}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="alerts" 
                className="gap-2 text-white data-[state=active]:bg-white data-[state=active]:text-agri-dark"
                aria-label="Afficher les alertes"
              >
                <AlertTriangle size={16} />
                <span>Alerts</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </header>
  );
};

export default Header;
