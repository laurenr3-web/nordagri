
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

export const useFarmId = (equipmentId?: number) => {
  const [farmId, setFarmId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [noAccess, setNoAccess] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchFarmId = async () => {
      try {
        // Use getSession (reads from cache/localStorage) instead of getUser (network request)
        // This prevents failures on mobile pull-to-refresh when network is slow
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session?.user) {
          // If getSession fails, retry once with a small delay
          logger.log('Session non disponible, nouvelle tentative...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const { data: { session: retrySession }, error: retryError } = await supabase.auth.getSession();
          
          if (retryError || !retrySession?.user) {
            logger.error('Erreur auth après retry:', retryError);
            if (!cancelled) {
              toast.error("Erreur d'authentification. Rafraîchissez la page.");
              setIsLoading(false);
            }
            return;
          }
          
          if (cancelled) return;
          // Continue with retry session
          await resolveUserFarm(retrySession.user.id, cancelled);
          return;
        }

        if (cancelled) return;

        // First attempt: Try to get farm_id from equipment if available
        if (equipmentId) {
          logger.log('Tentative de récupération du farm_id depuis l\'équipement:', equipmentId);
          const { data: equipmentData, error: equipmentError } = await supabase
            .from('equipment')
            .select('farm_id')
            .eq('id', equipmentId)
            .single();

          if (!equipmentError && equipmentData?.farm_id) {
            const { data: memberData, error: memberError } = await supabase
              .from('farm_members')
              .select('id')
              .eq('farm_id', equipmentData.farm_id)
              .eq('user_id', session.user.id)
              .single();
              
            if (!memberError && memberData) {
              logger.log('Farm ID trouvé via equipment et accès confirmé:', equipmentData.farm_id);
              if (!cancelled) {
                setFarmId(equipmentData.farm_id);
                setIsLoading(false);
              }
              return;
            } else {
              logger.log('Accès à la ferme refusé pour cet équipement');
            }
          }
        }

        await resolveUserFarm(session.user.id, cancelled);
      } catch (error) {
        logger.error('Erreur lors de la récupération du farm_id:', error);
        if (!cancelled) {
          toast.error("Une erreur inattendue s'est produite");
          setIsLoading(false);
        }
      }
    };

    const resolveUserFarm = async (userId: string, isCancelled: boolean) => {
      // Check if user is a farm owner
      logger.log('Vérification si l\'utilisateur est propriétaire d\'une ferme');
      const { data: ownedFarms, error: ownerError } = await supabase
        .from('farms')
        .select('id')
        .eq('owner_id', userId);

      if (!ownerError && ownedFarms && ownedFarms.length > 0) {
        logger.log('Fermes possédées trouvées:', ownedFarms.length);
        if (!isCancelled) {
          setFarmId(ownedFarms[0].id);
          setIsLoading(false);
        }
        return;
      }

      // Try to get accessible farms via farm_members
      logger.log('Recherche des fermes accessibles via farm_members');
      const { data: farmMembers, error: membersError } = await supabase
        .from('farm_members')
        .select('farm_id')
        .eq('user_id', userId);

      if (membersError) {
        logger.error('Erreur lors de la récupération des fermes accessibles:', membersError);
        if (!isCancelled) {
          toast.error("Erreur lors de la vérification des accès");
          setIsLoading(false);
        }
        return;
      }

      if (farmMembers && farmMembers.length > 0) {
        logger.log('Fermes accessibles trouvées:', farmMembers.length);
        if (!isCancelled) {
          setFarmId(farmMembers[0].farm_id);
          setIsLoading(false);
        }
        if (farmMembers.length > 1) {
          logger.info('Utilisateur a accès à plusieurs fermes:', farmMembers.length);
        }
        return;
      }

      // No accessible farm
      logger.log('Aucune ferme accessible trouvée pour cet utilisateur');
      if (!isCancelled) {
        setNoAccess(true);
        setIsLoading(false);
      }
    };

    if (isLoading) {
      fetchFarmId();
    }

    return () => { cancelled = true; };
  }, [equipmentId]);

  return { farmId, isLoading, noAccess };
};
