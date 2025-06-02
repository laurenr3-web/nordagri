
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { productionConfig } from '@/config/productionConfig';

// Récupérer les variables d'environnement
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Vérifier que les variables d'environnement sont définies
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Variables d\'environnement Supabase manquantes. Vérifiez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY');
  
  // Afficher un message utilisateur plus convivial
  if (typeof document !== 'undefined') {
    setTimeout(() => {
      toast.error('Erreur de configuration. Veuillez contacter l\'administrateur.', {
        description: 'Les paramètres de connexion à la base de données sont manquants.'
      });
    }, 2000);
  }
}

// Configuration spécifique pour nordagri.ca
const getAuthConfig = () => {
  const { currentDomain, isDevelopment } = productionConfig;
  
  const baseConfig = {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  };

  // Configuration spécifique par domaine
  if (currentDomain === 'nordagri.ca') {
    return {
      ...baseConfig,
      flowType: 'pkce' as const,
      storage: window.localStorage,
      storageKey: 'nordagri-auth',
    };
  }

  return baseConfig;
};

// Créer le client Supabase avec gestion d'erreurs améliorée
const createSupabaseClient = () => {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Variables d\'environnement Supabase manquantes');
    }
    
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: getAuthConfig(),
      global: {
        fetch: (...args: Parameters<typeof fetch>) => {
          // Timeout adapté au domaine
          const controller = new AbortController();
          const { signal } = controller;
          
          const timeoutId = setTimeout(() => {
            controller.abort();
            console.warn(`⚠️ Timeout de ${productionConfig.timeout}ms atteint pour ${args[0]}`);
          }, productionConfig.timeout);
          
          const [url, init = {}] = args;
          return fetch(url, { ...init, signal })
            .finally(() => clearTimeout(timeoutId))
            .catch((error) => {
              if (error.name === 'AbortError') {
                console.error('❌ Requête annulée par timeout:', url);
                throw new Error('Connexion trop lente. Veuillez réessayer.');
              }
              throw error;
            });
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création du client Supabase:', error);
    
    // Retourner un client factice qui ne fera rien mais évitera les plantages
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: new Error('Client non initialisé') }),
        getSession: async () => ({ data: { session: null }, error: new Error('Client non initialisé') }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } }, error: null }),
        signOut: async () => ({ error: new Error('Client non initialisé') }),
      },
      from: () => ({
        select: () => ({ data: null, error: new Error('Client non initialisé') }),
      }),
    } as any;
  }
};

// Exporter le client
export const supabase = createSupabaseClient();

// Helper pour obtenir l'ID utilisateur actuel avec retry
export const getCurrentUserId = async () => {
  let attempts = 0;
  const maxAttempts = productionConfig.retryAttempts;
  
  while (attempts < maxAttempts) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user?.id;
    } catch (error) {
      attempts++;
      console.error(`Erreur lors de la récupération de l'ID utilisateur (tentative ${attempts}/${maxAttempts}):`, error);
      
      if (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, productionConfig.authRetryDelay));
      }
    }
  }
  return null;
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

// Vérifier la connexion à Supabase avec retry
export const checkSupabaseConnection = async () => {
  let attempts = 0;
  const maxAttempts = productionConfig.retryAttempts;
  
  while (attempts < maxAttempts) {
    try {
      const { error } = await supabase.from('profiles').select('count').limit(1);
      if (!error) return true;
      
      attempts++;
      if (attempts < maxAttempts) {
        console.warn(`Tentative de connexion ${attempts}/${maxAttempts} échouée, retry...`);
        await new Promise(resolve => setTimeout(resolve, productionConfig.authRetryDelay));
      }
    } catch (error) {
      attempts++;
      if (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, productionConfig.authRetryDelay));
      }
    }
  }
  
  return false;
};

// Log de diagnostic pour nordagri.ca
if (productionConfig.currentDomain === 'nordagri.ca') {
  console.log('🔧 Configuration nordagri.ca:', {
    domain: productionConfig.currentDomain,
    timeout: productionConfig.timeout,
    supabaseConfigured: !!(supabaseUrl && supabaseAnonKey),
    timestamp: new Date().toISOString()
  });
}
