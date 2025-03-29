
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import PerplexityChat from './PerplexityChat';
import PerplexitySuggestions from './perplexity/PerplexitySuggestions';
import PerplexitySearchForm from './perplexity/PerplexitySearchForm';
import PerplexityLoading from './perplexity/PerplexityLoading';
import PerplexityError from './perplexity/PerplexityError';
import PerplexityResults from './perplexity/PerplexityResults';
import { usePerplexitySearch } from '@/hooks/parts/usePerplexitySearch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

const PerplexitySearch = () => {
  const [mainTab, setMainTab] = useState('search');
  const {
    searchQuery,
    setSearchQuery,
    manufacturer,
    setManufacturer,
    results,
    isLoading,
    error,
    activeTab,
    setActiveTab,
    isApiKeyValid,
    selectedCategory,
    handleSearch,
    handleRetryWithManufacturer,
    handleCategorySelect
  } = usePerplexitySearch();

  const handleSuggestionClick = (part: {ref: string, name: string, manufacturer: string}) => {
    setSearchQuery(part.ref);
    setManufacturer(part.manufacturer);
    handleSearch(`${part.ref} ${part.manufacturer}`);
  };

  return (
    <div className="space-y-6">
      <Alert variant="default" className="bg-blue-50 text-blue-800 border-blue-200">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Ce module utilise l'API Perplexity pour rechercher des informations techniques sur les pièces agricoles.
          Assurez-vous d'avoir configuré votre clé API dans .env.development.
        </AlertDescription>
      </Alert>
      
      <Tabs value={mainTab} onValueChange={setMainTab} className="w-full">
        <TabsList className="w-full justify-start mb-6">
          <TabsTrigger value="search">Recherche de pièces</TabsTrigger>
          <TabsTrigger value="chat">Conversation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="search">
          <div className="space-y-4">
            <PerplexitySuggestions onSuggestionClick={handleSuggestionClick} />
            
            <PerplexitySearchForm
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              manufacturer={manufacturer}
              setManufacturer={setManufacturer}
              handleSearch={() => handleSearch()}
              isLoading={isLoading}
              selectedCategory={selectedCategory || undefined}
              onCategorySelect={handleCategorySelect}
              isApiKeyValid={isApiKeyValid}
            />
          </div>

          {error && <PerplexityError error={error} />}

          {isLoading && <PerplexityLoading />}

          {results && !error && !isLoading && (
            <PerplexityResults 
              results={results} 
              searchQuery={searchQuery}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onRetryWithManufacturer={handleRetryWithManufacturer}
            />
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
