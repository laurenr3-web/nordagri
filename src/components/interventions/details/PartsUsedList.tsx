
import React from 'react';
import { Label } from '@/components/ui/label';
import { Intervention } from '@/types/Intervention';

interface PartsUsedListProps {
  partsUsed?: Array<{ partId: number; name: string; quantity: number; }>;
}

const PartsUsedList: React.FC<PartsUsedListProps> = ({
  partsUsed
}) => {
  if (!partsUsed || partsUsed.length === 0) {
    return null;
  }
  
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label className="text-right">Pièces utilisées</Label>
      <div className="col-span-3">
        <ul className="list-none pl-0">
          {partsUsed.map((part) => (
            <li key={part.partId} className="flex items-center justify-between border-b py-2 text-sm">
              <span>{part.name}</span>
              <span>{part.quantity}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PartsUsedList;
