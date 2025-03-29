
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import { Part } from '@/types/Part';
import { ensureNumber } from '@/utils/typeAdapters';

interface PartImageProps {
  part: Part;
}

const PartImage: React.FC<PartImageProps> = ({ part }) => {
  const stock = ensureNumber(part.stock);
  const reorderPoint = ensureNumber(part.reorderPoint || part.minimumStock);
  const isLowStock = stock <= reorderPoint;
  const imageUrl = part.image || part.imageUrl || 'https://placehold.co/400x300/png?text=No+Image';

  return (
    <div className="relative aspect-video overflow-hidden rounded-md">
      <img 
        src={imageUrl} 
        alt={part.name}
        className="w-full h-full object-cover"
        onError={(e) => {
          // If image fails to load, set a placeholder
          const target = e.target as HTMLImageElement;
          target.src = 'https://placehold.co/400x300/png?text=No+Image';
        }}
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
