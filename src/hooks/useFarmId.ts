
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useFarmId = (equipmentId?: number) => {
  const [farmId, setFarmId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFarmId = async () => {
      try {
        // First attempt: Try to get farm_id from equipment if available
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

        // Second attempt: Try via user profile
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

        if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          console.error('Erreur profil:', profileError);
          toast.error("Erreur lors de la récupération du profil");
          setIsLoading(false);
          return;
        }

        // If farm_id found in profile, use it
        if (profileData?.farm_id) {
          console.log('Farm ID trouvé via profil:', profileData.farm_id);
          setFarmId(profileData.farm_id);
          setIsLoading(false);
          return;
        }

        // Third attempt: Create a new farm and update profile
        console.log('Aucun farm_id trouvé dans le profil, création d\'une ferme par défaut');
        
        // Create a new farm 
        const { data: newFarm, error: farmError } = await supabase
          .from('farms')
          .insert({
            name: 'Ma Ferme',
            owner_id: user.id
          })
          .select('id')
          .single();
        
        if (farmError) {
          console.error('Erreur lors de la création de la ferme:', farmError);
          toast.error("Erreur lors de la création de la ferme");
          setIsLoading(false);
          return;
        }

        if (newFarm?.id) {
          console.log('Nouvelle ferme créée avec ID:', newFarm.id);
          
          // Update profile with new farm_id
          const { error: updateError } = await supabase
            .from('profiles')
            .upsert({ 
              id: user.id,
              farm_id: newFarm.id 
            });
            
          if (updateError) {
            console.error('Erreur lors de la mise à jour du profil:', updateError);
          }
              
          setFarmId(newFarm.id);
          setIsLoading(false);
          
          // If equipmentId is provided, also update the equipment with the new farm_id
          if (equipmentId) {
            const { error: equipUpdateError } = await supabase
              .from('equipment')
              .update({ farm_id: newFarm.id })
              .eq('id', equipmentId);
              
            if (equipUpdateError) {
              console.error('Erreur lors de la mise à jour de l\'équipement:', equipUpdateError);
            }
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du farm_id:', error);
        toast.error("Une erreur inattendue s'est produite");
        setIsLoading(false);
      }
    };

    if (isLoading) {
      fetchFarmId();
    }
  }, [equipmentId, isLoading]);

  return { farmId, isLoading };
};
