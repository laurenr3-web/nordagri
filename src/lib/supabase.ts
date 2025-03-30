
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Utiliser les variables d'environnement avec des valeurs par défaut de secours pour éviter les erreurs
// Les valeurs par défaut sont utilisées seulement si les variables d'environnement ne sont pas définies
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Vérifier si les variables essentielles sont définies
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Erreur: Variables d\'environnement Supabase manquantes');
  // On pourrait afficher un toast ici, mais on évite de le faire à l'initialisation
}

// Créer le client Supabase avec des options optimisées
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache', 
      'Expires': '0',
    },
  },
});

// Fonction utilitaire pour vérifier la connexion Supabase
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    // Tenter une requête simple pour vérifier la connexion
    const { data, error } = await supabase.from('parts_inventory').select('id').limit(1);
    
    if (error) {
      console.error('Erreur de connexion Supabase:', error);
      toast('Problème de connexion à la base de données', {
        description: 'Certaines fonctionnalités peuvent être limitées',
        duration: 5000,
        important: true,
      });
      return false;
    }
    
    console.log('✅ Connexion Supabase établie');
    return true;
  } catch (err) {
    console.error('Exception lors du test de connexion Supabase:', err);
    toast('Problème de connexion à la base de données', {
      description: 'Certaines fonctionnalités peuvent être limitées',
      duration: 5000,
      important: true,
    });
    return false;
  }
};

// Vérifier la session au démarrage pour s'assurer que l'authentification fonctionne
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Erreur lors de la récupération de la session Supabase:', error.message);
  } else {
    console.log('✅ Session Supabase vérifiée');
  }
});
