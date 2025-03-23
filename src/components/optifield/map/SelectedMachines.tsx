
import React from 'react';
import { Tractor, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SelectedMachinesProps {
  selectedMachines: string[];
  onMachineSelected?: (machineName: string) => void;
}

const SelectedMachines: React.FC<SelectedMachinesProps> = ({ selectedMachines, onMachineSelected }) => {
  if (selectedMachines.length === 0) return null;
  
  const handleRemoveMachine = (machine: string) => {
    if (onMachineSelected) {
      onMachineSelected(machine);
    }
  };
  
  return (
    <div className="absolute top-4 left-4 z-10">
      <div className="bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm">
        <div className="text-sm font-medium mb-1">Machines sélectionnées</div>
        <div className="flex flex-col gap-1">
          {selectedMachines.map(machine => (
            <div key={machine} className="flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Tractor className="h-3 w-3" />
                <span>{machine}</span>
              </div>
              {onMachineSelected && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5 p-0" 
                  onClick={() => handleRemoveMachine(machine)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SelectedMachines;
