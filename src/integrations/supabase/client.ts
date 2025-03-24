
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Utiliser les variables d'environnement ou les valeurs par défaut pour assurer le bon fonctionnement
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://cagmgtmeljxykyngxxmj.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhZ21ndG1lbGp4eWt5bmd4eG1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3NTAzNzksImV4cCI6MjA1ODMyNjM3OX0.3VFhuErdDDheXKX4djJvx4JzhSfpsApPu6hLl1bArUk";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Supabase environment variables are not set');
}

export const supabase = createClient<Database>(
  SUPABASE_URL as string, 
  SUPABASE_ANON_KEY as string
);
