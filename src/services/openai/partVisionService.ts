
import { openai } from './client';

interface IdentifiedPart {
  probableName: string;
  referenceNumber?: string;
  manufacturer?: string;
  description: string;
  type: string;
  possibleUses: string[];
  confidence: 'high' | 'medium' | 'low';
}

export async function identifyPartFromImage(
  imageBase64: string
): Promise<IdentifiedPart> {
  try {
    // S'assurer que l'image est au bon format pour l'API
    const base64Data = imageBase64.startsWith('data:image')
      ? imageBase64
      : `data:image/jpeg;base64,${imageBase64}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Assurez-vous d'utiliser un modèle avec capacités vision
      max_tokens: 1000,
      messages: [
        {
          role: "system",
          content: "Vous êtes un expert en identification de pièces détachées agricoles. Analysez l'image pour identifier la pièce, sa fonction et, si possible, son numéro de référence. Répondez UNIQUEMENT au format JSON."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Identifiez cette pièce agricole à partir de l'image. Fournissez le plus d'informations possibles incluant:\n1. Nom probable de la pièce\n2. Type de pièce (filtre, capteur, joint, etc.)\n3. Fabricant probable\n4. Numéro de référence si visible\n5. Description et fonction\n6. Équipements potentiellement compatibles\n\nFormat JSON demandé."
            },
            {
              type: "image_url",
              image_url: {
                url: base64Data
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" }
    });
    
    console.log("Réponse Vision API:", response.choices[0].message.content);
    
    const content = response.choices[0].message.content;
    const parsedData = JSON.parse(content);
    
    return {
      probableName: parsedData.name || parsedData.probableName || "Pièce non identifiée",
      referenceNumber: parsedData.referenceNumber || parsedData.reference || undefined,
      manufacturer: parsedData.manufacturer || parsedData.brand || undefined,
      description: parsedData.description || parsedData.function || "Description non disponible",
      type: parsedData.type || parsedData.category || "Type non identifié",
      possibleUses: Array.isArray(parsedData.possibleUses || parsedData.compatibleEquipment) 
        ? (parsedData.possibleUses || parsedData.compatibleEquipment) 
        : [],
      confidence: parsedData.confidence || "medium"
    };
  } catch (error) {
    console.error("Erreur lors de l'identification de la pièce:", error);
    throw error;
  }
}
