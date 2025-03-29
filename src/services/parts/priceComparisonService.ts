
import { openai } from '@/services/openai/client';

export interface PriceItem {
  vendor: string;
  price: number | string;
  currency: string;
  url: string;
  availability: string;
  shipping?: number | string;
  deliveryTime: string;
  condition?: string;
}

export async function getPartPrices(partNumber: string, manufacturer?: string): Promise<PriceItem[]> {
  try {
    // Simulate API call for now
    console.log(`Getting prices for part ${partNumber} from ${manufacturer || 'unknown manufacturer'}`);
    
    // Mock data
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return [
      {
        vendor: "AgriStore",
        price: 89.99,
        currency: "€",
        url: "https://example.com/part1",
        availability: "En stock",
        shipping: 5.99,
        deliveryTime: "2-3 jours ouvrables",
        condition: "Neuf"
      },
      {
        vendor: "FarmParts",
        price: 92.50,
        currency: "€",
        url: "https://example.com/part2",
        availability: "En stock",
        shipping: 4.99,
        deliveryTime: "3-5 jours ouvrables",
        condition: "Neuf"
      },
      {
        vendor: "TractorSupply",
        price: 87.75,
        currency: "€",
        url: "https://example.com/part3",
        availability: "En stock",
        shipping: "Gratuit",
        deliveryTime: "5-7 jours ouvrables",
        condition: "Neuf"
      }
    ];
    
    /*
    // Uncomment this to use the real OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Vous êtes un assistant spécialisé dans la recherche de prix de pièces agricoles. Votre tâche est de fournir une liste détaillée de prix pour la même pièce chez différents fournisseurs. 
          
          IMPORTANT: 
          1. Répondez UNIQUEMENT au format JSON avec une structure claire
          2. Incluez toujours au moins 4-6 fournisseurs différents
          3. Chaque entrée DOIT avoir une URL complète (commençant par https://)
          4. Les prix doivent être réalistes et variés
          5. Précisez toujours la disponibilité actuelle`
        },
        {
          role: "user",
          content: `Trouvez les prix pour la pièce agricole ${partNumber} ${manufacturer ? 'de ' + manufacturer : ''}.
          
          Fournissez les informations sous forme de liste structurée JSON avec pour chaque fournisseur:
          - Nom du fournisseur
          - Prix (avec devise)
          - URL complète de la page produit (INDISPENSABLE)
          - Disponibilité (en stock, expédition sous X jours, etc.)
          - Frais de livraison
          - Délai de livraison estimé
          - État du produit (neuf, reconditionné, etc.)
          
          Format JSON attendu:
          {
            "prices": [
              {
                "vendor": "Nom du vendeur",
                "price": 99.99,
                "currency": "€",
                "url": "https://exemple.com/produit",
                "availability": "En stock",
                "shipping": 5.99,
                "deliveryTime": "2-3 jours ouvrables",
                "condition": "Neuf"
              },
              // autres vendeurs...
            ]
          }`
        }
      ],
      response_format: { type: "json_object" }
    });

    // Extraction des données
    const content = response.choices[0].message.content;
    const parsedData = JSON.parse(content);
    
    // Mapping vers notre format
    let priceItems: PriceItem[] = [];
    
    if (parsedData.prices && Array.isArray(parsedData.prices)) {
      priceItems = parsedData.prices.map((item: any) => ({
        vendor: item.vendor || item.supplier || item.fournisseur || "Inconnu",
        price: item.price || item.prix || 0,
        currency: item.currency || item.devise || "€",
        url: item.url || item.link || item.lien || "#",
        availability: item.availability || item.disponibilite || item.disponibilité || "Non spécifié",
        shipping: item.shipping || item.shippingCost || item.fraisLivraison || 0,
        deliveryTime: item.deliveryTime || item.delaiLivraison || item.délaiLivraison || "Non spécifié",
        condition: item.condition || item.etat || item.état || "Neuf"
      }));
    }
    
    return priceItems;
    */
    
  } catch (error) {
    console.error('Erreur lors de la récupération des prix:', error);
    throw error;
  }
}
