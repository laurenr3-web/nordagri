
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/providers/AuthProvider';
import { useFarmId } from '@/hooks/useFarmId';

export type FarmRole = 'owner' | 'admin' | 'member' | 'viewer' | null;

interface UseFarmRoleResult {
  role: FarmRole;
  canEdit: boolean;
  canDelete: boolean;
  isLoading: boolean;
}

export function useFarmRole(): UseFarmRoleResult {
  const { user } = useAuthContext();
  const { farmId } = useFarmId();
  const [role, setRole] = useState<FarmRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !farmId) {
      setRole(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const resolve = async () => {
      try {
        // Check if owner
        const { data: farm } = await supabase
          .from('farms')
          .select('id')
          .eq('id', farmId)
          .eq('owner_id', user.id)
          .maybeSingle();

        if (cancelled) return;

        if (farm) {
          setRole('owner');
          setIsLoading(false);
          return;
        }

        // Check farm_members role
        const { data: membership } = await supabase
          .from('farm_members')
          .select('role')
          .eq('farm_id', farmId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (cancelled) return;

        if (membership?.role) {
          setRole(membership.role as FarmRole);
        } else {
          setRole(null);
        }
      } catch (e) {
        console.error('Error resolving farm role:', e);
        if (!cancelled) setRole(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    setIsLoading(true);
    resolve();

    return () => { cancelled = true; };
  }, [user?.id, farmId]);

  const roleLevel = role === 'owner' ? 4 : role === 'admin' ? 3 : role === 'member' ? 2 : role === 'viewer' ? 1 : 0;

  return {
    role,
    canEdit: roleLevel >= 2,   // member+
    canDelete: roleLevel >= 3, // admin+
    isLoading,
  };
}
