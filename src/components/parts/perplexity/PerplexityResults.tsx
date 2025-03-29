
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TechnicalInfoDisplay } from '../displays/TechnicalInfoDisplay';
import { PriceComparisonDisplay } from '../displays/PriceComparisonDisplay';
import PriceComparisonTab from '../PriceComparisonTab';

interface PerplexityResultsProps {
  results: {
    priceData: any[] | null;
    technicalInfo: any | null;
  };
  searchQuery: string;
  activeTab: string;
  setActiveTab: (value: string) => void;
  onRetryWithManufacturer: (manufacturer: string) => void;
}

const PerplexityResults: React.FC<PerplexityResultsProps> = ({ 
  results, 
  searchQuery, 
  activeTab, 
  setActiveTab,
  onRetryWithManufacturer 
}) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
      <TabsList className="w-full justify-start">
        <TabsTrigger value="technical">Informations techniques</TabsTrigger>
        <TabsTrigger value="prices">Comparaison de prix (Perplexity)</TabsTrigger>
        <TabsTrigger value="prices-openai">Comparaison de prix (OpenAI)</TabsTrigger>
      </TabsList>
      <TabsContent value="technical">
        <TechnicalInfoDisplay 
          data={results.technicalInfo} 
          partReference={searchQuery}
          onRetryWithManufacturer={onRetryWithManufacturer}
        />
      </TabsContent>
      <TabsContent value="prices">
        <PriceComparisonDisplay data={results.priceData} />
      </TabsContent>
      <TabsContent value="prices-openai">
        <PriceComparisonTab 
          partNumber={searchQuery}
        />
      </TabsContent>
    </Tabs>
  );
};

export default PerplexityResults;
