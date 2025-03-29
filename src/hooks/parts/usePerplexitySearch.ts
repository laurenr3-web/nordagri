
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { partsTechnicalService } from '@/services/perplexity/partsTechnicalService';
import { checkApiKey, testPerplexityConnection, simplePerplexityQuery } from '@/services/perplexity/client';
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
  const [isApiKeyValid, setIsApiKeyValid] = useState<boolean | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Vérifier la validité de la clé API au chargement
  useEffect(() => {
    const checkConnection = async () => {
      const hasApiKey = checkApiKey();
      
      if (hasApiKey) {
        console.log("🔑 Clé API présente, test de connexion...");
        const isConnected = await testPerplexityConnection();
        setIsApiKeyValid(isConnected);
        
        if (isConnected) {
          console.log("✅ Connexion Perplexity établie");
        } else {
          console.error("❌ Connexion Perplexity échouée");
          toast.error("Problème de connexion API", {
            description: "Impossible d'établir une connexion avec Perplexity"
          });
        }
      } else {
        setIsApiKeyValid(false);
        console.error("❌ Clé API manquante");
      }
    };
    
    checkConnection();
  }, []);

  const handleSearch = async (suggestionValue?: string) => {
    const query = suggestionValue || searchQuery;
    
    if (!query.trim()) {
      toast.error('Veuillez entrer un numéro de pièce');
      return;
    }
    
    // Vérifier la clé API
    if (!checkApiKey()) {
      const errorMessage = "Clé API Perplexity manquante. Configurez VITE_PERPLEXITY_API_KEY dans .env.development";
      toast.error(errorMessage);
      setError(errorMessage);
      return;
    }
    
    // Référence et fabricant pour la recherche
    let partRef = query.trim();
    let partManufacturer = manufacturer;
    
    setIsLoading(true);
    setError(null);
    console.log(`🔍 Recherche: "${partRef}" (Fabricant: ${partManufacturer || 'non spécifié'})`);
    
    try {
      // Identifier la catégorie
      const { categories, manufacturers } = identifyPartCategory(partRef);
      console.log('📋 Catégories identifiées:', categories);
      console.log('🏭 Fabricants potentiels:', manufacturers);
      
      // Si catégorie sélectionnée via bouton, la prioritiser
      if (selectedCategory) {
        console.log(`🏷️ Catégorie sélectionnée manuellement: ${selectedCategory}`);
      }
      
      // Utiliser le fabricant identifié si non spécifié
      if (!partManufacturer && manufacturers.length > 0) {
        partManufacturer = manufacturers[0];
        console.log(`🏭 Fabricant auto-identifié: ${partManufacturer}`);
      }
      
      // Enrichir le contexte
      let contextInfo = partManufacturer 
        ? `${partRef} (${partManufacturer})` 
        : partRef;
        
      if (selectedCategory) {
        contextInfo += ` - ${selectedCategory}`;
      }
      
      console.log(`🔍 Contexte enrichi: "${contextInfo}"`);
      
      // Recherche d'informations techniques simplifiée
      setActiveTab('technical'); // Forcer l'onglet technique
      
      const technicalInfo = await partsTechnicalService.getPartInfo(
        partRef, 
        contextInfo,
        [...categories, selectedCategory].filter(Boolean) as string[]
      );
      
      // Recherche de prix simplifiée (pour l'instant données statiques)
      const priceData = [
        {
          supplier: "AgriStore",
          price: "85,99 €",
          currency: "EUR",
          link: "#",
          isAvailable: true,
          availability: "En stock",
          deliveryTime: "2-3 jours",
          lastUpdated: new Date().toISOString()
        }
      ];
      
      console.log('✅ Résultats reçus:');
      console.log('- Infos techniques:', technicalInfo);
      
      setResults({ 
        priceData, 
        technicalInfo
      });
      
      if (technicalInfo) {
        toast.success('Recherche terminée avec succès');
      } else {
        toast.error('Aucun résultat trouvé');
        setError('Aucune information récupérée. Vérifiez la référence ou essayez avec plus de détails.');
      }
    } catch (error) {
      console.error('❌ Erreur de recherche:', error);
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
    const extractedManufacturer = manufacturerValue.split(' ')[0] || '';
    console.log(`🔄 Nouvelle tentative avec fabricant: "${extractedManufacturer}"`);
    setManufacturer(extractedManufacturer);
    handleSearch(extractedManufacturer + ' ' + searchQuery);
  };

  const handleCategorySelect = (category: string) => {
    console.log(`🏷️ Catégorie sélectionnée: ${category}`);
    setSelectedCategory(category);
    // Construire une requête enrichie avec la catégorie
    handleSearch(`${searchQuery} ${category}`);
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
    isApiKeyValid,
    selectedCategory,
    setSelectedCategory,
    handleSearch,
    handleRetryWithManufacturer,
    handleCategorySelect
  };
};
