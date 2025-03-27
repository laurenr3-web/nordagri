
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to fetch user profile data
 */
export async function fetchUserProfile(userId: string): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    return null;
  }
}
