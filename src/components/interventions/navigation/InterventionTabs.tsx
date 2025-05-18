
import React from 'react';
import { CalendarCheck, Clock, CheckCircle2, Wrench, FileText, Eye, History } from 'lucide-react';
import { ExpandableTabs, TabItem } from '@/components/ui/expandable-tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface InterventionTabsProps {
  scheduledCount: number;
  inProgressCount: number;
  completedCount: number;
  currentView: string;
  onTabClick: (path: string | undefined) => void;
}

const InterventionTabs: React.FC<InterventionTabsProps> = ({
  scheduledCount,
  inProgressCount,
  completedCount,
  currentView,
  onTabClick
}) => {
  // Définir les onglets avec les icônes et compteurs
  const navigationTabs: TabItem[] = [
    {
      title: `Planifiées (${scheduledCount})`,
      icon: CalendarCheck,
      path: 'scheduled'
    },
    {
      title: `En cours (${inProgressCount})`,
      icon: Clock,
      path: 'in-progress'
    },
    {
      title: `Terminées (${completedCount})`,
      icon: CheckCircle2,
      path: 'completed'
    },
    {
      title: 'Suivi Terrain',
      icon: Wrench,
      path: 'field-tracking'
    },
    {
      title: 'Demandes',
      icon: FileText,
      path: 'requests'
    },
    {
      title: 'Observations',
      icon: Eye,
      path: 'observations'
    },
    {
      title: 'Historique',
      icon: History,
      path: 'history'
    }
  ];

  return (
    <ScrollArea className="w-full overflow-x-auto pb-2">
      <ExpandableTabs
        tabs={navigationTabs}
        activeColor="text-primary"
        currentPath={currentView}
        onTabClick={onTabClick}
        className="w-full mb-6 justify-start overflow-x-auto flex-nowrap scrollbar-hide"
      />
    </ScrollArea>
  );
};

export default InterventionTabs;
