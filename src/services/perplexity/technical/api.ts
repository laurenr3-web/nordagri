
import { perplexityClient } from '@/services/perplexity/client';
import { PerplexityTechnicalResponse } from './types';
import { toast } from 'sonner';

export async function fetchTechnicalInfo(partReference: string, partName?: string): Promise<PerplexityTechnicalResponse> {
  try {
    console.log('Récupération des informations techniques pour:', partReference);
    
    // Vérifier si la clé API est configurée
    const apiKey = import.meta.env.VITE_PERPLEXITY_API_KEY;
    if (!apiKey) {
      throw new Error("Clé API Perplexity non configurée");
    }
    
    const nameInfo = partName ? `, nom: ${partName}` : '';
    
    const response = await perplexityClient.post('/chat/completions', {
      model: "llama-3.1-sonar-small-128k-online",
      messages: [
        {
          role: "system",
          content: "Vous êtes un expert en pièces détachées agricoles avec une connaissance approfondie des nomenclatures, numéros de référence et spécifications techniques. Fournissez vos réponses au format JSON avec la structure suivante: { \"function\": \"description détaillée\", \"compatibleEquipment\": [\"liste\", \"équipements\"], \"installation\": \"guide d'installation\", \"symptoms\": \"symptômes\", \"maintenance\": \"conseils\", \"alternatives\": [\"pièces alternatives\"], \"warnings\": \"avertissements\" }. Si vous ne connaissez pas certains détails, utilisez \"Information non disponible\" comme valeur."
        },
        {
          role: "user",
          content: `Recherchez des informations complètes sur la pièce agricole avec la référence ${partReference}${nameInfo}. 
          Si possible, identifiez le fabricant, le type de machine (tracteur, moissonneuse, etc.), 
          la fonction exacte de cette pièce, les procédures d'installation, 
          les signes de défaillance et les recommandations d'entretien. 
          Si vous ne trouvez pas d'informations spécifiques sur cette référence exacte, suggérez des informations 
          sur des pièces similaires ou des catégories compatibles.
          
          IMPORTANT: Votre réponse doit être UNIQUEMENT un objet JSON valide, sans texte supplémentaire avant ou après.`
        }
      ],
      temperature: 0.2,
      max_tokens: 1000
    });
    
    return {
      content: response.data.choices[0].message.content,
      status: 'success'
    };
    
  } catch (error) {
    console.error("Erreur lors de la récupération des informations techniques:", error);
    
    if (error.response) {
      console.error("Données de l'erreur:", error.response.data);
      
      const errorMessage = error.response.data?.error?.message || "Détails non disponibles";
      toast.error(`Erreur API Perplexity (${error.response.status})`, { 
        description: errorMessage
      });
      
      return {
        content: '',
        status: 'error',
        error: `Erreur API: ${errorMessage}`
      };
    }
    
    return {
      content: '',
      status: 'error',
      error: error.message || "Une erreur inconnue est survenue"
    };
  }
}
