
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search, Tag } from 'lucide-react';
import { identifyPartCategory } from '@/utils/partCategoryIdentifier';
import { Card, CardContent } from '@/components/ui/card';

interface PerplexitySearchFormProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  manufacturer: string;
  setManufacturer: (value: string) => void;
  handleSearch: () => void;
  isLoading: boolean;
}

const PerplexitySearchForm: React.FC<PerplexitySearchFormProps> = ({
  searchQuery,
  setSearchQuery,
  manufacturer,
  setManufacturer,
  handleSearch,
  isLoading
}) => {
  const [identifiedCategories, setIdentifiedCategories] = useState<string[]>([]);
  
  // Identification automatique du fabricant et des catégories lors de la saisie
  const handlePartNumberChange = (value: string) => {
    setSearchQuery(value);
    
    if (value.length > 3) {
      const { manufacturers, categories } = identifyPartCategory(value);
      
      // Mise à jour des catégories identifiées
      setIdentifiedCategories(categories);
      
      // Si le fabricant n'est pas déjà spécifié, essayer de l'identifier
      if (!manufacturer && manufacturers.length > 0) {
        setManufacturer(manufacturers[0]);
      }
    } else {
      setIdentifiedCategories([]);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          placeholder="Entrez un numéro de pièce (ex: JD6850)"
          value={searchQuery}
          onChange={(e) => handlePartNumberChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1"
        />
        <Input
          placeholder="Fabricant (optionnel)"
          value={manufacturer}
          onChange={(e) => setManufacturer(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1 sm:max-w-[200px]"
        />
        <Button onClick={handleSearch} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Search className="h-4 w-4 mr-2" />
          )}
          Rechercher
        </Button>
      </div>
      
      {identifiedCategories.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-3">
            <div className="flex items-start">
              <Tag className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800">
                  Catégorie probable : {identifiedCategories.join(" ou ")}
                </p>
                <p className="text-sm text-blue-600">
                  Basée sur l'analyse du format de référence
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PerplexitySearchForm;
