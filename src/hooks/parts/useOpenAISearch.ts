
import { useState } from 'react';
import { getPartInfo, PartTechnicalInfo } from '@/services/parts/openaiPartService';

export function useOpenAISearch() {
  const [isLoading, setIsLoading] = useState(false);
  const [technicalInfo, setTechnicalInfo] = useState<PartTechnicalInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const searchPart = async (partNumber: string) => {
    if (!partNumber.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const info = await getPartInfo(partNumber.trim());
      setTechnicalInfo(info);
    } catch (err) {
      console.error("Erreur de recherche:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setTechnicalInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    technicalInfo,
    error,
    searchPart
  };
}

// Ajout d'une exportation par défaut pour éviter les problèmes similaires
export default useOpenAISearch;
