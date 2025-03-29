
import OpenAI from 'openai';
import { toast } from 'sonner';

// Client OpenAI avec configuration de base
export const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Pour utilisation côté client
});

// Validation de la clé API
export const checkApiKey = (): boolean => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    console.error('⚠️ Clé API OpenAI manquante');
    return false;
  }
  return true;
};

// Test de connexion
export const testOpenAIConnection = async (): Promise<boolean> => {
  if (!checkApiKey()) {
    toast.error('Clé API manquante', {
      description: 'Configurez votre clé API OpenAI dans .env.development'
    });
    return false;
  }
  
  try {
    console.log('🔍 Test de connexion OpenAI...');
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Vous êtes un assistant de diagnostic. Répondez uniquement 'OK'."
        },
        {
          role: "user",
          content: "Test de connexion"
        }
      ],
      max_tokens: 5,
      temperature: 0.0
    });
    
    console.log('✅ Test de connexion OpenAI réussi:', response);
    return true;
  } catch (error) {
    console.error('❌ Échec du test de connexion OpenAI:', error);
    return false;
  }
};

// Requête simple
export const simpleChatQuery = async (prompt: string): Promise<string | null> => {
  if (!checkApiKey()) {
    toast.error('Clé API OpenAI manquante');
    return null;
  }
  
  try {
    console.log('🔍 Requête OpenAI:', prompt.substring(0, 50) + '...');
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Vous êtes un expert en pièces détachées agricoles. Répondez de manière concise et précise."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 500
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error('❌ Erreur requête OpenAI:', error);
    return null;
  }
};
