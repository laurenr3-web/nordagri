
import React from 'react';
import { Clock, Wrench, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuickActionsProps {
  onUpdateHours: () => void;
  onMaintenance: () => void;
  onObservation: () => void;
  unitLabel: string;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  onUpdateHours,
  onMaintenance,
  onObservation,
  unitLabel,
}) => {
  return (
    <div className="grid grid-cols-3 gap-2">
      <Button
        variant="outline"
        className="flex flex-col items-center gap-1.5 h-auto py-4 px-2 rounded-xl border-2 hover:border-primary hover:bg-primary/5 transition-all"
        onClick={onUpdateHours}
      >
        <Clock className="h-6 w-6 text-primary" />
        <span className="text-xs font-medium text-center leading-tight">
          {unitLabel === 'Heures moteur' ? 'Heures' : 'Kilomètres'}
        </span>
      </Button>

      <Button
        variant="outline"
        className="flex flex-col items-center gap-1.5 h-auto py-4 px-2 rounded-xl border-2 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all"
        onClick={onMaintenance}
      >
        <Wrench className="h-6 w-6 text-amber-600" />
        <span className="text-xs font-medium text-center leading-tight">Maintenance</span>
      </Button>

      <Button
        variant="outline"
        className="flex flex-col items-center gap-1.5 h-auto py-4 px-2 rounded-xl border-2 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
        onClick={onObservation}
      >
        <Eye className="h-6 w-6 text-blue-600" />
        <span className="text-xs font-medium text-center leading-tight">Observation</span>
      </Button>
    </div>
  );
};

export default QuickActions;
