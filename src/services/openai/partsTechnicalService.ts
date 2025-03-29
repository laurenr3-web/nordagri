
import { simpleChatQuery, checkApiKey } from './client';
import { toast } from 'sonner';

export const partsTechnicalService = {
  /**
   * Récupérer les informations techniques d'une pièce
   */
  async getPartInfo(partNumber: string, context?: string, categories: string[] = []): Promise<any> {
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
    
    try {
      // Construction du prompt
      const categoryInfo = categories.length > 0 
        ? `Cette pièce appartient probablement à la catégorie: ${categories.join(' ou ')}.` 
        : '';
        
      const prompt = `
Je recherche des informations techniques précises sur une pièce agricole avec la référence: ${partNumber}. ${context ? `Contexte additionnel: ${context}` : ''}
${categoryInfo}

Fournissez les informations techniques structurées suivantes si possible:
1. Fonction principale de la pièce
2. Instructions d'installation/montage
3. Symptômes de défaillance ou d'usure
4. Conseils de maintenance
5. Avertissements ou précautions d'utilisation
6. Alternatives ou pièces compatibles

Si vous n'êtes pas sûr d'une information, indiquez-le clairement. Formatez les résultats sous forme d'objet JSON avec les clés: "function", "installation", "symptoms", "maintenance", "warnings", "alternatives".
      `;
      
      console.log('🤖 Envoi requête...');
      const jsonResponse = await simpleChatQuery(prompt);
      
      if (!jsonResponse) {
        console.error('❌ Pas de réponse');
        return null;
      }
      
      try {
        // Extrait le JSON de la réponse
        let jsonData;
        
        // Cas 1: La réponse est déjà au format JSON
        try {
          jsonData = JSON.parse(jsonResponse);
          console.log('✅ JSON parsé avec succès', jsonData);
          return jsonData;
        } catch (e) {
          console.log('⚠️ Le résultat n\'est pas un JSON valide, tentative d\'extraction...');
          
          // Cas 2: La réponse contient du texte avec du JSON à l'intérieur
          const jsonMatch = jsonResponse.match(/```json\s*([\s\S]*?)\s*```/) || 
                           jsonResponse.match(/{[\s\S]*?}/);
          
          if (jsonMatch) {
            try {
              const extractedJson = jsonMatch[0].replace(/```json|```/g, '').trim();
              jsonData = JSON.parse(extractedJson);
              console.log('✅ JSON extrait et parsé avec succès', jsonData);
              return jsonData;
            } catch (e) {
              console.error('❌ Échec de l\'extraction JSON', e);
            }
          }
          
          // Cas 3: Convertir la réponse textuelle en structure JSON manuelle
          console.log('⚠️ Conversion texte vers structure JSON...');
          const sections = jsonResponse.split(/\n\s*\d+\.\s+/).filter(Boolean);
          
          jsonData = {
            function: sections[0] || null,
            installation: sections[1] || null,
            symptoms: sections[2] || null,
            maintenance: sections[3] || null,
            warnings: sections[4] || null,
            alternatives: sections[5] || null
          };
          
          console.log('✅ Structure JSON créée manuellement', jsonData);
          return jsonData;
        }
      } catch (error) {
        console.error('❌ Erreur de traitement de la réponse:', error);
        console.log('Réponse brute:', jsonResponse);
        return null;
      }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des informations:', error);
      return null;
    }
  }
};
