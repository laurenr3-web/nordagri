
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useFarmId } from './useFarmId';

export type UserRole = 'viewer' | 'editor' | 'admin';

export interface InviteUserParams {
  email: string;
  role: UserRole;
}

export function useUserInvitation() {
  const [isLoading, setIsLoading] = useState(false);
  const { farmId } = useFarmId();

  const inviteUser = async ({ email, role }: InviteUserParams): Promise<boolean> => {
    try {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast.error("Format d'email invalide");
        return false;
      }
      if (!['viewer', 'editor', 'admin'].includes(role)) {
        toast.error("Rôle invalide");
        return false;
      }
      if (!farmId) {
        toast.error("Identifiant de ferme manquant");
        return false;
      }

      setIsLoading(true);

      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      if (!accessToken) {
        toast.error("Session expirée, veuillez vous reconnecter");
        return false;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ email, role, farmId }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        const msg = data?.error || "Une erreur est survenue lors de l'invitation";
        toast.error(msg);
        return false;
      }

      toast.success(`Invitation envoyée à ${email}`);
      return true;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erreur inattendue";
      console.error('Invitation error:', error);
      toast.error(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { inviteUser, isLoading };
}
