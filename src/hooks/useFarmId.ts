
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useFarmId = (equipmentId?: number) => {
  const [farmId, setFarmId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFarmId = async () => {
      try {
        // 1. D'abord, essayer de récupérer via l'équipement si disponible
        if (equipmentId) {
          console.log('Tentative de récupération du farm_id depuis l\'équipement:', equipmentId);
          const { data: equipmentData, error: equipmentError } = await supabase
            .from('equipment')
            .select('farm_id')
            .eq('id', equipmentId)
            .single();

          if (!equipmentError && equipmentData?.farm_id) {
            console.log('Farm ID trouvé via equipment:', equipmentData.farm_id);
            setFarmId(equipmentData.farm_id);
            setIsLoading(false);
            return;
          }
        }

        // 2. Sinon, essayer via le profil utilisateur
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          console.error('Erreur auth:', authError);
          toast.error("Erreur d'authentification");
          setIsLoading(false);
          return;
        }

        console.log('Tentative de récupération du farm_id depuis le profil');
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('farm_id')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Erreur profil:', profileError);
          setIsLoading(false);
          return;
        }

        if (profileData?.farm_id) {
          console.log('Farm ID trouvé via profil:', profileData.farm_id);
          setFarmId(profileData.farm_id);
        } else {
          console.log('Aucun farm_id trouvé');
          // Optionnel: Ajouter un toast pour informer que le farm_id est manquant
          toast.warning("Aucune ferme n'est associée à ce profil");
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du farm_id:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFarmId();
  }, [equipmentId]);

  return { farmId, isLoading };
};
