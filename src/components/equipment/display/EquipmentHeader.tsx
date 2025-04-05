
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface EquipmentHeaderProps {
  openAddDialog: () => void;
}

const EquipmentHeader: React.FC<EquipmentHeaderProps> = ({ openAddDialog }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-2 sm:space-y-0 w-full">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Équipements</h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          Gérez votre flotte d'équipements et matériels agricoles
        </p>
      </div>
      
      <Button 
        onClick={openAddDialog}
        size="sm"
        className="sm:self-start whitespace-nowrap"
      >
        <Plus className="mr-1 h-4 w-4" />
        Ajouter un équipement
      </Button>
    </div>
  );
};

export default EquipmentHeader;
