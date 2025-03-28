import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { partsSearchService } from '@/services/perplexity/partsSearchService';
import { Part } from '@/types/Part';

interface PartSearchProps {
  onAddPartToInventory: (part: Part) => void;
}

const PartSearch = ({ onAddPartToInventory }: PartSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Part[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Veuillez entrer un terme de recherche');
      return;
    }

    setIsSearching(true);
    setShowResults(true);
    
    try {
      const results = await partsSearchService.searchParts(searchQuery);
      setSearchResults(results);
      
      if (results.length === 0) {
        toast.info('Aucun résultat trouvé pour cette recherche');
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      toast.error('Erreur lors de la recherche de pièces', {
        description: error instanceof Error ? error.message : 'Une erreur inconnue est survenue'
      });
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddToInventory = (part: Part) => {
    // Ensure the part has compatible ID type before adding it to inventory
    const processedPart: Part = {
      ...part,
      // Keep the ID as is since our Part interface now supports string | number
      id: part.id,
      // Ensure these fields exist for consistency
      isFromSearch: true
    };
    
    onAddPartToInventory(processedPart);
    toast.success(`${part.name} ajouté à l'inventaire`);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 w-full">
        <Input
          placeholder="Rechercher une pièce par nom, référence ou équipement..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1"
        />
        <Button 
          onClick={handleSearch} 
          disabled={isSearching}
          className="min-w-24"
        >
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Search className="h-4 w-4 mr-2" />
          )}
          Rechercher
        </Button>
      </div>

      {showResults && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              {isSearching 
                ? 'Recherche en cours...' 
                : `Résultats de recherche (${searchResults.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isSearching ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                <p className="text-muted-foreground">
                  Recherche de pièces et comparaison des prix...
                </p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucun résultat trouvé pour "{searchQuery}"
              </div>
            ) : (
              <div className="space-y-4">
                {searchResults.map((part) => (
                  <div key={part.id} className="border rounded-lg p-4 hover:bg-accent/5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{part.name}</h3>
                        <div className="text-sm text-muted-foreground space-y-1 mt-1">
                          <p>Référence: {part.partNumber || part.reference}</p>
                          <p>Fabricant: {part.manufacturer}</p>
                          <p>Compatible avec: {
                            Array.isArray(part.compatibility) 
                              ? part.compatibility.join(', ') 
                              : part.compatibility || part.compatibleWith
                          }</p>
                          {part.estimatedPrice && (
                            <p className="font-medium">
                              Prix estimé: {typeof part.estimatedPrice === 'number' 
                                ? `${part.estimatedPrice.toFixed(2)} €` 
                                : part.estimatedPrice}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleAddToInventory(part)}
                      >
                        Ajouter
                      </Button>
                    </div>
                    {part.description && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        <p>{part.description}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PartSearch;
