
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { toast } from 'sonner';

// Récupération des variables d'environnement
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Vérification de la présence des variables d'environnement
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Variables d\'environnement Supabase manquantes. Veuillez configurer VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans votre fichier .env');
}

// Instancier le client Supabase avec des options explicites pour l'authentification
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage
  }
});

// Vérifier que la connexion à Supabase fonctionne
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Erreur de connexion à Supabase:', error.message);
    toast.error('Erreur de connexion à la base de données', {
      description: 'Vérifiez votre configuration et votre connexion internet'
    });
  } else {
    console.log('✅ Connexion à Supabase établie avec succès');
    if (data.session) {
      console.log('✅ Utilisateur connecté:', data.session.user.id);
    } else {
      console.log('⚠️ Aucun utilisateur connecté');
    }
  }
});

// Exposer la fonction pour les tests via la console
if (typeof window !== 'undefined') {
  (window as any).supabase = supabase;
}
