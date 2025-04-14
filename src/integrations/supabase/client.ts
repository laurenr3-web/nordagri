
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { toast } from 'sonner';
import { RetryableError, SupabaseConnectionError } from '@/utils/errorHandling';

// Configuration des réessais
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 seconde entre les tentatives

// Récupération des variables d'environnement avec validation
const getEnvVariable = (name: string): string => {
  const value = import.meta.env[name];
  if (!value) {
    console.error(`Variable d'environnement ${name} manquante`);
    // On laisse quand même l'application essayer de démarrer
    return '';
  }
  return value;
};

// Récupération sécurisée des variables d'environnement
const SUPABASE_URL = getEnvVariable('VITE_SUPABASE_URL');
const SUPABASE_ANON_KEY = getEnvVariable('VITE_SUPABASE_ANON_KEY');

// Vérification de la présence des variables d'environnement avec message d'erreur détaillé
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  const errorMessage = `Configuration Supabase incomplète : ${!SUPABASE_URL ? 'URL manquante' : ''} ${!SUPABASE_ANON_KEY ? 'Clé manquante' : ''}`;
  console.error('⚠️ ', errorMessage);
  toast.error('Erreur de configuration Supabase', {
    description: 'Veuillez vérifier votre fichier .env et redémarrer l\'application',
    duration: 5000
  });
}

// Instancier le client Supabase avec des options explicites pour l'authentification
export const supabase = createClient<Database>(
  SUPABASE_URL || 'https://placeholder-url.supabase.co', // URL par défaut pour éviter les erreurs de syntaxe
  SUPABASE_ANON_KEY || 'placeholder-key', // Clé par défaut pour éviter les erreurs de syntaxe
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: localStorage,
      flowType: 'pkce' // Utilisation du flow PKCE pour plus de sécurité
    },
    global: {
      fetch: async (input, init) => {
        // Implémentation d'un mécanisme de réessai
        let retries = 0;
        
        while (true) {
          try {
            return await fetch(input, init);
          } catch (error: any) {
            retries++;
            
            // Si c'est une erreur de connectivité et qu'on n'a pas dépassé le max de tentatives
            if ((error.name === 'NetworkError' || error.name === 'TypeError') && retries < MAX_RETRIES) {
              console.warn(`Erreur de connectivité Supabase, tentative ${retries}/${MAX_RETRIES}`, error);
              await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * retries));
              continue;
            }
            
            // Si on a dépassé le max de tentatives, on propage l'erreur
            throw new SupabaseConnectionError(
              `Échec de connexion à Supabase après ${retries} tentative(s): ${error.message}`, 
              error
            );
          }
        }
      }
    }
  }
);

// Vérifier que la connexion à Supabase fonctionne avec une gestion des erreurs robuste
(async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      const errorDetails = `Code: ${error.code || 'inconnu'}, Message: ${error.message || 'erreur non spécifiée'}`;
      throw new Error(`Échec de connexion à Supabase: ${errorDetails}`);
    }
    
    console.log('✅ Connexion à Supabase établie avec succès');
    if (data.session) {
      console.log('✅ Utilisateur connecté:', data.session.user.id);
    } else {
      console.log('⚠️ Aucun utilisateur connecté - fonctionnement en mode anonyme');
    }
  } catch (error: any) {
    console.error('❌ Erreur initiale de connexion à Supabase:', error);
    toast.error('Problème de connexion à la base de données', {
      description: 'Vérifiez votre connexion internet et réessayez',
      action: {
        label: 'Réessayer',
        onClick: () => window.location.reload(),
      },
      duration: 10000
    });
  }
})();

// Interface de réessai pour les opérations Supabase
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = MAX_RETRIES,
  initialDelay = RETRY_DELAY
): Promise<T> {
  let lastError: Error;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      return await operation();
    } catch (error: any) {
      retries++;
      lastError = error;
      
      // Ne réessaie que si c'est une erreur temporaire
      if (error instanceof RetryableError || 
          error.name === 'NetworkError' || 
          error.name === 'TypeError' ||
          (error.code && ['23505', '40001', '55P03'].includes(error.code))) {
        
        console.warn(`Réessai de l'opération Supabase (${retries}/${maxRetries})`, error);
        await new Promise(resolve => setTimeout(resolve, initialDelay * Math.pow(2, retries - 1)));
        continue;
      }
      
      // Pour les erreurs non retryables, on propage directement
      throw error;
    }
  }
  
  // Si on arrive ici, c'est qu'on a épuisé nos tentatives
  console.error(`Échec après ${maxRetries} tentatives`, lastError);
  throw lastError;
}

// Exposer la fonction pour les tests via la console
if (typeof window !== 'undefined') {
  (window as any).supabase = supabase;
  (window as any).withRetry = withRetry;
}
