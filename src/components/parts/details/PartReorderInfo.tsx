
import React from 'react';
import { Part } from '@/types/Part';

interface PartReorderInfoProps {
  part: Part;
}

const PartReorderInfo: React.FC<PartReorderInfoProps> = ({ part }) => {
  const isLowStock = part.stock <= part.reorderPoint;

  return (
    <div className="pt-4">
      <h3 className="text-sm text-muted-foreground mb-2">Reorder Point</h3>
      <div className="p-4 bg-secondary/50 rounded-md">
        <div className="flex justify-between items-center">
          <span>Current Stock</span>
          <span className="font-medium">{part.stock} units</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span>Reorder Point</span>
          <span className="font-medium">{part.reorderPoint} units</span>
        </div>
        <div className="w-full bg-background rounded-full h-2 mt-4">
          <div 
            className={`h-2 rounded-full ${isLowStock ? 'bg-destructive' : 'bg-primary'}`}
            style={{ width: `${Math.min(100, (part.stock / (part.reorderPoint * 2)) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default PartReorderInfo;
