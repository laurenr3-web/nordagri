
import React from 'react';
import { BlurContainer } from '@/components/ui/blur-container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';

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
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {parts.map((part, index) => (
        <BlurContainer 
          key={part.id} 
          className="overflow-hidden animate-scale-in flex flex-col h-full"
          style={{ animationDelay: `${index * 0.05}s` } as React.CSSProperties}
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
                // Set a default image if the part image fails to load
                const target = e.target as HTMLImageElement;
                target.src = 'https://placehold.co/400x400/png?text=No+Image';
              }}
            />
            {part.stock <= part.reorderPoint && (
              <div className="absolute top-2 right-2">
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertCircle size={12} />
                  <span>Low Stock</span>
                </Badge>
              </div>
            )}
          </div>
          
          <div className="p-3 flex flex-col flex-1">
            <div className="mb-2">
              <h3 className="font-medium">{part.name}</h3>
              <p className="text-sm text-muted-foreground">{part.partNumber}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-2 text-sm flex-1">
              <div>
                <p className="text-muted-foreground">Manufacturer</p>
                <p className="font-medium">{part.manufacturer}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Price</p>
                <p className="font-medium">${part.price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Stock</p>
                <p className={`font-medium ${part.stock <= part.reorderPoint ? 'text-destructive' : ''}`}>
                  {part.stock} units
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Location</p>
                <p className="font-medium">{part.location}</p>
              </div>
            </div>
            
            <div className="mt-auto pt-3">
              <div className="flex gap-2 justify-between">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1"
                  onClick={() => openPartDetails(part)}
                  aria-label="Voir les détails de la pièce"
                >
                  Details
                </Button>
                <Button 
                  variant="default" 
                  size="sm"
                  className="flex-1" 
                  onClick={() => openOrderDialog(part)}
                  aria-label="Commander cette pièce"
                >
                  Order
                </Button>
              </div>
            </div>
          </div>
        </BlurContainer>
      ))}
    </div>
  );
};

export default PartsGrid;
