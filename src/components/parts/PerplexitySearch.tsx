
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2, Search, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { perplexityPartsService } from '@/services/perplexity/parts';
import { partsTechnicalService } from '@/services/perplexity/partsTechnicalService';
import { TechnicalInfoDisplay } from './displays/TechnicalInfoDisplay';
import { PriceComparisonDisplay } from './displays/PriceComparisonDisplay';
import { checkApiKey } from '@/services/perplexity/client';
import PerplexityChat from './PerplexityChat';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Combobox, ComboboxOption } from '@/components/ui/combobox';

// Suggestions prédéfinies pour la recherche de pièces
const SEARCH_SUGGESTIONS: ComboboxOption[] = [
  { label: "John Deere 0118-2672 - Filtre à huile", value: "JD0118-2672" },
  { label: "Case IH 0118-2672 - Capteur de pression", value: "CASE0118-2672" },
  { label: "Kubota 0118-2672 - Joint d'étanchéité", value: "KUB0118-2672" },
  { label: "John Deere RE504836 - Filtre à carburant", value: "RE504836" },
  { label: "Case IH 84475542 - Filtre à air", value: "84475542" },
  { label: "Kubota HH164-32430 - Courroie", value: "HH164-32430" },
  { label: "New Holland 87300041 - Capteur", value: "87300041" },
  { label: "Massey Ferguson 3595175M1 - Joint", value: "3595175M1" },
];

const PerplexitySearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [results, setResults] = useState<{
    priceData: any[] | null;
    technicalInfo: any | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (suggestionValue?: string) => {
    const query = suggestionValue || searchQuery;
    
    if (!query.trim()) {
      toast.error('Veuillez entrer un numéro de pièce');
      return;
    }
    
    // Si c'est une suggestion sélectionnée, extraire le numéro de référence
    let partRef = query;
    let partManufacturer = manufacturer;
    
    // Si suggestion au format "JD0118-2672", extraire le fabricant
    if (suggestionValue) {
      const suggestion = SEARCH_SUGGESTIONS.find(s => s.value === suggestionValue);
      if (suggestion) {
        // Extraire la référence du libellé (format: "John Deere 0118-2672 - Filtre à huile")
        const parts = suggestion.label.split(' - ')[0].split(' ');
        if (parts.length >= 2) {
          // Le dernier élément est la référence, les précédents forment le fabricant
          partRef = parts[parts.length - 1];
          partManufacturer = parts.slice(0, parts.length - 1).join(' ');
          
          // Mettre à jour les champs d'interface
          setSearchQuery(partRef);
          setManufacturer(partManufacturer);
        }
      }
    }
    
    // Vérifier si la clé API est configurée
    if (!checkApiKey()) {
      const errorMessage = "Clé API Perplexity manquante. Pour utiliser cette fonctionnalité, veuillez configurer la variable d'environnement VITE_PERPLEXITY_API_KEY.";
      toast.error(errorMessage);
      setError(errorMessage);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Préparer le nom avec le fabricant si disponible
      const currentManufacturer = partManufacturer || manufacturer;
      const partContext = currentManufacturer 
        ? `${partRef} (${currentManufacturer})` 
        : partRef;
        
      // Combine les deux types de recherche en une seule requête
      const promises = [
        perplexityPartsService.comparePartPrices(partRef, partContext).catch(err => {
          console.error('Erreur lors de la recherche de prix:', err);
          return null;
        }),
        partsTechnicalService.getPartInfo(partRef, partContext).catch(err => {
          console.error('Erreur lors de la recherche technique:', err);
          return null;
        })
      ];
      
      const [priceData, technicalInfo] = await Promise.all(promises);
      
      setResults({ priceData, technicalInfo });
      
      if (priceData || technicalInfo) {
        toast.success('Recherche terminée avec succès');
      } else {
        toast.error('Aucun résultat trouvé');
        setError('Aucune information n\'a pu être récupérée. Veuillez vérifier la référence et réessayer.');
      }
    } catch (error) {
      console.error('Erreur de recherche:', error);
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue';
      toast.error('Erreur lors de la recherche', {
        description: errorMessage
      });
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryWithManufacturer = (manufacturerValue: string) => {
    handleSearch(manufacturerValue);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="search" className="w-full">
        <TabsList className="w-full justify-start mb-6">
          <TabsTrigger value="search">Recherche de pièces</TabsTrigger>
          <TabsTrigger value="chat">Conversation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="search">
          <div className="space-y-4">
            <Combobox
              options={SEARCH_SUGGESTIONS}
              placeholder="Entrez une référence ou description..."
              onSelect={(value) => handleSearch(value)}
              emptyMessage="Aucune suggestion disponible"
              className="w-full"
            />
            
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                placeholder="Entrez un numéro de pièce (ex: JD6850)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
              <Button onClick={() => handleSearch()} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Rechercher
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="ml-2">Recherche en cours...</p>
            </div>
          )}

          {results && !error && !isLoading && (
            <Tabs defaultValue="technical" className="w-full mt-6">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="technical">Informations techniques</TabsTrigger>
                <TabsTrigger value="prices">Comparaison de prix</TabsTrigger>
              </TabsList>
              <TabsContent value="technical">
                <TechnicalInfoDisplay 
                  data={results.technicalInfo} 
                  partReference={searchQuery}
                  onRetryWithManufacturer={handleRetryWithManufacturer}
                />
              </TabsContent>
              <TabsContent value="prices">
                <PriceComparisonDisplay data={results.priceData} />
              </TabsContent>
            </Tabs>
          )}
        </TabsContent>
        
        <TabsContent value="chat">
          <PerplexityChat />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerplexitySearch;
