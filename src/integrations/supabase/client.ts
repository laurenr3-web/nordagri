
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Utiliser les variables d'environnement
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Supabase environment variables are not set');
}

export const supabase = createClient<Database>(
  SUPABASE_URL as string, 
  SUPABASE_ANON_KEY as string
);
