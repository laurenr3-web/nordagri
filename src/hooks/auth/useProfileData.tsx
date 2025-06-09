
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProfileData } from './useAuthState';
import { logger } from '@/utils/logger';

/**
 * Hook pour gérer les données de profil utilisateur
 */
export function useProfileData() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return {
    loading,
    error
  };
}

/**
 * Récupérer le profil d'un utilisateur
 */
export async function fetchUserProfile(userId: string): Promise<ProfileData | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Profil non trouvé
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    logger.error('Erreur lors de la récupération du profil:', error);
    throw error;
  }
}

/**
 * Créer un nouveau profil utilisateur
 */
export async function createUserProfile(userId: string, userMetadata: any): Promise<ProfileData | null> {
  try {
    const profileData = {
      id: userId,
      first_name: userMetadata?.first_name || '',
      last_name: userMetadata?.last_name || '',
      avatar_url: userMetadata?.avatar_url || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('profiles')
      .insert([profileData])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    logger.error('Erreur lors de la création du profil:', error);
    throw error;
  }
}
