
import { supabase } from '@/integrations/supabase/client';
import { ProfileData } from './useAuthState';

/**
 * Hook to fetch user profile data
 */
export async function fetchUserProfile(userId: string): Promise<ProfileData | null> {
  try {
    // Utiliser une requête simple qui ne devrait pas déclencher de récursion RLS
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, avatar_url')
      .eq('id', userId)
      .maybeSingle();  // Utiliser maybeSingle() au lieu de single() pour éviter les erreurs

    if (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      return null;
    }

    return data as ProfileData;
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    return null;
  }
}
