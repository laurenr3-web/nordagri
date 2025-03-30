
import { perplexityClient } from '@/services/perplexity/client';
import { toast } from 'sonner';

export const perplexityChatService = {
  async askQuestion(question: string): Promise<{ answer: string }> {
    try {
      console.log('Envoi d\'une question à Perplexity:', question);
      
      // Vérifier si la clé API est configurée
      const apiKey = import.meta.env.VITE_PERPLEXITY_API_KEY;
      if (!apiKey) {
        throw new Error("Clé API Perplexity non configurée");
      }
      
      const response = await perplexityClient.post('/chat/completions', {
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          {
            role: "system",
            content: "Vous êtes un assistant spécialisé dans les équipements et pièces agricoles. Soyez précis, concis et utile. Si vous ne connaissez pas la réponse à une question spécifique, proposez des informations générales sur le sujet ou suggérez d'autres ressources."
          },
          {
            role: "user",
            content: question
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      });
      
      const content = response.data.choices[0].message.content;
      return { answer: content };
      
    } catch (error) {
      console.error("Erreur lors de l'envoi de la question:", error);
      
      if (error.response) {
        console.error("Données de l'erreur:", error.response.data);
        
        const errorMessage = error.response.data?.error?.message || "Détails non disponibles";
        toast.error(`Erreur API Perplexity (${error.response.status})`, { 
          description: errorMessage
        });
        
        throw new Error(`Erreur API: ${errorMessage}`);
      }
      
      throw error;
    }
  }
};
