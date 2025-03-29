
import { useState } from 'react';
import { identifyPartFromImage } from '@/services/openai/partVisionService';
import { toast } from 'sonner';

export interface IdentifiedPartResult {
  probableName: string;
  referenceNumber?: string;
  manufacturer?: string;
  description: string;
  type: string;
  possibleUses: string[];
  confidence: 'high' | 'medium' | 'low';
}

export function usePartVisionIdentification() {
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [identifiedPart, setIdentifiedPart] = useState<IdentifiedPartResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const identifyPart = async (imageBase64: string): Promise<IdentifiedPartResult | null> => {
    setIsIdentifying(true);
    setError(null);
    
    try {
      toast.info("Analyse de l'image en cours", {
        description: "L'IA examine l'image pour identifier la pièce...",
        duration: 3000,
      });
      
      const result = await identifyPartFromImage(imageBase64);
      setIdentifiedPart(result);
      
      toast.success("Pièce identifiée", {
        description: `Identification: ${result.probableName}`,
      });
      
      return result;
    } catch (err) {
      console.error("Erreur d'identification:", err);
      const errorMsg = err instanceof Error ? err.message : "Erreur inconnue";
      setError(errorMsg);
      
      toast.error("Échec de l'identification", {
        description: "Impossible d'analyser l'image. Veuillez réessayer.",
      });
      
      return null;
    } finally {
      setIsIdentifying(false);
    }
  };

  return {
    identifyPart,
    isIdentifying,
    identifiedPart,
    error,
    resetIdentification: () => {
      setIdentifiedPart(null);
      setError(null);
    }
  };
}
