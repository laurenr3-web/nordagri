
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface InviteUserProps {
  email: string;
  role: 'administrator' | 'employee';
}

export function useUserInvitation() {
  const [isLoading, setIsLoading] = useState(false);

  const inviteUser = async ({ email, role }: InviteUserProps) => {
    if (!email) {
      toast.error("L'email est requis");
      return false;
    }

    setIsLoading(true);
    try {
      // 1. Vérifier si l'utilisateur a un farm_id
      const { data: creatorProfile, error: profileError } = await supabase
        .from('profiles')
        .select('farm_id')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (profileError || !creatorProfile.farm_id) {
        throw new Error("Impossible de récupérer la ferme de l'utilisateur actuel");
      }

      // 2. Créer l'utilisateur via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
      });

      if (authError) {
        if (authError.message.includes('already exists')) {
          throw new Error("Cet email est déjà utilisé");
        }
        throw authError;
      }

      // 3. Assigner le rôle à l'utilisateur
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: role,
        });

      if (roleError) {
        throw roleError;
      }

      toast.success("L'utilisateur a été invité avec succès");
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
