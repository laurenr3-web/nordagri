
import React, { useState } from 'react';
import { useOpenAISearch } from '@/hooks/parts/useOpenAISearch';
import { useOpenAIStatus } from '@/hooks/parts/useOpenAIStatus';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ArchiveIcon, Search } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Part } from '@/types/Part';
import PerplexityResults from './perplexity/PerplexityResults';

interface PartSearchProps {
  onAddPartToInventory: (part: Part) => void;
}

const PartSearch: React.FC<PartSearchProps> = ({ onAddPartToInventory }) => {
  const openAIStatus = useOpenAIStatus();
  const openAISearch = useOpenAISearch();
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [activeTab, setActiveTab] = useState('technical');
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setHasSearched(true);
    await openAISearch.searchPart(searchQuery);
  };
  
  const handleRetryWithManufacturer = (manufacturer: string) => {
    const newQuery = `${searchQuery} ${manufacturer}`;
    setSearchQuery(newQuery);
    openAISearch.searchPart(newQuery);
  };
  
  // Créer une partie à partir des résultats de recherche
  const handleAddToInventory = () => {
    if (!openAISearch.technicalInfo) return;
    
    // Créer un objet Part à partir des données trouvées
    const newPart: Part = {
      id: Date.now().toString(), // ID temporaire
      name: openAISearch.technicalInfo.name || searchQuery,
      partNumber: openAISearch.technicalInfo.reference || searchQuery,
      category: openAISearch.technicalInfo.category || 'Non classé',
      compatibility: openAISearch.technicalInfo.compatibleWith || [],
      manufacturer: openAISearch.technicalInfo.manufacturer || 'Non spécifié',
      price: typeof openAISearch.technicalInfo.price === 'number' 
        ? openAISearch.technicalInfo.price 
        : 0,
      stock: 0,
      location: 'Non spécifié',
      reorderPoint: 1,
      image: openAISearch.technicalInfo.imageUrl || '/placeholder.svg'
    };
    
    onAddPartToInventory(newPart);
  };
  
  // Afficher une alerte si la clé API n'est pas configurée
  if (!openAIStatus.isApiKeyValid && !openAIStatus.isConnecting) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Configuration requise</AlertTitle>
        <AlertDescription>
          Pour utiliser la recherche technique, vous devez configurer une clé API OpenAI.
          Ajoutez votre clé API dans le fichier .env.development avec la variable VITE_OPENAI_API_KEY.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Recherche de pièces</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex space-x-2">
            <Input
              type="text"
              placeholder="Référence de la pièce (ex: 1234567, RE12345)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={openAISearch.isLoading || !searchQuery.trim()}
            >
              {openAISearch.isLoading ? (
                <>Recherche en cours...</>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Rechercher
                </>
              )}
            </Button>
          </form>
          
          {openAISearch.technicalInfo && !openAISearch.isLoading && (
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={handleAddToInventory}
            >
              <ArchiveIcon className="mr-2 h-4 w-4" />
              Ajouter à mon inventaire
            </Button>
          )}
          
          {openAISearch.error && !openAISearch.isLoading && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>
                {openAISearch.error}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      {hasSearched && (
        <PerplexityResults
          results={{
            technicalInfo: openAISearch.technicalInfo
          }}
          searchQuery={searchQuery}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onRetryWithManufacturer={handleRetryWithManufacturer}
        />
      )}
    </div>
  );
};

export default PartSearch;
