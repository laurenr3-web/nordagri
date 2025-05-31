
import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { RefreshCw, Settings } from 'lucide-react';

interface DashboardHeaderProps {
  isRefreshing: boolean;
  isCustomizing: boolean;
  onRefresh: () => void;
  onToggleCustomizing: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  isRefreshing,
  isCustomizing,
  onRefresh,
  onToggleCustomizing
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <PageHeader 
        title="Tableau de bord" 
        description="Vue d'ensemble de vos opérations"
        className="mb-0"
      />
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
        
        <Button
          variant={isCustomizing ? 'default' : 'outline'}
          size="sm"
          onClick={onToggleCustomizing}
        >
          <Settings className="h-4 w-4 mr-2" />
          {isCustomizing ? 'Terminer' : 'Personnaliser'}
        </Button>
      </div>
    </div>
  );
};
