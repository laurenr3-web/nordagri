
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import { Part } from '@/types/Part';

interface PartImageProps {
  part: Part;
}

const PartImage: React.FC<PartImageProps> = ({ part }) => {
  const isLowStock = part.stock <= part.reorderPoint;

  return (
    <div className="relative aspect-video overflow-hidden rounded-md">
      <img 
        src={part.image} 
        alt={part.name}
        className="w-full h-full object-cover"
      />
      {isLowStock && (
        <div className="absolute top-2 right-2">
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle size={12} />
            <span>Low Stock</span>
          </Badge>
        </div>
      )}
    </div>
  );
};

export default PartImage;
