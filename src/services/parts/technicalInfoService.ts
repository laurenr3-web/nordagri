
import { openai } from '../openai/client';
import { toast } from 'sonner';

export async function getPartTechnicalInfo(
  partReference: string,
  manufacturer?: string
): Promise<any> {
  try {
    const query = manufacturer 
      ? `Référence: ${partReference}, Fabricant: ${manufacturer}` 
      : `${partReference}`;
    
    console.log(`🔍 Recherche d'informations pour: ${query}`);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Vous êtes un expert en identification et documentation de pièces détachées agricoles. Fournissez des informations techniques détaillées sur les pièces en fonction des références ou descriptions fournies."
        },
        {
          role: "user",
          content: `Recherchez des informations techniques détaillées sur cette pièce: ${query}. Incluez les spécifications, les compatibilités, les symptômes de dysfonctionnement, les conseils d'installation et d'entretien. Répondez au format JSON.`
        }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });
    
    console.log("Réponse pour la recherche technique:", response.choices[0].message.content);
    
    const content = response.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error("Erreur lors de la recherche d'informations techniques:", error);
    toast.error("Erreur de recherche", {
      description: "Impossible de récupérer les informations techniques pour cette pièce."
    });
    throw error;
  }
}
