
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, Calendar, AlertCircle } from 'lucide-react';

interface DashboardTabsProps {
  activeView: 'main' | 'calendar' | 'alerts';
  onViewChange: (view: 'main' | 'calendar' | 'alerts') => void;
}

export const DashboardTabs: React.FC<DashboardTabsProps> = ({
  activeView,
  onViewChange
}) => {
  return (
    <Tabs value={activeView} onValueChange={onViewChange}>
      <TabsList className="grid grid-cols-3 w-full sm:w-auto sm:inline-grid mb-6">
        <TabsTrigger value="main" className="gap-2">
          <LayoutDashboard className="h-4 w-4" />
          <span className="hidden sm:inline">Vue principale</span>
          <span className="sm:hidden">Principal</span>
        </TabsTrigger>
        <TabsTrigger value="calendar" className="gap-2">
          <Calendar className="h-4 w-4" />
          <span>Calendrier</span>
        </TabsTrigger>
        <TabsTrigger value="alerts" className="gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>Alertes</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
