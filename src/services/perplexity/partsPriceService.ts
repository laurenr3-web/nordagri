
import { perplexityClient } from './client';

export interface PriceComparisonItem {
  vendor: string;
  price: number | string;
  currency: string;
  url?: string;
  availability: 'En stock' | 'Sur commande' | 'Non disponible';
  shippingCost?: number | string;
  estimatedDelivery?: string;
  condition?: string;
  lastUpdated: string;
}

export const partsPriceService = {
  async findBestPrices(partNumber: string, partName?: string): Promise<PriceComparisonItem[]> {
    try {
      console.log(`Recherche des meilleurs prix pour ${partNumber} (${partName || 'Sans nom'})`);
      
      // Vérifier la présence de la clé API
      const apiKey = import.meta.env.VITE_PERPLEXITY_API_KEY;
      if (!apiKey) {
        console.error("Clé API Perplexity non configurée");
        throw new Error("Clé API Perplexity manquante");
      }
      
      const response = await perplexityClient.post('/chat/completions', {
        model: "sonar-medium-online",
        messages: [
          {
            role: "system",
            content: "Vous êtes un assistant spécialisé dans la recherche de pièces détachées agricoles au meilleur prix. Retournez les résultats uniquement au format JSON."
          },
          {
            role: "user",
            content: `Trouvez les 5 offres les moins chères pour la pièce agricole avec référence ${partNumber} ${partName ? `(nom: ${partName})` : ''}. Incluez le prix, le vendeur, l'URL, la disponibilité, les frais de livraison et le délai estimé. Limitez aux sites français et aux sites professionnels agricoles. Format: JSON.`
          }
        ],
        temperature: 0.1 // Faible température pour des résultats plus précis
      });
      
      // Extraction du JSON de la réponse
      const content = response.data.choices[0].message.content;
      let parsedData;
      
      try {
        // Recherche du contenu JSON
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                          content.match(/```\n([\s\S]*?)\n```/) ||
                          content.match(/{[\s\S]*?}/);
                          
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[0].replace(/```json\n|```\n|```/g, ''));
        } else {
          parsedData = JSON.parse(content);
        }
      } catch (parseError) {
        console.error("Erreur lors du parsing des résultats:", parseError);
        return [];
      }
      
      const results = parsedData.results || parsedData.prices || parsedData;
      if (!Array.isArray(results)) {
        return [];
      }
      
      // Transformation en format uniforme
      return results.map((item: any) => ({
        vendor: item.vendor || item.vendeur || item.fournisseur || item.supplier || 'Inconnu',
        price: item.price || item.prix || 0,
        currency: item.currency || item.devise || '€',
        url: item.url || item.link || item.lien || '',
        availability: item.availability || item.disponibilité || item.disponibilite || 'Non disponible',
        shippingCost: item.shippingCost || item.shippingFee || item.fraisLivraison || item.fraisDeLivraison || 0,
        estimatedDelivery: item.estimatedDelivery || item.delaiLivraison || item.délaiLivraison || 'Non spécifié',
        condition: item.condition || item.état || item.etat || 'Neuf',
        lastUpdated: new Date().toISOString()
      }));
    } catch (error) {
      console.error("Erreur lors de la recherche des prix:", error);
      throw error;
    }
  }
};
