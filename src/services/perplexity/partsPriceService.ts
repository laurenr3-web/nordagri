
import { perplexityClient } from '@/services/perplexity/client';
import { PartPriceInfo } from '@/types/Part';
import { toast } from 'sonner';

export type PriceComparisonItem = {
  vendor: string;
  price: number | string;
  currency: string;
  url?: string | null;
  availability: string;
  shippingCost?: number | string | null;
  estimatedDelivery: string;
};

export const partsPriceService = {
  // Rechercher les meilleurs prix pour une pièce spécifique
  async findBestPrices(partReference: string, partName?: string): Promise<PriceComparisonItem[]> {
    try {
      console.log('Démarrage de la recherche des prix pour:', partReference);
      
      // Vérifier si la clé API est configurée
      const apiKey = import.meta.env.VITE_PERPLEXITY_API_KEY;
      if (!apiKey) {
        console.error("Clé API Perplexity non configurée");
        toast.error("Configuration API manquante", {
          description: "Veuillez configurer une clé API Perplexity dans vos variables d'environnement."
        });
        return [];
      }
      
      const nameInfo = partName ? `, nom: ${partName}` : '';
      
      const response = await perplexityClient.post('/chat/completions', {
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          {
            role: "system",
            content: "Vous êtes un assistant spécialisé dans la recherche de pièces détachées agricoles au meilleur prix. Retournez les résultats uniquement au format JSON."
          },
          {
            role: "user",
            content: `Trouvez les 5 offres les moins chères pour la pièce agricole avec référence ${partReference}${nameInfo}. Incluez le prix, le vendeur, l'URL, la disponibilité, les frais de livraison et le délai estimé. Limitez aux sites français et aux sites professionnels agricoles. Format: JSON.`
          }
        ],
        temperature: 0.1,
        max_tokens: 1000
      });
      
      console.log('Réponse API reçue');
      
      // Extraction et transformation des données en format exploitable
      const content = response.data.choices[0].message.content;
      let jsonData;
      
      try {
        // Tenter d'extraire le JSON de la réponse
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                         content.match(/```\n([\s\S]*?)\n```/) ||
                         content.match(/{[\s\S]*?}/);
                         
        if (jsonMatch) {
          jsonData = JSON.parse(jsonMatch[0].replace(/```json\n|```\n|```/g, ''));
        } else {
          // Si pas de bloc JSON explicite, essayer de parser toute la réponse
          jsonData = JSON.parse(content);
        }
      } catch (parseError) {
        console.error("Erreur lors du parsing JSON:", parseError);
        console.log("Contenu brut:", content);
        
        // Revenir à un format par défaut en cas d'erreur
        return [{
          vendor: "Erreur de formatage",
          price: "Non disponible",
          currency: "EUR",
          availability: "Information non disponible",
          estimatedDelivery: "Information non disponible"
        }];
      }
      
      // Normaliser la structure de réponse
      const results = jsonData.results || jsonData.vendors || jsonData.offers || [jsonData];
      
      // Transformation en format standard
      return results.map((item: any) => ({
        vendor: item.vendor || item.supplier || item.seller || "Fournisseur inconnu",
        price: item.price || "Prix non spécifié",
        currency: item.currency || "EUR",
        url: item.url || item.link || null,
        availability: item.availability || item.inStock || "Inconnu",
        shippingCost: item.shippingCost || item.shipping || null,
        estimatedDelivery: item.estimatedDelivery || item.delivery || item.deliveryTime || "Non spécifié"
      }));
    } catch (error) {
      console.error("Erreur lors de la recherche des prix:", error);
      
      // Afficher des informations de débogage
      if (error.response) {
        console.error("Données de l'erreur:", error.response.data);
        console.error("Statut:", error.response.status);
        toast.error(`Erreur API (${error.response.status})`, { 
          description: error.response.data?.error?.message || "Détails non disponibles" 
        });
      } else {
        toast.error("Erreur de recherche", { 
          description: error.message || "Une erreur inattendue est survenue" 
        });
      }
      
      return [];
    }
  }
};

