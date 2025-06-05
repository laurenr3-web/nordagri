
import { supabase } from '@/integrations/supabase/client';
import { ProfileData } from './useAuthState';
import { logger } from '@/utils/logger';

/**
 * Fetch user profile data from Supabase
 */
export async function fetchUserProfile(userId: string): Promise<ProfileData | null> {
  try {
    logger.log(`Récupération du profil pour l'utilisateur: ${userId}`);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        logger.warn('Profil non trouvé pour l\'utilisateur:', userId);
        return null;
      }
      throw error;
    }
    
    logger.log('Profil récupéré avec succès:', data);
    return data as ProfileData;
  } catch (error) {
    logger.error('Erreur lors de la récupération du profil:', error);
    return null;
  }
}

/**
 * Create a new user profile
 */
export async function createUserProfile(userId: string, userMetadata: any): Promise<ProfileData | null> {
  try {
    logger.log(`Création du profil pour l'utilisateur: ${userId}`);
    
    const firstName = userMetadata?.first_name || '';
    const lastName = userMetadata?.last_name || '';

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        first_name: firstName,
        last_name: lastName
      })
      .select()
      .single();
      
    if (error) {
      logger.error('Erreur lors de la création du profil:', error);
      return null;
    }
    
    logger.log('Profil créé avec succès:', data);
    return data as ProfileData;
  } catch (error) {
    logger.error('Erreur dans createUserProfile:', error);
    return null;
  }
}
