
import { supabase } from '@/integrations/supabase/client';
import { ProfileData } from './useAuthState';

/**
 * Hook to fetch user profile data
 */
export async function fetchUserProfile(userId: string): Promise<ProfileData | null> {
  try {
    console.log("Fetching profile for user:", userId);
    
    // Utiliser une requête simple pour éviter les problèmes de récursion RLS
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, avatar_url')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      return null;
    }
    
    console.log("Profile data received:", data);
    return data as ProfileData;
  } catch (error) {
    console.error('Exception lors de la récupération du profil:', error);
    return null;
  }
}
