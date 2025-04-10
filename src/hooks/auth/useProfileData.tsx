
import { supabase } from '@/integrations/supabase/client';
import { ProfileData } from './useAuthState';
import { toast } from 'sonner';

/**
 * Function to fetch user profile data
 */
export async function fetchUserProfile(userId: string): Promise<ProfileData | null> {
  try {
    console.log("Fetching profile data for user:", userId);
    
    // Use a simple query to avoid RLS recursion
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, avatar_url')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching profile:', error);
      toast.error('Impossible de charger votre profil');
      return null;
    }
    
    if (!data) {
      console.log('No profile found for user, attempting to create one');
      
      // If no profile exists, try to create one
      try {
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({ 
            id: userId,
            first_name: '',
            last_name: ''
          })
          .select()
          .single();
        
        if (insertError) {
          console.error('Error creating profile:', insertError);
          return null;
        }
        
        return newProfile as ProfileData;
      } catch (err) {
        console.error('Error in profile creation:', err);
        return null;
      }
    }
    
    console.log("Profile data retrieved successfully:", data);
    return data as ProfileData;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
}
