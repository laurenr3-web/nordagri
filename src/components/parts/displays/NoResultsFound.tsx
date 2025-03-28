
import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Popular part references for suggestions
const POPULAR_PARTS = [
  { ref: "RE504836", name: "Filtre à huile John Deere" },
  { ref: "47135628", name: "Filtre à carburant Case IH" },
  { ref: "3637662M1", name: "Filtre hydraulique Massey Ferguson" },
  { ref: "HH164-32430", name: "Filtre à air Kubota" },
  { ref: "87802724", name: "Joint New Holland" },
  { ref: "T19044", name: "Courroie de ventilateur John Deere" }
];

interface NoResultsFoundProps {
  partReference: string;
  onRetryWithManufacturer?: (manufacturer: string) => void;
}

const NoResultsFound: React.FC<NoResultsFoundProps> = ({ 
  partReference,
  onRetryWithManufacturer
}) => {
  const [manufacturer, setManufacturer] = useState('');

  const handleSearch = (site: string) => {
    const baseUrls = {
      google: `https://google.com/search?q=${partReference}+agricultural+part`,
      tractorPart: `https://www.tractorpart.com/search?q=${partReference}`,
      agriExpo: `https://www.agriexpo.online/fr/fabricant-agricole/recherche-${partReference}.html`,
      agriaffaires: `https://www.agriaffaires.com/pieces-detachees/1/pieces-agricoles.html?q=${partReference}`
    };
    
    window.open(baseUrls[site], '_blank');
  };

  const handlePrecise = () => {
    if (manufacturer.trim() && onRetryWithManufacturer) {
      onRetryWithManufacturer(manufacturer);
    }
  };

  const handlePartSelect = (partRef: string) => {
    if (onRetryWithManufacturer) {
      // Extract manufacturer from part name
      const part = POPULAR_PARTS.find(p => p.ref === partRef);
      if (part) {
        const partName = part.name;
        const manufacturerFromName = partName.split(' ').slice(-2).join(' ');
        onRetryWithManufacturer(`${partRef} ${manufacturerFromName}`);
      } else {
        onRetryWithManufacturer(partRef);
      }
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
        <h3 className="text-lg font-medium mb-2">Aucune information trouvée pour {partReference}</h3>
        <p className="text-muted-foreground max-w-md mx-auto mb-6">
          Cette référence n'a pas pu être identifiée dans notre base de connaissances. Essayez d'ajouter plus de contexte comme le fabricant ou le type d'équipement.
        </p>
        
        <div className="flex flex-col gap-4 w-full max-w-md">
          <div className="flex gap-2">
            <Input 
              placeholder="Ajoutez un fabricant (ex: John Deere, Case IH)" 
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handlePrecise}>
              Préciser
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => handleSearch('google')}>
              Rechercher sur Google
            </Button>
            <Button variant="outline" onClick={() => handleSearch('tractorPart')}>
              Rechercher sur TractorPart
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => handleSearch('agriExpo')}>
              Rechercher sur AgriExpo
            </Button>
            <Button variant="outline" onClick={() => handleSearch('agriaffaires')}>
              Voir sur Agriaffaires
            </Button>
          </div>
        </div>
      </div>

      {/* Suggestions de recherches populaires */}
      <div className="mt-8 border-t pt-8">
        <h3 className="text-lg font-medium mb-4">Références populaires</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {POPULAR_PARTS.map(part => (
            <div 
              key={part.ref} 
              className="cursor-pointer p-4 border rounded-md hover:bg-accent/5"
              onClick={() => handlePartSelect(part.ref)}
            >
              <p className="font-medium">{part.name}</p>
              <p className="text-sm text-muted-foreground">Réf: {part.ref}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NoResultsFound;
