
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useFarmId = (equipmentId?: number) => {
  const [farmId, setFarmId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [noAccess, setNoAccess] = useState(false);

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
            // Vérifier que l'utilisateur a accès à cette ferme via farm_members
            const { data: memberData, error: memberError } = await supabase
              .from('farm_members')
              .select('id')
              .eq('farm_id', equipmentData.farm_id)
              .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
              .single();
              
            if (!memberError && memberData) {
              console.log('Farm ID trouvé via equipment et accès confirmé:', equipmentData.farm_id);
              setFarmId(equipmentData.farm_id);
              setIsLoading(false);
              return;
            } else {
              console.log('Accès à la ferme refusé pour cet équipement');
            }
          }
        }

        // Second attempt: Try to get accessible farms via farm_members
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          console.error('Erreur auth:', authError);
          toast.error("Erreur d'authentification");
          setIsLoading(false);
          return;
        }

        console.log('Recherche des fermes accessibles via farm_members');
        const { data: farmMembers, error: membersError } = await supabase
          .from('farm_members')
          .select('farm_id')
          .eq('user_id', user.id);

        if (membersError) {
          console.error('Erreur lors de la récupération des fermes accessibles:', membersError);
          toast.error("Erreur lors de la vérification des accès");
          setIsLoading(false);
          return;
        }

        if (farmMembers && farmMembers.length > 0) {
          // Utilisateur a accès à au moins une ferme
          console.log('Fermes accessibles trouvées:', farmMembers.length);
          
          // On prend la première ferme accessible
          const firstFarmId = farmMembers[0].farm_id;
          setFarmId(firstFarmId);
          setIsLoading(false);
          
          // Si plusieurs fermes sont accessibles, on pourrait ajouter une UI pour sélectionner
          if (farmMembers.length > 1) {
            console.info('Utilisateur a accès à plusieurs fermes:', farmMembers.length);
            // Cette information pourrait être utilisée pour afficher un sélecteur de ferme
          }
          
          return;
        }

        // Aucune ferme accessible - l'utilisateur doit être invité
        console.log('Aucune ferme accessible trouvée pour cet utilisateur');
        setNoAccess(true);
        setIsLoading(false);
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

  return { farmId, isLoading, noAccess };
};
