
import { createClient } from '@supabase/supabase-js';

// Récupérer les variables d'environnement
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Vérifier que les variables d'environnement sont définies
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variables d\'environnement Supabase manquantes. Vérifiez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY');
}

// Créer le client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper pour obtenir l'ID utilisateur actuel
export const getCurrentUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id;
};

// Helper pour obtenir l'ID de la ferme associée à l'utilisateur actuel
export const getCurrentFarmId = async () => {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('farm_id')
    .eq('id', userId)
    .single();

  if (error || !data) return null;
  return data.farm_id;
};
