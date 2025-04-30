
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useFarmId } from './useFarmId';

// Define proper types for the invitation process
export type UserRole = 'viewer' | 'editor' | 'admin';

export interface InviteUserParams {
  email: string;
  role: UserRole;
}

export interface InviteUserResponse {
  success: boolean;
  message?: string;
  data?: {
    invitation_id: string;
    user_exists: boolean;
  };
}

export function useUserInvitation() {
  const [isLoading, setIsLoading] = useState(false);
  const { farmId } = useFarmId();

  const inviteUser = async ({ email, role }: InviteUserParams): Promise<boolean> => {
    // Input validation
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
      // Call the Edge function to invite the user
      const { data, error } = await supabase.functions.invoke<InviteUserResponse>('invite-user', {
        body: { 
          email,
          role,
          farmId 
        }
      });

      // Handle Supabase errors (network, auth, etc.)
      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || "Erreur lors de l'appel à la fonction d'invitation");
      }
      
      // Handle function-level errors (validation, business logic, etc.)
      if (!data?.success) {
        const errorMessage = data?.message || "Une erreur est survenue lors de l'invitation";
        console.error('Invitation failed:', errorMessage);
        throw new Error(errorMessage);
      }

      // Success case
      toast.success(`Invitation envoyée à ${email}`);
      return true;
    } catch (error: unknown) {
      // Type narrowing for proper error handling
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Une erreur inattendue est survenue lors de l'invitation";
      
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { inviteUser, isLoading };
}
