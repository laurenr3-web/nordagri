
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase avec fallbacks pour la production
const getSupabaseConfig = () => {
  // Priorité aux variables d'environnement de développement
  const devUrl = import.meta.env.VITE_SUPABASE_URL;
  const devKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  // Fallback vers les valeurs hardcodées si les variables d'environnement ne sont pas disponibles
  const supabaseUrl = devUrl || 'https://cagmgtmeljxykyngxxmj.supabase.co';
  const supabaseAnonKey = devKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhZ21ndG1lbGp4eWt5bmd4eG1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3NTAzNzksImV4cCI6MjA1ODMyNjM3OX0.3VFhuErdDDheXKX4djJvx4JzhSfpsApPu6hLl1bArUk';
  
  // Diagnostic détaillé pour aider au debugging
  const isDev = import.meta.env.DEV;
  const mode = import.meta.env.MODE;
  
  console.log('Configuration Supabase:', {
    mode,
    isDev,
    hasEnvUrl: !!devUrl,
    hasEnvKey: !!devKey,
    usingFallback: !devUrl || !devKey,
    url: supabaseUrl
  });
  
  // Validation de l'URL
  if (!supabaseUrl || !supabaseUrl.includes('supabase.co')) {
    throw new Error(`URL Supabase invalide: ${supabaseUrl}. Vérifiez la configuration des variables d'environnement.`);
  }
  
  if (!supabaseAnonKey) {
    throw new Error('Clé anonyme Supabase manquante. Vérifiez la configuration des variables d\'environnement.');
  }
  
  return { supabaseUrl, supabaseAnonKey };
};

// Créer le client Supabase avec la configuration
const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
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
