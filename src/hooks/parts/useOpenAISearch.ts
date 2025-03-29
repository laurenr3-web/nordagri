
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
      
      // Construire un prompt plus détaillé pour OpenAI
      const prompt = `
        Vous êtes un expert en pièces détachées agricoles. Recherchez des informations précises et détaillées pour la pièce avec la référence: ${query}
        
        Fournissez les informations suivantes au format JSON:
        - name: nom complet de la pièce (soyez précis)
        - reference: référence exacte ou numéro de pièce
        - category: catégorie détaillée (filtre, moteur, hydraulique, transmission, etc.)
        - compatibleWith: tableau des modèles d'équipements précis compatibles
        - manufacturer: fabricant probable (marque reconnue dans le secteur agricole)
        - price: prix moyen en euros (nombre)
        - imageUrl: laisser vide pour le moment
        - function: description complète de la fonction de la pièce (minimum 200 caractères)
        - installation: instructions d'installation détaillées
        - symptoms: liste détaillée des symptômes de défaillance
        - maintenance: recommandations précises d'entretien
        - warnings: précautions importantes lors de l'utilisation/installation
        - alternatives: références de pièces alternatives compatibles
        
        Basez-vous sur des informations précises pour cette référence. Si vous n'êtes pas certain, analysez le format de la référence pour déterminer le fabricant probable et le type de pièce.
      `;
      
      // Utiliser gpt-3.5-turbo pour des résultats plus accessibles
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Vous êtes un expert en pièces détachées agricoles avec une connaissance approfondie des catalogues de pièces, des références et des spécifications techniques. Votre rôle est de fournir des informations précises et détaillées."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2 // Réduire la créativité pour des résultats plus factuels
      });
      
      const content = response.choices[0].message.content;
      console.log('Réponse détaillée OpenAI:', content);
      
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
