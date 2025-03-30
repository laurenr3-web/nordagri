
import React from 'react';
import { Download, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InterventionsHeaderProps {
  onNewIntervention: () => void;
}

const InterventionsHeader: React.FC<InterventionsHeaderProps> = ({ onNewIntervention }) => {
  return (
    <div className="border-b">
      <div className="flex items-center justify-between p-4">
        <div className="flex-1 space-y-1.5">
          <h1 className="text-lg font-semibold">Interventions</h1>
          <p className="text-sm text-muted-foreground">
            Gérez et suivez les interventions de maintenance.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
          <Button size="sm" onClick={onNewIntervention}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Intervention
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InterventionsHeader;
