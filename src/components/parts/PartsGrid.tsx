
import React from 'react';
import { BlurContainer } from '@/components/ui/blur-container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface Part {
  id: number;
  name: string;
  partNumber: string;
  category: string;
  compatibility: string[];
  manufacturer: string;
  price: number;
  stock: number;
  location: string;
  reorderPoint: number;
  image: string;
}

interface PartsGridProps {
  parts: Part[];
  openPartDetails: (part: Part) => void;
  openOrderDialog: (part: Part) => void;
}

const PartsGrid: React.FC<PartsGridProps> = ({ parts, openPartDetails, openOrderDialog }) => {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const initialLimit = isMobile ? 4 : 8;
  const [displayLimit, setDisplayLimit] = React.useState(initialLimit);

  const displayedParts = parts.slice(0, displayLimit);
  const hasMore = displayLimit < parts.length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {displayedParts.map((part, index) => (
          <BlurContainer 
            key={part.id} 
            className="w-full overflow-hidden animate-scale-in"
            style={{ animationDelay: `${index * 0.1}s` } as React.CSSProperties}
          >
            <div 
              className="aspect-square relative overflow-hidden cursor-pointer"
              onClick={() => openPartDetails(part)}  
            >
              <img 
                src={part.image} 
                alt={part.name}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://placehold.co/400x400/png?text=No+Image';
                }}
              />
              {part.stock <= part.reorderPoint && (
                <div className="absolute top-2 right-2">
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertCircle size={12} />
                    <span>Stock bas</span>
                  </Badge>
                </div>
              )}
            </div>
            
            <div className="p-4">
              <div className="mb-2">
                <h3 className="font-medium line-clamp-1">{part.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-1">{part.partNumber}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Fabricant</p>
                  <p className="font-medium line-clamp-1">{part.manufacturer}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Prix</p>
                  <p className="font-medium">{part.price.toFixed(2)}€</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Stock</p>
                  <p className={`font-medium ${part.stock <= part.reorderPoint ? 'text-destructive' : ''}`}>
                    {part.stock} unités
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Emplacement</p>
                  <p className="font-medium line-clamp-1">{part.location}</p>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-xs text-muted-foreground mb-1">Compatible avec :</p>
                <div className="flex flex-wrap gap-1">
                  {part.compatibility.slice(0, 2).map((equipment, i) => (
                    <span key={i} className="text-xs bg-secondary/10 py-1 px-2 rounded-md line-clamp-1 max-w-[100px]">
                      {equipment}
                    </span>
                  ))}
                  {part.compatibility.length > 2 && (
                    <span className="text-xs bg-secondary/10 py-1 px-2 rounded-md">
                      +{part.compatibility.length - 2}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-border flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => openPartDetails(part)}
                  className="w-[48%]"
                >
                  Détails
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={() => openOrderDialog(part)}
                  className="w-[48%]"
                >
                  Commander
                </Button>
              </div>
            </div>
          </BlurContainer>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={() => setDisplayLimit(prev => prev + initialLimit)}
          >
            Afficher plus de pièces
          </Button>
        </div>
      )}
    </div>
  );
};

export default PartsGrid;
