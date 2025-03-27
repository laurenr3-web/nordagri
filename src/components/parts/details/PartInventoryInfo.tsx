
import React from 'react';
import { Package, Warehouse } from 'lucide-react';
import { Part } from '@/types/Part';

interface PartInventoryInfoProps {
  part: Part;
}

const PartInventoryInfo: React.FC<PartInventoryInfoProps> = ({ part }) => {
  const isLowStock = part.stock <= part.reorderPoint;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm text-muted-foreground">Price</h3>
        <p className="font-medium">${part.price.toFixed(2)}</p>
      </div>
      
      <div>
        <h3 className="text-sm text-muted-foreground">Stock</h3>
        <p className={`font-medium flex items-center gap-2 ${isLowStock ? 'text-destructive' : ''}`}>
          <Package size={16} className="text-muted-foreground" />
          {part.stock} units {isLowStock && 
            <span className="text-xs bg-destructive/10 text-destructive py-1 px-2 rounded-md">
              Low Stock
            </span>
          }
        </p>
      </div>
      
      <div>
        <h3 className="text-sm text-muted-foreground">Storage Location</h3>
        <p className="font-medium flex items-center gap-2">
          <Warehouse size={16} className="text-muted-foreground" />
          {part.location}
        </p>
      </div>
    </div>
  );
};

export default PartInventoryInfo;
