
import React from 'react';
import { BlurContainer } from '@/components/ui/blur-container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Eye, ShoppingCart } from 'lucide-react';
import { Part } from '@/types/Part';

interface PartsGridProps {
  parts: Part[];
  openPartDetails: (part: Part) => void;
  openOrderDialog?: (part: Part) => void;
}

const PartsGrid: React.FC<PartsGridProps> = ({ parts, openPartDetails, openOrderDialog }) => {
  // Fonction de gestion du clic sur l'image ou le conteneur
  const handlePartClick = (part: Part) => {
    console.log("PartsGrid: Clic sur la pièce", part.name);
    openPartDetails(part);
  };
  
  // Fonction de gestion du clic sur le bouton détails
  const handleDetailsClick = (part: Part, e: React.MouseEvent) => {
    e.stopPropagation(); // Arrêter la propagation mais ne pas empêcher le comportement par défaut
    console.log("PartsGrid: Clic sur le bouton détails", part.name);
    openPartDetails(part);
  };
  
  // Fonction de gestion du clic sur le bouton commande
  const handleOrderClick = (part: Part, e: React.MouseEvent) => {
    if (!openOrderDialog) return;
    e.stopPropagation(); // Arrêter la propagation mais ne pas empêcher le comportement par défaut
    console.log("PartsGrid: Clic sur le bouton commande", part.name);
    openOrderDialog(part);
  };

  // Vérification que les parties sont disponibles
  if (!parts || parts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Aucune pièce disponible.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {parts.map((part, index) => (
        <BlurContainer 
          key={part.id} 
          className="overflow-hidden animate-scale-in h-full flex flex-col"
          style={{ animationDelay: `${index * 0.05}s` } as React.CSSProperties}
          onClick={() => handlePartClick(part)}
        >
          <div 
            className="aspect-square relative overflow-hidden cursor-pointer"
          >
            <img 
              src={part.image} 
              alt={part.name}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/png?text=Image+non+disponible';
              }}
            />
            {part.stock <= part.reorderPoint && (
              <div className="absolute top-2 right-2">
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertCircle size={12} />
                  <span>Stock Faible</span>
                </Badge>
              </div>
            )}
          </div>
          
          <div className="p-4 flex-1 flex flex-col">
            <div className="mb-2">
              <h3 className="font-medium">{part.name}</h3>
              <p className="text-sm text-muted-foreground">{part.partNumber}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
              <div>
                <p className="text-muted-foreground">Fabricant</p>
                <p className="font-medium">{part.manufacturer}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Prix</p>
                <p className="font-medium">${part.price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Stock</p>
                <p className={`font-medium ${part.stock <= part.reorderPoint ? 'text-destructive' : ''}`}>
                  {part.stock} unités
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Emplacement</p>
                <p className="font-medium">{part.location}</p>
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-xs text-muted-foreground mb-1">Compatible avec:</p>
              <div className="flex flex-wrap gap-1">
                {part.compatibility && part.compatibility.slice(0, 2).map((equipment, i) => (
                  <span key={i} className="text-xs bg-secondary py-1 px-2 rounded-md">
                    {equipment}
                  </span>
                ))}
                {part.compatibility && part.compatibility.length > 2 && (
                  <span className="text-xs bg-secondary py-1 px-2 rounded-md">
                    +{part.compatibility.length - 2} de plus
                  </span>
                )}
              </div>
            </div>
            
            <div className="mt-auto pt-4 border-t border-border flex justify-between">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={(e) => handleDetailsClick(part, e)}
                aria-label="Voir les détails de la pièce"
                className="flex items-center gap-1"
              >
                <Eye size={14} />
                Détails
              </Button>
              {openOrderDialog && (
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={(e) => handleOrderClick(part, e)}
                  aria-label="Commander cette pièce"
                  className="flex items-center gap-1"
                >
                  <ShoppingCart size={14} />
                  Commander
                </Button>
              )}
            </div>
          </div>
        </BlurContainer>
      ))}
    </div>
  );
};

export default PartsGrid;
