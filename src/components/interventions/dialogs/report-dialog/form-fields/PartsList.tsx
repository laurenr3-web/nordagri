
import React from 'react';
import { Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Part {
  id: number;
  name: string;
  quantity: number;
}

interface PartsListProps {
  parts: Part[];
  onRemovePart: (partId: number) => void;
  onUpdateQuantity: (partId: number, quantity: number) => void;
}

export const PartsList: React.FC<PartsListProps> = ({
  parts,
  onRemovePart,
  onUpdateQuantity
}) => {
  if (parts.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-2">
        Aucune pièce utilisée
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      {parts.map((part, index) => (
        <div key={index} className="flex items-center justify-between bg-muted/30 p-2 rounded-md">
          <div className="flex items-center">
            <Wrench className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{part.name}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              min="1"
              value={part.quantity}
              onChange={(e) => onUpdateQuantity(part.id, parseInt(e.target.value) || 1)}
              className="w-16 h-8 text-sm"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onRemovePart(part.id)}
            >
              &times;
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
