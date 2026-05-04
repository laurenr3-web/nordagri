
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

export const useFarmId = (equipmentId?: number) => {
  const [farmId, setFarmId] = useState<string | null>(null);
  const [farmName, setFarmName] = useState<string | null>(null);
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
      // Fetch owned farms AND memberships in parallel.
      // Strategy: prefer a shared/populated farm over a solo "default" farm
      // created at signup. A solo farm = the user is owner AND the only member,
      // AND another farm membership exists. In that case, pick the membership.
      const [{ data: ownedFarms }, { data: memberFarms }] = await Promise.all([
        supabase.from('farms').select('id, name').eq('owner_id', userId),
        supabase
          .from('farm_members')
          .select('farm_id, farms:farm_id(id, name, owner_id)')
          .eq('user_id', userId),
      ]);

      const ownedList = ownedFarms ?? [];
      const memberList = (memberFarms ?? []).filter(
        (m: any) => m.farm_id && !ownedList.some((o: any) => o.id === m.farm_id),
      );

      // If owned, check member counts to detect "solo" farms
      if (ownedList.length > 0) {
        const ownedIds = ownedList.map((f: any) => f.id);
        const { data: memberCounts } = await supabase
          .from('farm_members')
          .select('farm_id')
          .in('farm_id', ownedIds);
        const countMap = new Map<string, number>();
        (memberCounts ?? []).forEach((m: any) => {
          countMap.set(m.farm_id, (countMap.get(m.farm_id) ?? 0) + 1);
        });

        // Prefer the most populated owned farm
        const ranked = [...ownedList].sort(
          (a: any, b: any) => (countMap.get(b.id) ?? 0) - (countMap.get(a.id) ?? 0),
        );
        const top = ranked[0];
        const topMembers = countMap.get(top.id) ?? 0;

        // If owner is alone in all owned farms but is a member elsewhere,
        // use the external membership instead (likely an invited user with
        // an auto-created solo farm leftover from signup).
        if (topMembers <= 1 && memberList.length > 0) {
          const m: any = memberList[0];
          logger.log('Préférence membership sur ferme solo:', m.farm_id);
          if (!isCancelled) {
            setFarmId(m.farm_id);
            setFarmName(m.farms?.name ?? null);
            setIsLoading(false);
          }
          return;
        }

        if (!isCancelled) {
          setFarmId(top.id);
          setFarmName(top.name ?? null);
          setIsLoading(false);
        }
        return;
      }

      // No owned farm — fall back to membership
      if (memberList.length > 0) {
        const m: any = memberList[0];
        if (!isCancelled) {
          setFarmId(m.farm_id);
          setFarmName(m.farms?.name ?? null);
          setIsLoading(false);
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

  return { farmId, farmName, isLoading, noAccess };
};
