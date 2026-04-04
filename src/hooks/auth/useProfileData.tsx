
import { supabase } from '@/integrations/supabase/client';
import { ProfileData } from './useAuthState';

/**
 * Hook to fetch user profile data
 */
export async function fetchUserProfile(userId: string, email = ''): Promise<ProfileData | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    return {
      ...data,
      email,
    } as ProfileData;
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    return null;
  }
}
