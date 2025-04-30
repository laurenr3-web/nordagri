
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useFarmId } from './useFarmId';

interface InviteUserProps {
  email: string;
  role: 'viewer' | 'editor' | 'admin'; // Roles mis à jour
}

export function useUserInvitation() {
  const [isLoading, setIsLoading] = useState(false);
  const { farmId } = useFarmId();

  const inviteUser = async ({ email, role }: InviteUserProps) => {
    if (!email) {
      toast.error("L'email est requis");
      return false;
    }
    
    if (!farmId) {
      toast.error("Aucune ferme associée à votre compte");
      return false;
    }

    setIsLoading(true);
    try {
      // Utiliser la fonction Edge pour inviter l'utilisateur
      const { data, error } = await supabase.functions.invoke('invite-user', {
        body: { 
          email,
          role,
          farmId 
        }
      });

      if (error) {
        throw new Error(error.message);
      }
      
      if (!data?.success) {
        throw new Error(data?.message || "Une erreur est survenue lors de l'invitation");
      }

      toast.success(`Invitation envoyée à ${email}`);
      return true;
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue lors de l'invitation");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { inviteUser, isLoading };
}
