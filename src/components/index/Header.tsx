
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, CalendarClock, AlertTriangle } from 'lucide-react';

interface HeaderProps {
  currentView: 'main' | 'calendar' | 'alerts';
  setCurrentView: (view: 'main' | 'calendar' | 'alerts') => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView }) => {
  return (
    <header className="wavy-header mb-8 animate-fade-in">
      <div className="agri-gradient rounded-xl p-8 shadow-lg text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="chip chip-primary mb-2">Tableau de bord agricole</div>
            <h1 className="text-3xl font-medium tracking-tight mb-1">Bienvenue</h1>
            <p className="text-agri-light">
              Voici les dernières nouvelles concernant votre équipement agricole
            </p>
          </div>
          
          <Tabs value={currentView} onValueChange={value => setCurrentView(value as 'main' | 'calendar' | 'alerts')} className="mt-4 sm:mt-0">
            <TabsList className="grid w-full grid-cols-3 md:w-auto bg-white/10">
              <TabsTrigger value="main" className="gap-2 text-white data-[state=active]:bg-white data-[state=active]:text-agri-dark">
                <LayoutDashboard size={16} />
                <span className="px-[23px]">Tableau de bord</span>
              </TabsTrigger>
              <TabsTrigger value="calendar" className="gap-2 text-white data-[state=active]:bg-white data-[state=active]:text-agri-dark">
                <CalendarClock size={16} />
                <span>Calendrier</span>
              </TabsTrigger>
              <TabsTrigger value="alerts" className="gap-2 text-white data-[state=active]:bg-white data-[state=active]:text-agri-dark">
                <AlertTriangle size={16} />
                <span>Alertes</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </header>
  );
};

export default Header;
