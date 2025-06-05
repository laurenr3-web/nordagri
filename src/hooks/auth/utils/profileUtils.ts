
import { fetchUserProfile, createUserProfile } from '../useProfileData';
import { logger } from '@/utils/logger';
import { ProfileData } from '../useAuthState';

/**
 * Utility functions for profile management
 */
export const handleUserProfile = async (
  userId: string,
  userMetadata: any,
  setProfileData: (data: ProfileData | null) => void,
  isMounted: () => boolean
): Promise<void> => {
  try {
    const profileData = await fetchUserProfile(userId);
    if (isMounted()) {
      if (profileData) {
        setProfileData(profileData);
      } else {
        logger.log('Profil non trouvé, création en cours...');
        const newProfile = await createUserProfile(userId, userMetadata);
        if (newProfile && isMounted()) {
          setProfileData(newProfile);
        }
      }
    }
  } catch (profileError) {
    logger.error("Erreur lors du chargement du profil:", profileError);
  }
};
