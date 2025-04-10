
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { toast } from 'sonner';

// Get environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check for environment variables
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
}

// Instantiate Supabase client with explicit authentication options
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage,
    storageKey: 'optitractor-auth-token',
    flowType: 'pkce'
  }
});

// Check Supabase connection works
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Supabase connection error:', error.message);
    toast.error('Erreur de connexion à la base de données', {
      description: 'Vérifiez votre configuration et votre connexion internet'
    });
  } else {
    console.log('✅ Supabase connection established successfully');
    if (data.session) {
      console.log('✅ User logged in:', data.session.user.id);
    } else {
      console.log('⚠️ No user logged in');
    }
  }
});

// Expose the function for testing via console
if (typeof window !== 'undefined') {
  (window as any).supabase = supabase;
}
