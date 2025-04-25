
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface MaintenanceHeaderProps {
  setIsNewTaskDialogOpen: (open: boolean) => void;
  userName?: string;
  className?: string;
}

const MaintenanceHeader: React.FC<MaintenanceHeaderProps> = ({ 
  setIsNewTaskDialogOpen,
  userName = 'Utilisateur',
  className
}) => {
  return (
    <div className={`flex space-x-2 ${className || ''}`}>
      <Button onClick={() => setIsNewTaskDialogOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        <span>Nouvelle tâche</span>
      </Button>
    </div>
  );
};

export default MaintenanceHeader;
