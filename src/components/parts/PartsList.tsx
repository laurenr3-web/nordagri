
import React from 'react';
import { BlurContainer } from '@/components/ui/blur-container';
import { Button } from '@/components/ui/button';
import { AlertCircle, Eye, ShoppingCart } from 'lucide-react';
import { Part } from '@/types/Part';

interface PartsListProps {
  parts: Part[];
  openPartDetails: (part: Part) => void;
  openOrderDialog?: (part: Part) => void;
}

const PartsList: React.FC<PartsListProps> = ({ parts, openPartDetails, openOrderDialog }) => {
  // Fonction de gestion du clic sur l'image de la pièce
  const handleImageClick = (part: Part) => {
    console.log("[PartsList] Clic sur l'image:", part.name);
    openPartDetails(part);
  };
  
  // Fonction de gestion du clic sur le bouton détails
  const handleDetailsClick = (part: Part, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("[PartsList] Clic sur le bouton détails:", part.name);
    openPartDetails(part);
  };
  
  // Fonction de gestion du clic sur le bouton commande
  const handleOrderClick = (part: Part, e: React.MouseEvent) => {
    if (!openOrderDialog) return;
    e.stopPropagation();
    console.log("[PartsList] Clic sur le bouton commande:", part.name);
    openOrderDialog(part);
  };

  // Vérification que les parties sont disponibles
  if (!parts || parts.length === 0) {
    return (
      <BlurContainer className="p-8 text-center text-muted-foreground animate-fade-in">
        Aucune pièce trouvée
      </BlurContainer>
    );
  }

  return (
    <BlurContainer className="overflow-hidden rounded-lg animate-fade-in">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-secondary/50">
              <th className="text-left p-3 font-medium">Image</th>
              <th className="text-left p-3 font-medium">Nom</th>
              <th className="text-left p-3 font-medium">Référence</th>
              <th className="text-left p-3 font-medium">Fabricant</th>
              <th className="text-left p-3 font-medium">Prix</th>
              <th className="text-left p-3 font-medium">Stock</th>
              <th className="text-left p-3 font-medium">Emplacement</th>
              <th className="text-left p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {parts.map((part) => (
              <tr key={part.id} className="hover:bg-secondary/30">
                <td className="p-3">
                  <div 
                    className="h-12 w-12 rounded-md overflow-hidden flex-shrink-0 cursor-pointer" 
                    onClick={() => handleImageClick(part)}
                  >
                    <img 
                      src={part.image || 'https://placehold.co/200?text=No+Image'} 
                      alt={part.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/200?text=No+Image';
                      }}
                    />
                  </div>
                </td>
                <td className="p-3 font-medium">{part.name}</td>
                <td className="p-3">{part.partNumber || part.reference}</td>
                <td className="p-3">{part.manufacturer || 'Non spécifié'}</td>
                <td className="p-3">${(part.price || 0).toFixed(2)}</td>
                <td className="p-3">
                  <span className={part.stock <= (part.reorderPoint || 0) ? 'text-destructive font-medium' : ''}>
                    {part.stock || 0} {part.stock <= (part.reorderPoint || 0) && (
                      <AlertCircle size={14} className="inline ml-1" />
                    )}
                  </span>
                </td>
                <td className="p-3">{part.location || 'Non spécifié'}</td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 px-2 flex items-center gap-1" 
                      onClick={(e) => handleDetailsClick(part, e)}
                      aria-label="Voir les détails de la pièce"
                    >
                      <Eye size={14} />
                      Détails
                    </Button>
                    {openOrderDialog && (
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="h-8 px-2 flex items-center gap-1" 
                        onClick={(e) => handleOrderClick(part, e)}
                        aria-label="Commander cette pièce"
                      >
                        <ShoppingCart size={14} />
                        Commander
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </BlurContainer>
  );
};

export default PartsList;
