
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

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

// Créer le client Supabase avec gestion d'erreurs améliorée
const createSupabaseClient = () => {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Variables d\'environnement Supabase manquantes');
    }
    
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: {
        fetch: (...args) => {
          // Ajouter un timeout pour éviter les attentes infinies
          const controller = new AbortController();
          const { signal } = controller;
          
          const timeoutId = setTimeout(() => controller.abort(), 30000);
          
          return fetch(...args, { signal })
            .finally(() => clearTimeout(timeoutId));
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création du client Supabase:', error);
    
    // Retourner un client factice qui ne fera rien mais évitera les plantages
    // Important pour permettre au site de charger même si Supabase n'est pas disponible
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

// Vérifier la connexion à Supabase
export const checkSupabaseConnection = async () => {
  try {
    // Tentative simple pour vérifier la connexion
    const { error } = await supabase.from('profiles').select('count').limit(1);
    return !error;
  } catch {
    return false;
  }
};
