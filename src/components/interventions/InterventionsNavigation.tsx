
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  CalendarDays, 
  Clock, 
  CheckCircle2, 
  Wrench, 
  ArrowRight,
  AlertTriangle,
  History,
  FileText
} from 'lucide-react';

interface InterventionsNavigationProps {
  setCurrentView: (view: string) => void;
  currentView: string;
}

const InterventionsNavigation: React.FC<InterventionsNavigationProps> = ({ 
  setCurrentView,
  currentView
}) => {
  const navigationItems = [
    {
      title: 'Interventions Planifiées',
      description: 'Voir les interventions à venir',
      icon: <CalendarDays className="h-5 w-5" />,
      view: 'scheduled',
      color: 'bg-agri-50 text-agri-700 border-agri-200',
      activeColor: 'bg-agri-100 border-agri-500',
    },
    {
      title: 'Suivi Terrain',
      description: 'Interventions en cours',
      icon: <Wrench className="h-5 w-5" />,
      view: 'field-tracking',
      color: 'bg-harvest-50 text-harvest-700 border-harvest-200',
      activeColor: 'bg-harvest-100 border-harvest-500',
    },
    {
      title: 'Demandes',
      description: 'Gestion des requêtes',
      icon: <FileText className="h-5 w-5" />,
      view: 'requests',
      color: 'bg-soil-50 text-soil-700 border-soil-200',
      activeColor: 'bg-soil-100 border-soil-500',
    },
    {
      title: 'Historique',
      description: 'Par équipement',
      icon: <History className="h-5 w-5" />,
      view: 'history',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      activeColor: 'bg-blue-100 border-blue-500',
    },
  ];

  const handleCardClick = (view: string) => {
    setCurrentView(view);
    // Set the tab selection to match the view
    const tabsElement = document.querySelector(`[value="${view}"]`) as HTMLElement;
    if (tabsElement) {
      tabsElement.click();
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {navigationItems.map((item) => (
        <Card 
          key={item.view}
          className={`p-4 cursor-pointer hover:shadow-md transition-all hover:translate-y-[-2px] border ${
            currentView === item.view ? item.activeColor : item.color
          }`}
          onClick={() => handleCardClick(item.view)}
        >
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-full ${
              currentView === item.view ? 'bg-white shadow-sm' : 'bg-white/70'
            }`}>
              {item.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-base">{item.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
            </div>
          </div>
          <div className="flex justify-end mt-3">
            <Button 
              variant={currentView === item.view ? "default" : "ghost"} 
              size="sm" 
              className="text-xs"
            >
              <span className="truncate">Voir</span>
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default InterventionsNavigation;
