
import React, { useState } from 'react';
import { useOpenAISearch } from '@/hooks/parts/useOpenAISearch';
import { useOpenAIStatus } from '@/hooks/parts/useOpenAIStatus';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ArchiveIcon, Plus, Search, Loader2 } from 'lucide-react';
import { Part } from '@/types/Part';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

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
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Rechercher
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {openAISearch.isLoading && (
        <div className="flex flex-col items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin mb-2" />
          <p className="text-muted-foreground">Recherche des informations techniques en cours...</p>
        </div>
      )}
      
      {openAISearch.error && hasSearched && !openAISearch.isLoading && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur lors de la recherche</AlertTitle>
          <AlertDescription>{openAISearch.error}</AlertDescription>
        </Alert>
      )}
      
      {openAISearch.technicalInfo && !openAISearch.isLoading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <div>{openAISearch.technicalInfo.name}</div>
              <Badge variant="outline">{openAISearch.technicalInfo.reference}</Badge>
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="technical">Informations techniques</TabsTrigger>
                <TabsTrigger value="compatibility">Compatibilité</TabsTrigger>
              </TabsList>
              
              <TabsContent value="technical" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-1">Fabricant</h3>
                    <p>{openAISearch.technicalInfo.manufacturer}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Catégorie</h3>
                    <p>{openAISearch.technicalInfo.category}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Prix estimé</h3>
                    <p className="font-medium text-green-600 dark:text-green-400">
                      {openAISearch.technicalInfo.price.toFixed(2)} €
                    </p>
                  </div>
                </div>
                
                {openAISearch.technicalInfo.function && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-1">Fonction</h3>
                    <p className="text-sm">{openAISearch.technicalInfo.function}</p>
                  </div>
                )}
                
                {openAISearch.technicalInfo.installation && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-1">Installation</h3>
                    <p className="text-sm">{openAISearch.technicalInfo.installation}</p>
                  </div>
                )}
                
                {openAISearch.technicalInfo.symptoms && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-1">Symptômes de défaillance</h3>
                    <p className="text-sm">{openAISearch.technicalInfo.symptoms}</p>
                  </div>
                )}
                
                {openAISearch.technicalInfo.maintenance && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-1">Maintenance</h3>
                    <p className="text-sm">{openAISearch.technicalInfo.maintenance}</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="compatibility">
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Équipements compatibles</h3>
                  {openAISearch.technicalInfo.compatibleWith && openAISearch.technicalInfo.compatibleWith.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {openAISearch.technicalInfo.compatibleWith.map((equipment, i) => (
                        <Badge key={i} variant="secondary">{equipment}</Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Aucune information de compatibilité disponible</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter className="flex justify-end">
            <Button onClick={handleAddToInventory}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter à l'inventaire
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {!openAISearch.technicalInfo && !openAISearch.isLoading && hasSearched && !openAISearch.error && (
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle>Aucun résultat</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <ArchiveIcon className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-center text-muted-foreground mb-4">
              Aucune information trouvée pour la référence "{searchQuery}".
            </p>
            <div className="space-y-2">
              <p className="text-sm font-medium">Essayez avec un fabricant spécifique:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleRetryWithManufacturer('John Deere')}
                >
                  John Deere
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleRetryWithManufacturer('Case IH')}
                >
                  Case IH
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleRetryWithManufacturer('New Holland')}
                >
                  New Holland
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PartSearch;
