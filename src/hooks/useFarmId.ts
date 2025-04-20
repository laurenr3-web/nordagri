
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
          console.log('Aucun farm_id trouvé dans le profil, création d\'un identifiant par défaut');
          
          // 3. Si aucune ferme n'est associée, utiliser une valeur par défaut pour éviter les blocages d'interface
          const defaultFarmId = user.id; // Utiliser l'ID utilisateur comme ID de ferme par défaut
          setFarmId(defaultFarmId);
          
          // Option: créer automatiquement une ferme pour cet utilisateur
          const { data: newFarm, error: farmError } = await supabase
            .from('farms')
            .insert({
              name: 'Ma Ferme',
              owner_id: user.id
            })
            .select('id')
            .single();
          
          if (!farmError && newFarm?.id) {
            console.log('Nouvelle ferme créée avec ID:', newFarm.id);
            
            // Mettre à jour le profil avec le nouveau farm_id
            await supabase
              .from('profiles')
              .update({ farm_id: newFarm.id })
              .eq('id', user.id);
              
            setFarmId(newFarm.id);
          }
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
