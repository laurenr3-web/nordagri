
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

export const useFarmId = (equipmentId?: number) => {
  const [farmId, setFarmId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [noAccess, setNoAccess] = useState(false);

  useEffect(() => {
    const fetchFarmId = async () => {
      try {
        // First attempt: Try to get farm_id from equipment if available
        if (equipmentId) {
          logger.log('Tentative de récupération du farm_id depuis l\'équipement:', equipmentId);
          const { data: equipmentData, error: equipmentError } = await supabase
            .from('equipment')
            .select('farm_id')
            .eq('id', equipmentId)
            .single();

          if (!equipmentError && equipmentData?.farm_id) {
            // Verify user has access to this farm via farm_members
            const { data: memberData, error: memberError } = await supabase
              .from('farm_members')
              .select('id')
              .eq('farm_id', equipmentData.farm_id)
              .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
              .single();
              
            if (!memberError && memberData) {
              logger.log('Farm ID trouvé via equipment et accès confirmé:', equipmentData.farm_id);
              setFarmId(equipmentData.farm_id);
              setIsLoading(false);
              return;
            } else {
              logger.log('Accès à la ferme refusé pour cet équipement');
            }
          }
        }

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          logger.error('Erreur auth:', authError);
          toast.error("Erreur d'authentification");
          setIsLoading(false);
          return;
        }

        // Second attempt: Check if user is a farm owner
        logger.log('Vérification si l\'utilisateur est propriétaire d\'une ferme');
        const { data: ownedFarms, error: ownerError } = await supabase
          .from('farms')
          .select('id')
          .eq('owner_id', user.id);

        if (!ownerError && ownedFarms && ownedFarms.length > 0) {
          // User owns at least one farm
          logger.log('Fermes possédées trouvées:', ownedFarms.length);
          const firstOwnedFarmId = ownedFarms[0].id;
          setFarmId(firstOwnedFarmId);
          setIsLoading(false);
          return;
        }

        // Third attempt: Try to get accessible farms via farm_members
        logger.log('Recherche des fermes accessibles via farm_members');
        const { data: farmMembers, error: membersError } = await supabase
          .from('farm_members')
          .select('farm_id')
          .eq('user_id', user.id);

        if (membersError) {
          logger.error('Erreur lors de la récupération des fermes accessibles:', membersError);
          toast.error("Erreur lors de la vérification des accès");
          setIsLoading(false);
          return;
        }

        if (farmMembers && farmMembers.length > 0) {
          // User has access to at least one farm
          logger.log('Fermes accessibles trouvées:', farmMembers.length);
          
          // Take the first accessible farm
          const firstFarmId = farmMembers[0].farm_id;
          setFarmId(firstFarmId);
          setIsLoading(false);
          
          // If multiple farms are accessible, we could add a UI to select
          if (farmMembers.length > 1) {
            logger.info('Utilisateur a accès à plusieurs fermes:', farmMembers.length);
          }
          
          return;
        }

        // No accessible farm - user must be invited
        logger.log('Aucune ferme accessible trouvée pour cet utilisateur');
        setNoAccess(true);
        setIsLoading(false);
      } catch (error) {
        logger.error('Erreur lors de la récupération du farm_id:', error);
        toast.error("Une erreur inattendue s'est produite");
        setIsLoading(false);
      }
    };

    // Only fetch if we're in a loading state
    if (isLoading) {
      fetchFarmId();
    }
  }, [equipmentId]); // Remove isLoading from dependencies to prevent infinite loop

  return { farmId, isLoading, noAccess };
};
