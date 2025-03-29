
import { openai, checkApiKey } from '../openai/client';
import { toast } from 'sonner';

export async function getPartInfo(partNumber: string, context?: string, categories: string[] = []): Promise<any> {
  try {
    // Vérifier la clé API
    if (!checkApiKey()) {
      toast.error('Clé API OpenAI manquante', {
        description: 'Configurez VITE_OPENAI_API_KEY dans votre .env.development'
      });
      return null;
    }

    console.log(`🔍 Recherche d'informations pour la pièce: ${partNumber}`);
    console.log(`📋 Contexte: ${context || 'Non spécifié'}`);
    console.log(`🏷️ Catégories identifiées: ${categories.join(', ') || 'Aucune'}`);
    
    // Construction du prompt avec contexte et catégories
    const categoryInfo = categories.length > 0 
      ? `Cette pièce appartient probablement à la catégorie: ${categories.join(' ou ')}.` 
      : '';
      
    const contextPrompt = context 
      ? `Contexte additionnel sur la pièce: ${context}.`
      : '';
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Vous êtes un expert en pièces détachées agricoles. Répondez en français avec des informations techniques précises et structurées."
        },
        {
          role: "user",
          content: `
Je recherche des informations techniques précises sur une pièce agricole avec la référence: ${partNumber}.
${contextPrompt}
${categoryInfo}

Fournissez les informations techniques structurées suivantes si possible:
1. Fonction principale de la pièce
2. Instructions d'installation/montage
3. Symptômes de défaillance ou d'usure
4. Conseils de maintenance
5. Avertissements ou précautions d'utilisation
6. Équipements compatibles

Si vous n'êtes pas sûr d'une information, indiquez-le clairement.`
        }
      ],
      response_format: { type: "json_object" }
    });
    
    // Le parsing est simplifié puisque OpenAI retourne directement du JSON valide
    const result = JSON.parse(response.choices[0].message.content);
    console.log("Résultat OpenAI:", result);
    
    return result;
  } catch (error) {
    console.error("Erreur API OpenAI:", error);
    toast.error("Erreur de recherche", {
      description: error.message || "Une erreur est survenue lors de la recherche"
    });
    
    return {
      function: `Erreur lors de la recherche: ${error.message}`,
      installation: "Information non disponible",
      symptoms: "Information non disponible",
      maintenance: "Information non disponible",
      warnings: "Information non disponible",
      compatibleEquipment: []
    };
  }
}
