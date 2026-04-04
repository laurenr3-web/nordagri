
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface EquipmentHeaderProps {
  openAddDialog: () => void;
}

const EquipmentHeader: React.FC<EquipmentHeaderProps> = ({ openAddDialog }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Équipements</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-0.5">
          Gérez votre flotte d'équipements et matériels agricoles
        </p>
      </div>
      
      <Button 
        onClick={openAddDialog}
        size="sm"
        className="w-full sm:w-auto"
      >
        <Plus className="mr-2 h-4 w-4" />
        Ajouter un équipement
      </Button>
    </div>
  );
};

export default EquipmentHeader;
