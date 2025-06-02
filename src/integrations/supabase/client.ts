
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Récupérer les variables d'environnement
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fonction de diagnostic améliorée
const diagnoseEnvironment = () => {
  const issues = [];
  
  if (!supabaseUrl) {
    issues.push('VITE_SUPABASE_URL est manquante');
  } else if (!supabaseUrl.startsWith('https://')) {
    issues.push('VITE_SUPABASE_URL doit commencer par https://');
  } else if (!supabaseUrl.includes('.supabase.co')) {
    issues.push('VITE_SUPABASE_URL doit contenir .supabase.co');
  }
  
  if (!supabaseAnonKey) {
    issues.push('VITE_SUPABASE_ANON_KEY est manquante');
  } else if (supabaseAnonKey.length < 100) {
    issues.push('VITE_SUPABASE_ANON_KEY semble invalide (trop courte)');
  }
  
  return issues;
};

// Vérifier que les variables d'environnement sont définies
if (!supabaseUrl || !supabaseAnonKey) {
  const issues = diagnoseEnvironment();
  console.error('Variables d\'environnement Supabase manquantes:', issues);
  
  // En production, afficher une erreur plus informative
  if (import.meta.env.PROD) {
    console.error('Configuration Supabase manquante en production. Variables requises:', {
      VITE_SUPABASE_URL: !!supabaseUrl,
      VITE_SUPABASE_ANON_KEY: !!supabaseAnonKey
    });
  }
  
  // Afficher un message utilisateur plus convivial
  if (typeof document !== 'undefined') {
    setTimeout(() => {
      toast.error('Erreur de configuration. Veuillez contacter l\'administrateur.', {
        description: `Problèmes détectés: ${issues.join(', ')}`,
        duration: 10000
      });
    }, 2000);
  }
}

// Créer le client Supabase avec gestion d'erreurs améliorée
const createSupabaseClient = () => {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(`Variables d'environnement Supabase manquantes: ${diagnoseEnvironment().join(', ')}`);
    }
    
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: {
        fetch: (...args: Parameters<typeof fetch>) => {
          // Ajouter un timeout pour éviter les attentes infinies
          const controller = new AbortController();
          const { signal } = controller;
          
          const timeoutId = setTimeout(() => controller.abort(), 30000);
          
          const [url, init = {}] = args;
          return fetch(url, { ...init, signal })
            .finally(() => clearTimeout(timeoutId))
            .catch((error) => {
              console.error('Erreur de connexion Supabase:', error);
              throw error;
            });
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création du client Supabase:', error);
    
    // En production, lancer une erreur plus explicite
    if (import.meta.env.PROD) {
      throw new Error(`Configuration Supabase invalide: ${error.message}`);
    }
    
    // Retourner un client factice qui ne fera rien mais évitera les plantages
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: new Error('Client non initialisé') }),
        getSession: async () => ({ data: { session: null }, error: new Error('Client non initialisé') }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } }, error: null }),
      },
      from: () => ({
        select: () => ({ data: null, error: new Error('Client non initialisé') }),
      }),
    } as any;
  }
};

// Exporter le client
export const supabase = createSupabaseClient();

// Helper pour obtenir l'ID utilisateur actuel
export const getCurrentUserId = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user?.id;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'ID utilisateur:', error);
    return null;
  }
};

// Helper pour obtenir l'ID de la ferme associée à l'utilisateur actuel
export const getCurrentFarmId = async () => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('farm_id')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data?.farm_id;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'ID de la ferme:', error);
    return null;
  }
};

// Vérifier la connexion à Supabase avec diagnostic amélioré
export const checkSupabaseConnection = async () => {
  try {
    // Tentative simple pour vérifier la connexion
    const { error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('Erreur de connexion Supabase:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Échec de la vérification de connexion Supabase:', error);
    return false;
  }
};

// Fonction de diagnostic public
export const diagnoseSupabaseConfiguration = () => {
  return {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    urlValid: supabaseUrl?.startsWith('https://') && supabaseUrl?.includes('.supabase.co'),
    keyValid: supabaseAnonKey?.length > 100,
    issues: diagnoseEnvironment()
  };
};
