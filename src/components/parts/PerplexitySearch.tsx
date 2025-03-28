
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import PerplexityChat from './PerplexityChat';
import PerplexitySuggestions from './perplexity/PerplexitySuggestions';
import PerplexitySearchForm from './perplexity/PerplexitySearchForm';
import PerplexityLoading from './perplexity/PerplexityLoading';
import PerplexityError from './perplexity/PerplexityError';
import PerplexityResults from './perplexity/PerplexityResults';
import { usePerplexitySearch } from '@/hooks/parts/usePerplexitySearch';

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
    handleSearch,
    handleRetryWithManufacturer
  } = usePerplexitySearch();

  const handleSuggestionClick = (part: {ref: string, name: string, manufacturer: string}) => {
    setSearchQuery(part.ref);
    setManufacturer(part.manufacturer);
    handleSearch(`${part.ref} ${part.manufacturer}`);
  };

  return (
    <div className="space-y-6">
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
