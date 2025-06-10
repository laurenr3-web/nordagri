
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

    // Ensure the profile data has all required fields
    if (data) {
      // Make sure email is present (might come from auth.users instead)
      if (!data.email) {
        // Try to get email from the auth user
        const { data: userData } = await supabase.auth.getUser(userId);
        if (userData?.user?.email) {
          data.email = userData.user.email;
        }
      }

      // Ensure created_at and updated_at fields exist
      if (!data.created_at) {
        data.created_at = new Date().toISOString();
      }
      
      if (!data.updated_at) {
        data.updated_at = new Date().toISOString();
      }
    }

    return data as ProfileData;
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    return null;
  }
}
