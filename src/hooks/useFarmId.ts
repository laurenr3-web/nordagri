
import { useEffect, useState } from 'react';
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
        // Get current user first
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          logger.error('Erreur auth:', authError);
          toast.error("Erreur d'authentification");
          setIsLoading(false);
          return;
        }

        // If equipmentId is provided, get farm_id from equipment with security check
        if (equipmentId) {
          logger.log('Récupération sécurisée du farm_id depuis l\'équipement:', equipmentId);
          
          // Use RLS-protected query - this will only return equipment the user has access to
          const { data: equipmentData, error: equipmentError } = await supabase
            .from('equipment')
            .select('farm_id')
            .eq('id', equipmentId)
            .single();

          if (!equipmentError && equipmentData?.farm_id) {
            logger.log('Farm ID trouvé via equipment avec RLS:', equipmentData.farm_id);
            setFarmId(equipmentData.farm_id);
            setIsLoading(false);
            return;
          } else if (equipmentError?.code === 'PGRST116') {
            // No rows returned - user doesn't have access to this equipment
            logger.log('Accès refusé à cet équipement par RLS');
            setNoAccess(true);
            setIsLoading(false);
            return;
          }
        }

        // Get farms where user is owner - using RLS-protected query
        logger.log('Recherche des fermes possédées par l\'utilisateur');
        const { data: ownedFarms, error: ownerError } = await supabase
          .from('farms')
          .select('id')
          .eq('owner_id', user.id);

        if (!ownerError && ownedFarms && ownedFarms.length > 0) {
          logger.log('Fermes possédées trouvées:', ownedFarms.length);
          setFarmId(ownedFarms[0].id);
          setIsLoading(false);
          return;
        }

        // Get accessible farms via farm_members - using RLS-protected query
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
          logger.log('Fermes accessibles trouvées:', farmMembers.length);
          setFarmId(farmMembers[0].farm_id);
          setIsLoading(false);
          return;
        }

        // No accessible farm found
        logger.log('Aucune ferme accessible trouvée pour cet utilisateur');
        setNoAccess(true);
        setIsLoading(false);
        
      } catch (error) {
        logger.error('Erreur lors de la récupération du farm_id:', error);
        toast.error("Une erreur inattendue s'est produite");
        setIsLoading(false);
      }
    };

    if (isLoading) {
      fetchFarmId();
    }
  }, [equipmentId, isLoading]);

  return { farmId, isLoading, noAccess };
};
