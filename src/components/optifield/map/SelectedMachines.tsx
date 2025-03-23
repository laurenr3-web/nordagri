
import React from 'react';
import { Tractor } from 'lucide-react';

interface SelectedMachinesProps {
  selectedMachines: string[];
}

const SelectedMachines: React.FC<SelectedMachinesProps> = ({ selectedMachines }) => {
  if (selectedMachines.length === 0) return null;
  
  return (
    <div className="absolute top-4 left-4 z-10">
      <div className="bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm">
        <div className="text-sm font-medium mb-1">Machines sélectionnées</div>
        <div className="flex flex-col gap-1">
          {selectedMachines.map(machine => (
            <div key={machine} className="flex items-center gap-2 text-xs">
              <Tractor className="h-3 w-3" />
              <span>{machine}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SelectedMachines;
