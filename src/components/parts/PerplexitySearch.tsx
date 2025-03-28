
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { partsPriceService } from '@/services/perplexity/partsPriceService';
import { partsTechnicalService } from '@/services/perplexity/partsTechnicalService';
import { TechnicalInfoDisplay } from './displays/TechnicalInfoDisplay';
import { PriceComparisonDisplay } from './displays/PriceComparisonDisplay';
import { checkApiKey } from '@/services/perplexity/client';
import PerplexityChat from './PerplexityChat';

const PerplexitySearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<{
    priceData: any[] | null;
    technicalInfo: any | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Veuillez entrer un numéro de pièce');
      return;
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
      // Combine les deux types de recherche en une seule requête
      const [priceData, technicalInfo] = await Promise.all([
        partsPriceService.findBestPrices(searchQuery),
        partsTechnicalService.getPartInfo(searchQuery)
      ]);
      
      setResults({ priceData, technicalInfo });
      toast.success('Recherche terminée avec succès');
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

  return (
    <div className="space-y-6">
      <Tabs defaultValue="search" className="w-full">
        <TabsList className="w-full justify-start mb-6">
          <TabsTrigger value="search">Recherche de pièces</TabsTrigger>
          <TabsTrigger value="chat">Conversation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="search">
          <div className="flex gap-2">
            <Input
              placeholder="Entrez un numéro de pièce (ex: JD6850)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
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

          {error && (
            <div className="p-4 border border-destructive/20 rounded-md bg-destructive/10 text-destructive mt-4">
              <p>{error}</p>
            </div>
          )}

          {results && !error && (
            <Tabs defaultValue="technical" className="w-full mt-6">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="technical">Informations techniques</TabsTrigger>
                <TabsTrigger value="prices">Comparaison de prix</TabsTrigger>
              </TabsList>
              <TabsContent value="technical">
                <TechnicalInfoDisplay data={results.technicalInfo} />
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
