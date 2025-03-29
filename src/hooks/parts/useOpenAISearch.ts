
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { openai } from '@/services/openai/client';
import { checkApiKey } from '@/services/openai/client';
import { Part } from '@/types/Part';

// Define the interface for technical info returned from OpenAI
export interface PartTechnicalInfo {
  name: string;
  reference: string;
  category: string;
  compatibleWith: string[];
  manufacturer: string;
  price: number;
  imageUrl: string;
  function?: string;
  installation?: string;
  symptoms?: string;
  maintenance?: string;
  warnings?: string;
  alternatives?: string[];
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
    
    // Vérifier si la clé API est configurée
    if (!checkApiKey()) {
      setError("Clé API OpenAI manquante ou invalide");
      toast({
        title: "Configuration requise",
        description: "Clé API OpenAI manquante. Configurez VITE_OPENAI_API_KEY dans .env.development",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Recherche de pièce:', query);
      
      // Construire le prompt pour OpenAI
      const prompt = `
        Recherchez des informations techniques pour la pièce agricole avec la référence: ${query}
        
        Fournissez les informations suivantes au format JSON:
        - name: nom complet de la pièce
        - reference: référence ou numéro de pièce
        - category: catégorie (filtre, moteur, hydraulique, etc.)
        - compatibleWith: tableau des équipements compatibles
        - manufacturer: fabricant probable
        - price: prix estimé en euros (nombre)
        - imageUrl: laisser vide (sera ajouté manuellement)
        - function: fonction principale et utilisation de la pièce
        - installation: instructions d'installation
        - symptoms: symptômes de défaillance
        - maintenance: recommandations d'entretien
        
        Si vous n'êtes pas certain, faites une estimation basée sur le format de la référence.
      `;
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Vous êtes un expert en pièces détachées agricoles. Répondez uniquement au format JSON demandé."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      });
      
      const content = response.choices[0].message.content;
      console.log('Réponse OpenAI:', content);
      
      try {
        const result = JSON.parse(content);
        setTechnicalInfo({
          name: result.name || `Pièce ${query}`,
          reference: result.reference || query,
          category: result.category || "Non classé",
          compatibleWith: Array.isArray(result.compatibleWith) ? result.compatibleWith : [],
          manufacturer: result.manufacturer || "Non spécifié",
          price: typeof result.price === 'number' ? result.price : 0,
          imageUrl: "https://images.unsplash.com/photo-1642742381109-81e94659e783?q=80&w=500&auto=format&fit=crop",
          function: result.function || "",
          installation: result.installation || "",
          symptoms: result.symptoms || "",
          maintenance: result.maintenance || "",
          warnings: result.warnings || "",
          alternatives: Array.isArray(result.alternatives) ? result.alternatives : []
        });
        
        toast({
          title: "Recherche réussie",
          description: `Informations trouvées pour: ${result.name || query}`,
        });
      } catch (parseError) {
        console.error("Erreur de parsing JSON:", parseError, content);
        setError("Impossible de traiter la réponse");
        toast({
          title: "Erreur de format",
          description: "Le format de la réponse est invalide",
          variant: "destructive",
        });
      }
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
