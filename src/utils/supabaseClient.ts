
import { createClient } from '@supabase/supabase-js';

// Configuration du client Supabase avec une initialisation sécurisée
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Variables d\'environnement Supabase manquantes');
}

// Client Supabase centralisé et optimisé
export const supabaseClient = createClient(
  supabaseUrl || '',
  supabaseKey || '',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
);

// Fonction de diagnostic pour vérifier la configuration
export const diagnoseSupabaseConfiguration = () => {
  return {
    url: !!supabaseUrl,
    key: !!supabaseKey,
    urlFormat: supabaseUrl ? supabaseUrl.startsWith('https://') && supabaseUrl.includes('.supabase.co') : false,
    client: !!supabaseClient
  };
};

// Export par défaut pour compatibilité
export default supabaseClient;
