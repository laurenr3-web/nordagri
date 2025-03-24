
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface EquipmentHeaderProps {
  openAddDialog: () => void;
}

const EquipmentHeader: React.FC<EquipmentHeaderProps> = ({ openAddDialog }) => {
  return (
    <header className="mb-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="chip chip-primary mb-2">Equipment Fleet</div>
          <h1 className="text-3xl font-medium tracking-tight mb-1">Farm Equipment</h1>
          <p className="text-muted-foreground">
            Monitor and manage your agricultural machinery
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <Button className="gap-2" onClick={openAddDialog}>
            <Plus size={16} />
            <span>Add Equipment</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default EquipmentHeader;
