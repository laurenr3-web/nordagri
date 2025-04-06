
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface EquipmentHeaderProps {
  openAddDialog: () => void;
}

const EquipmentHeader: React.FC<EquipmentHeaderProps> = ({ openAddDialog }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 space-y-2 sm:space-y-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Équipements</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Gérez votre flotte d'équipements et matériels agricoles
        </p>
      </div>
      
      <Button 
        onClick={openAddDialog}
        size="sm"
        className="whitespace-nowrap py-1.5"
      >
        <Plus className="mr-1.5 h-4 w-4" />
        Ajouter un équipement
      </Button>
    </div>
  );
};

export default EquipmentHeader;
