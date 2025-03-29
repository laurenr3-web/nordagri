
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

// Define the interface for technical info returned from OpenAI
export interface PartTechnicalInfo {
  name: string;
  reference: string;
  category: string;
  compatibleWith: string[];
  manufacturer: string;
  price: number;
  imageUrl: string;
  // Add other properties that might be returned
}

export const useOpenAISearch = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [technicalInfo, setTechnicalInfo] = useState<PartTechnicalInfo | null>(null);
  
  const searchPart = async (query: string) => {
    if (!query.trim()) {
      setError("Veuillez saisir une référence de pièce");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate a search response for now
      // In a real implementation, this would call the OpenAI API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock result
      const mockResult: PartTechnicalInfo = {
        name: `Pièce ${query}`,
        reference: query,
        category: "Filtres",
        compatibleWith: ["John Deere 8R", "John Deere 7R"],
        manufacturer: "John Deere",
        price: 99.99,
        imageUrl: "https://images.unsplash.com/photo-1642742381109-81e94659e783?q=80&w=500&auto=format&fit=crop"
      };
      
      setTechnicalInfo(mockResult);
      
    } catch (err: any) {
      console.error("Erreur lors de la recherche:", err);
      setError(err.message || "Erreur lors de la recherche");
      toast({
        title: "Échec de la recherche",
        description: err.message || "Impossible de trouver des informations sur cette pièce",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    isLoading,
    error,
    technicalInfo,
    searchPart
  };
};
