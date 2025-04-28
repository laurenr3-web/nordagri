
import React from 'react';
import { BlurContainer } from '@/components/ui/blur-container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Image as ImageIcon, Box } from 'lucide-react';
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
            className="w-full overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 animate-scale-in"
            style={{ animationDelay: `${index * 0.1}s` } as React.CSSProperties}
          >
            <div 
              className="aspect-square relative overflow-hidden cursor-pointer"
              onClick={() => openPartDetails(part)}  
            >
              {part.image ? (
                <img 
                  src={part.image} 
                  alt={part.name}
                  className="w-full h-48 object-cover transition-transform duration-500 hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://placehold.co/400x400/f5f5f5/a3a3a3?text=Image+manquante';
                  }}
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 flex flex-col items-center justify-center text-gray-400">
                  <ImageIcon size={48} />
                  <span className="mt-2 text-sm">Image manquante</span>
                </div>
              )}
              {part.stock <= part.reorderPoint && (
                <div className="absolute top-2 right-2">
                  <Badge variant="destructive" className="flex items-center gap-1 shadow-sm">
                    <AlertCircle size={12} />
                    <span>Stock bas</span>
                  </Badge>
                </div>
              )}
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg line-clamp-1">{part.name}</h3>
                <Badge 
                  variant="success" 
                  className="ml-2 shrink-0"
                >
                  {part.price.toFixed(2)}€
                </Badge>
              </div>
              
              <div className="flex items-center mb-3">
                <Box className="h-4 w-4 mr-1 text-gray-500" />
                <span className="text-sm text-gray-500 line-clamp-1">{part.partNumber}</span>
              </div>
              
              <p className="text-sm text-gray-500 mb-3 line-clamp-1">
                Fabricant: <span className="font-medium">{part.manufacturer}</span>
              </p>
              
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Stock:</p>
                  <Badge 
                    variant={part.stock <= part.reorderPoint ? "destructive" : "success"}
                  >
                    {part.stock} unités
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Emplacement:</p>
                  <span className="text-sm font-medium">{part.location}</span>
                </div>
              </div>
              
              {part.compatibility && part.compatibility.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-1">Compatible avec:</p>
                  <div className="flex flex-wrap gap-1">
                    {part.compatibility.slice(0, 2).map((equipment, i) => (
                      <span key={i} className="text-xs bg-gray-100 py-1 px-2 rounded-md line-clamp-1">
                        {equipment}
                      </span>
                    ))}
                    {part.compatibility.length > 2 && (
                      <span className="text-xs bg-gray-100 py-1 px-2 rounded-md">
                        +{part.compatibility.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <Button 
                  variant="outline" 
                  className="flex-1 bg-gray-100 hover:bg-gray-200 border-0"
                  onClick={() => openPartDetails(part)}
                >
                  Détails
                </Button>
                <Button 
                  variant="default"
                  className="flex-1 bg-agri-primary hover:bg-agri-dark text-white"
                  onClick={() => openOrderDialog(part)}
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
            className="border-gray-300 hover:bg-gray-100"
          >
            Afficher plus de pièces
          </Button>
        </div>
      )}
    </div>
  );
};

export default PartsGrid;
