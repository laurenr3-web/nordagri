
import { openai, checkApiKey } from './client';
import { toast } from 'sonner';

export const openaiChatService = {
  async askQuestion(question: string): Promise<{ answer: string }> {
    try {
      console.log('Envoi d\'une question à OpenAI:', question);
      
      // Vérifier si la clé API est configurée
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error("Clé API OpenAI non configurée");
      }
      
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
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
      
      const content = response.choices[0].message.content || "Désolé, je n'ai pas pu générer de réponse.";
      return { answer: content };
      
    } catch (error: any) {
      console.error("Erreur lors de l'envoi de la question:", error);
      
      let errorMessage = "Une erreur s'est produite lors de la communication avec OpenAI";
      
      if (error.status === 401) {
        errorMessage = "Clé API OpenAI invalide ou expirée";
        toast.error(errorMessage);
      } else if (error.status === 429) {
        errorMessage = "Limite d'utilisation OpenAI atteinte";
        toast.error(errorMessage);
      } else {
        toast.error("Erreur OpenAI", { description: error.message });
      }
      
      throw new Error(errorMessage);
    }
  }
};
