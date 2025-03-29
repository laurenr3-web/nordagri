
import React from 'react';
import { Button } from '@/components/ui/button';
import { Part } from '@/types/Part';
import { ensureNumber } from '@/utils/typeAdapters';

interface PartReorderInfoProps {
  part: Part;
  onOrder?: () => void;
}

const PartReorderInfo: React.FC<PartReorderInfoProps> = ({ part, onOrder }) => {
  const stock = ensureNumber(part.stock);
  const reorderPoint = ensureNumber(part.reorderPoint || part.minimumStock);
  const isLowStock = stock <= reorderPoint;

  return (
    <div className="pt-4">
      <h3 className="text-sm text-muted-foreground mb-2">Reorder Point</h3>
      <div className="p-4 bg-secondary/50 rounded-md">
        <div className="flex justify-between items-center">
          <span>Current Stock</span>
          <span className="font-medium">{stock} units</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span>Reorder Point</span>
          <span className="font-medium">{reorderPoint} units</span>
        </div>
        <div className="w-full bg-background rounded-full h-2 mt-4">
          <div 
            className={`h-2 rounded-full ${isLowStock ? 'bg-destructive' : 'bg-primary'}`}
            style={{ width: `${Math.min(100, (stock / (reorderPoint * 2)) * 100)}%` }}
          />
        </div>
        
        {isLowStock && (
          <Button 
            onClick={onOrder} 
            className="w-full mt-4"
            size="sm"
          >
            Order More
          </Button>
        )}
      </div>
    </div>
  );
};

export default PartReorderInfo;
