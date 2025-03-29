
import React, { useState } from 'react';
import { useOpenAISearch } from '@/hooks/parts/useOpenAISearch';
import { useOpenAIStatus } from '@/hooks/parts/useOpenAIStatus';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ArchiveIcon, Search } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Part } from '@/types/Part';

// Define interface for the technical info returned by OpenAI
interface PartTechnicalInfo {
  name: string;
  reference: string;
  category: string;
  compatibleWith: string[];
  manufacturer: string;
  price: number;
  imageUrl: string;
  // Add other properties that might come from OpenAI
}

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
    
    // Cast to the correct type
    const techInfo = openAISearch.technicalInfo as unknown as PartTechnicalInfo;
    
    // Créer un objet Part à partir des données trouvées
    const newPart: Part = {
      id: Date.now().toString(), // ID temporaire
      name: techInfo.name || searchQuery,
      partNumber: techInfo.reference || searchQuery,
      category: techInfo.category || 'Non classé',
      compatibility: techInfo.compatibleWith || [],
      manufacturer: techInfo.manufacturer || 'Non spécifié',
      price: typeof techInfo.price === 'number' 
        ? techInfo.price 
        : 0,
      stock: 0,
      location: 'Non spécifié',
      reorderPoint: 1,
      image: techInfo.imageUrl || '/placeholder.svg'
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
              <Search className="h-4 w-4 mr-2" />
              Rechercher
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {/* Add the rest of your search UI here */}
    </div>
  );
};

export default PartSearch;
