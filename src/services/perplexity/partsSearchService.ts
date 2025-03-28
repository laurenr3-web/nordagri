
import { perplexityClient } from '@/services/perplexity/client';
import { Part, PartPriceInfo } from '@/types/Part';
import { toast } from 'sonner';

export const partsSearchService = {
  // Rechercher des pièces par description ou référence
  async searchParts(query: string): Promise<Part[]> {
    try {
      console.log('Démarrage de la recherche pour:', query);
      
      // Vérifier si la clé API est configurée
      const apiKey = import.meta.env.VITE_PERPLEXITY_API_KEY;
      if (!apiKey) {
        console.error("Clé API Perplexity non configurée");
        toast.error("Configuration API manquante", {
          description: "Veuillez configurer une clé API Perplexity dans vos variables d'environnement."
        });
        return [];
      }
      
      const response = await perplexityClient.post('/chat/completions', {
        model: "sonar-medium-online",
        messages: [
          {
            role: "system",
            content: "Vous êtes un assistant spécialisé dans les pièces détachées agricoles. Retournez les informations au format JSON."
          },
          {
            role: "user",
            content: `Recherchez des informations sur la pièce agricole suivante: ${query}. Incluez la référence, le nom, la description, la compatibilité et si possible le prix estimé.`
          }
        ],
        temperature: 0.2
      });
      
      console.log('Réponse API reçue:', response.status);
      
      // Extraction et transformation des données du format JSON
      const content = response.data.choices[0].message.content;
      let parsedData;
      try {
        // Essayer d'extraire le JSON de la réponse
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                          content.match(/```\n([\s\S]*?)\n```/) ||
                          content.match(/{[\s\S]*?}/);
                          
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[0].replace(/```json\n|```\n|```/g, ''));
        } else {
          // Si pas de bloc JSON explicite, essayer de parser toute la réponse
          parsedData = JSON.parse(content);
        }
        
        console.log('Données JSON extraites avec succès');
      } catch (parseError) {
        console.error("Erreur lors du parsing de la réponse JSON:", parseError);
        console.log("Contenu de la réponse:", content);
        
        // Format de secours si le parsing échoue
        parsedData = { 
          results: [{ 
            name: query, 
            description: content,
            reference: "N/A",
            compatibleWith: "Inconnu",
            estimatedPrice: "Inconnu"
          }] 
        };
      }
      
      // S'assurer que parsedData.results existe
      if (!parsedData.results) {
        parsedData = { results: [parsedData] };
      }
      
      // Transformer en format utilisable par l'application
      return parsedData.results.map((item: any) => ({
        id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name: item.name || "Sans nom",
        partNumber: item.reference || item.partNumber || "N/A",
        category: item.category || "Non catégorisé",
        compatibility: item.compatibleWith || [],
        manufacturer: item.manufacturer || "Inconnu",
        price: 0,
        stock: 0,
        location: "",
        reorderPoint: 0,
        image: item.imageUrl || "",
        description: item.description || "",
        reference: item.reference || item.partNumber || "N/A",
        compatibleWith: item.compatibleWith || [],
        estimatedPrice: item.estimatedPrice || item.price || null,
        inStock: false,
        isFromSearch: true, // Marquer comme provenant d'une recherche
        imageUrl: item.imageUrl || null
      }));
    } catch (error) {
      console.error("Erreur lors de la recherche de pièces:", error);
      
      // Afficher un message d'erreur plus détaillé
      if (error.response) {
        console.error("Données de l'erreur:", error.response.data);
        console.error("Statut:", error.response.status);
        
        if (error.response.status === 401) {
          toast.error("Erreur d'authentification API", { 
            description: "Vérifiez votre clé API Perplexity" 
          });
        } else {
          toast.error(`Erreur API (${error.response.status})`, { 
            description: error.response.data?.error?.message || "Détails non disponibles" 
          });
        }
      } else if (error.request) {
        console.error("Pas de réponse reçue:", error.request);
        toast.error("Impossible de contacter l'API", { 
          description: "Vérifiez votre connexion Internet" 
        });
      } else {
        toast.error("Erreur de recherche", { 
          description: error.message || "Une erreur inattendue est survenue" 
        });
      }
      
      return [];
    }
  },

  // Comparer les prix pour une pièce spécifique
  async comparePartPrices(partReference: string, partName: string, partManufacturer?: string): Promise<PartPriceInfo[]> {
    try {
      console.log('Démarrage de la comparaison de prix pour:', partReference, partName);
      
      // Vérifier si la clé API est configurée
      const apiKey = import.meta.env.VITE_PERPLEXITY_API_KEY;
      if (!apiKey) {
        console.error("Clé API Perplexity non configurée");
        return [];
      }
      
      const manufacturerInfo = partManufacturer ? `, fabricant: ${partManufacturer}` : '';
      
      const response = await perplexityClient.post('/chat/completions', {
        model: "sonar-medium-online",
        messages: [
          {
            role: "system",
            content: "Vous êtes un assistant spécialisé dans la recherche de prix de pièces détachées agricoles. Retournez les résultats au format JSON."
          },
          {
            role: "user",
            content: `Recherchez les prix actuels pour la pièce agricole avec la référence: ${partReference}, nom: ${partName}${manufacturerInfo}. Incluez le nom du fournisseur, le prix, le lien vers la page produit, et la disponibilité. Limitez-vous à 5 résultats maximum.`
          }
        ],
        temperature: 0.2
      });
      
      console.log('Réponse API reçue pour comparaison de prix');
      
      // Extraction des données JSON
      const content = response.data.choices[0].message.content;
      let parsedData;
      
      try {
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                          content.match(/```\n([\s\S]*?)\n```/) ||
                          content.match(/{[\s\S]*?}/);
                          
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[0].replace(/```json\n|```\n|```/g, ''));
        } else {
          parsedData = JSON.parse(content);
        }
        
        // S'assurer que parsedData.results existe
        if (!parsedData.results) {
          parsedData = { results: [parsedData] };
        }
      } catch (parseError) {
        console.error("Erreur lors du parsing des prix:", parseError);
        console.log("Contenu de la réponse:", content);
        return [];
      }
      
      // Transformer en format utilisable
      return (parsedData.results || []).map((item: any) => ({
        supplier: item.supplier || "Inconnu",
        price: item.price || "N/A",
        currency: item.currency || "EUR",
        link: item.link || null,
        isAvailable: item.isAvailable || item.availability || false,
        deliveryTime: item.deliveryTime || "Non spécifié",
        lastUpdated: new Date().toISOString()
      }));
    } catch (error) {
      console.error("Erreur lors de la comparaison des prix:", error);
      
      if (error.response) {
        console.error("Détails de l'erreur:", error.response.data);
      }
      
      return [];
    }
  }
};
