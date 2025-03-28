
import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Combobox, ComboboxOption } from '@/components/ui/combobox';

// Suggestions de fabricants pour aider l'utilisateur
const MANUFACTURER_SUGGESTIONS: ComboboxOption[] = [
  { label: "John Deere", value: "John Deere" },
  { label: "Case IH", value: "Case IH" },
  { label: "New Holland", value: "New Holland" },
  { label: "Kubota", value: "Kubota" },
  { label: "Massey Ferguson", value: "Massey Ferguson" },
  { label: "CLAAS", value: "CLAAS" },
  { label: "Fendt", value: "Fendt" },
  { label: "Deutz-Fahr", value: "Deutz-Fahr" },
  { label: "Valtra", value: "Valtra" },
  { label: "JCB", value: "JCB" },
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

  const handleManufacturerSelect = (value: string) => {
    setManufacturer(value);
    
    if (value && onRetryWithManufacturer) {
      onRetryWithManufacturer(value);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
      <h3 className="text-lg font-medium mb-2">Aucune information trouvée pour {partReference}</h3>
      <p className="text-muted-foreground max-w-md mx-auto mb-6">
        Cette référence n'a pas pu être identifiée dans notre base de connaissances. Essayez d'ajouter plus de contexte comme le fabricant ou le type d'équipement.
      </p>
      
      <div className="flex flex-col gap-4 w-full max-w-md">
        <div className="flex gap-2">
          <Combobox
            options={MANUFACTURER_SUGGESTIONS}
            placeholder="Sélectionnez un fabricant"
            onSelect={handleManufacturerSelect}
            className="flex-1"
          />
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
  );
};

export default NoResultsFound;
