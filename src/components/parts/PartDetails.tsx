
import React from 'react';
import { Button } from '@/components/ui/button';
import { Part } from '@/types/Part';
import { AlertCircle, Edit, Trash2, ShoppingCart } from 'lucide-react';

interface PartDetailsProps {
  part: Part;
  onEdit?: () => void;
  onDelete?: () => void;
  onOrder?: () => void;
  onDialogClose?: () => void;
}

const PartDetails: React.FC<PartDetailsProps> = ({
  part,
  onEdit,
  onDelete,
  onOrder,
  onDialogClose
}) => {
  if (!part) {
    console.error("PartDetails: aucune pièce fournie");
    return (
      <div className="p-4 bg-destructive/10 rounded-md">
        <p className="text-destructive flex items-center">
          <AlertCircle className="mr-2 h-4 w-4" />
          Aucune pièce à afficher
        </p>
      </div>
    );
  }

  console.log("Affichage des détails pour la pièce:", part);

  return (
    <div className="space-y-6">
      {/* En-tête avec image et info de base */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3">
          <div className="rounded-md overflow-hidden aspect-square">
            <img 
              src={part.image} 
              alt={part.name} 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=No+Image';
              }}
            />
          </div>
        </div>
        
        <div className="w-full md:w-2/3 space-y-4">
          {/* Informations générales */}
          <div>
            <h3 className="text-2xl font-bold">{part.name}</h3>
            <p className="text-muted-foreground">{part.partNumber}</p>
          </div>
          
          {/* Info de stock et prix */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Prix</p>
              <p className="font-medium text-lg">${part.price?.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Stock</p>
              <p className={`font-medium text-lg ${
                part.stock <= (part.reorderPoint || 0) ? 'text-destructive flex items-center' : ''
              }`}>
                {part.stock} unités
                {part.stock <= (part.reorderPoint || 0) && (
                  <AlertCircle className="ml-2 h-4 w-4" />
                )}
              </p>
            </div>
          </div>
          
          {/* Informations supplémentaires */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Fabricant</p>
              <p className="font-medium">{part.manufacturer || "Non spécifié"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Catégorie</p>
              <p className="font-medium">{part.category || "Non classé"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Emplacement</p>
              <p className="font-medium">{part.location || "Non spécifié"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Seuil d'alerte</p>
              <p className="font-medium">{part.reorderPoint || 0} unités</p>
            </div>
          </div>
          
          {/* Boutons d'action rapide */}
          <div className="flex flex-wrap gap-2 pt-4">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </Button>
            )}
            {onOrder && (
              <Button variant="default" size="sm" onClick={onOrder}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Commander
              </Button>
            )}
            {onDelete && (
              <Button variant="destructive" size="sm" onClick={onDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </Button>
            )}
            {onDialogClose && (
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={onDialogClose}
                className="ml-auto"
              >
                Fermer
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Description */}
      {part.description && (
        <div className="space-y-2">
          <h4 className="font-medium">Description</h4>
          <p className="text-muted-foreground">{part.description}</p>
        </div>
      )}
      
      {/* Compatibilité */}
      {part.compatibility && part.compatibility.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Compatible avec</h4>
          <div className="flex flex-wrap gap-2">
            {part.compatibility.map((item, index) => (
              <div key={index} className="bg-secondary rounded-md px-2 py-1">
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PartDetails;
