
import { useState } from 'react';
import { toast } from 'sonner';
import { perplexityPartsService } from '@/services/perplexity/parts';
import { partsTechnicalService } from '@/services/perplexity/partsTechnicalService';
import { checkApiKey } from '@/services/perplexity/client';
import { identifyPartCategory } from '@/utils/partCategoryIdentifier';

export const usePerplexitySearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [results, setResults] = useState<{
    priceData: any[] | null;
    technicalInfo: any | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('technical');

  const handleSearch = async (suggestionValue?: string) => {
    const query = suggestionValue || searchQuery;
    
    if (!query.trim()) {
      toast.error('Veuillez entrer un numéro de pièce');
      return;
    }
    
    // Transmettre la référence exactement comme saisie
    let partRef = query.trim();
    let partManufacturer = manufacturer;
    
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
      // Identifier la catégorie et le fabricant possible
      const { categories, manufacturers } = identifyPartCategory(partRef);
      
      // Si le fabricant n'est pas spécifié mais identifié, on l'utilise
      if (!partManufacturer && manufacturers.length > 0) {
        partManufacturer = manufacturers[0];
      }
      
      // Préparer le contexte enrichi
      const partContext = partManufacturer 
        ? `${partRef} (${partManufacturer})` 
        : partRef;
        
      // Combine les deux types de recherche en une seule requête
      const promises = [
        perplexityPartsService.comparePartPrices(partRef, partContext).catch(err => {
          console.error('Erreur lors de la recherche de prix:', err);
          return null;
        }),
        partsTechnicalService.getPartInfo(partRef, partContext, categories).catch(err => {
          console.error('Erreur lors de la recherche technique:', err);
          return null;
        })
      ];
      
      const [priceData, technicalInfo] = await Promise.all(promises);
      
      // Ensure priceData is an array if it's not null
      const safePrice = priceData ? (Array.isArray(priceData) ? priceData : []) : null;
      
      setResults({ 
        priceData: safePrice, 
        technicalInfo 
      });
      
      if (safePrice || technicalInfo) {
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
    setManufacturer(manufacturerValue.split(' ')[0] || '');
    handleSearch(manufacturerValue);
  };

  return {
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
  };
};
