
import { supabase } from '@/integrations/supabase/client';
import { ProfileData } from './useAuthState';

/**
 * Hook to fetch user profile data
 */
export async function fetchUserProfile(userId: string): Promise<ProfileData | null> {
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

    if (data) {
      // Get email from auth user since it's not in profiles table
      let email = '';
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user?.email) {
        email = userData.user.email;
      }

      return {
        ...data,
        email,
      } as ProfileData;
    }

    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    return null;
  }
}
