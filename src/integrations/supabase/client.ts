
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Utiliser uniquement les variables d'environnement sans les valeurs par défaut exposées
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Supabase environment variables are not set');
}

// Instancier le client Supabase
export const supabase = createClient<Database>(
  SUPABASE_URL as string, 
  SUPABASE_ANON_KEY as string
);

// Vérifier que la connexion à Supabase fonctionne
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Error connecting to Supabase:', error.message);
  } else {
    console.log('✅ Successfully connected to Supabase');
  }
});
