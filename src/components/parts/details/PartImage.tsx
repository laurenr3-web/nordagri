
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ImageOff } from 'lucide-react';
import { Part } from '@/types/Part';
import { ensureNumber } from '@/utils/typeAdapters';

interface PartImageProps {
  part: Part;
}

const PartImage: React.FC<PartImageProps> = ({ part }) => {
  const [imgSrc, setImgSrc] = useState<string>(
    part.image || part.imageUrl || 'https://placehold.co/400x300/png?text=No+Image'
  );
  const [imgError, setImgError] = useState<boolean>(false);

  // Vérifier l'URL de l'image au chargement
  useEffect(() => {
    if (part.image || part.imageUrl) {
      const img = new Image();
      img.src = part.image || part.imageUrl || '';
      img.onload = () => setImgSrc(img.src);
      img.onerror = () => {
        setImgError(true);
        setImgSrc('https://placehold.co/400x300/png?text=No+Image');
      };
    }
  }, [part.image, part.imageUrl]);

  const stock = ensureNumber(part.stock);
  const reorderPoint = ensureNumber(part.reorderPoint || part.minimumStock);
  const isLowStock = stock <= reorderPoint;

  return (
    <div className="relative aspect-video overflow-hidden rounded-md">
      <img 
        src={imgSrc}
        alt={part.name}
        className="w-full h-full object-cover"
        onError={() => {
          if (!imgError) {
            setImgError(true);
            setImgSrc('https://placehold.co/400x300/png?text=No+Image');
          }
        }}
      />
      {imgError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/20">
          <ImageOff className="h-12 w-12 text-muted-foreground opacity-50" />
        </div>
      )}
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
