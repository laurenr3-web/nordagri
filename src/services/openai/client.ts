
import OpenAI from 'openai';
import { toast } from 'sonner';

// Récupérer la clé API depuis les variables d'environnement
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

// Client OpenAI avec configuration de base
export const openai = new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true // Pour utilisation côté client
});

// Validation de la clé API
export const checkApiKey = (): boolean => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    console.error('⚠️ Clé API OpenAI manquante');
    toast.error('Clé API OpenAI manquante', {
      description: 'Configurez votre clé API OpenAI dans .env.development'
    });
    return false;
  }
  
  // Accepter les clés commençant par "sk-" ou "sk-proj-" (format de projet OpenAI)
  if (!apiKey.startsWith('sk-')) {
    console.error('⚠️ Format de clé API OpenAI invalide');
    toast.error('Format de clé API OpenAI invalide', {
      description: 'La clé API doit commencer par "sk-"'
    });
    return false;
  }
  
  console.log('✅ Clé API OpenAI configurée');
  return true;
};

// Test de connexion
export const testOpenAIConnection = async (): Promise<boolean> => {
  if (!checkApiKey()) {
    return false;
  }
  
  try {
    console.log('🔍 Test de connexion OpenAI...');
    console.log('Clé API (premiers caractères):', apiKey?.substring(0, 8) + '...');
    
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
    
    // Vérification spécifique pour les erreurs d'authentification
    if (error.status === 401) {
      toast.error('Authentification OpenAI échouée', {
        description: 'Clé API rejetée. Vérifiez que votre clé est valide et activée.'
      });
    } else {
      toast.error('Échec de connexion à OpenAI', {
        description: error.message
      });
    }
    
    return false;
  }
};

// Requête simple
export const simpleChatQuery = async (prompt: string): Promise<string | null> => {
  if (!checkApiKey()) {
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
    
    if (error.status === 401) {
      toast.error('Authentification OpenAI échouée', {
        description: 'Clé API rejetée. Vérifiez que votre clé est valide et activée.'
      });
    } else {
      toast.error('Erreur de requête OpenAI', {
        description: error.message
      });
    }
    
    return null;
  }
};
