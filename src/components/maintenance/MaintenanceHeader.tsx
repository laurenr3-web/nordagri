
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface MaintenanceHeaderProps {
  setIsNewTaskDialogOpen: (open: boolean) => void;
}

const MaintenanceHeader: React.FC<MaintenanceHeaderProps> = ({ 
  setIsNewTaskDialogOpen 
}) => {
  return (
    <header className="mb-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="chip chip-accent mb-2">Maintenance Management</div>
          <h1 className="text-3xl font-medium tracking-tight mb-1">Maintenance Planner</h1>
          <p className="text-muted-foreground">
            Schedule and track maintenance activities for your equipment
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <Button className="gap-2" onClick={() => setIsNewTaskDialogOpen(true)}>
            <Plus size={16} />
            <span>New Task</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default MaintenanceHeader;
