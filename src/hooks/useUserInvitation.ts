
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useFarmId } from './useFarmId';
import { assertIsDefined, assertIsString } from '@/utils/typeAssertions';

// Define proper types for the invitation process
export type UserRole = 'viewer' | 'editor' | 'admin';

export interface InviteUserParams {
  email: string;
  role: UserRole;
}

export interface InviteUserResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    invitation_id: string;
    user_exists: boolean;
  };
}

/**
 * Hook to handle user invitation process
 * Provides functionality to invite users to a farm with specific roles
 */
export function useUserInvitation() {
  const [isLoading, setIsLoading] = useState(false);
  const { farmId } = useFarmId();

  /**
   * Invites a user to join the current farm with a specified role
   * @param params Object containing email and role for the invitation
   * @returns Promise resolving to success status
   */
  const inviteUser = async ({ email, role }: InviteUserParams): Promise<boolean> => {
    try {
      // Input validation
      if (!email) {
        toast.error("L'email est requis");
        return false;
      }
      
      // Validate email format using a simple regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error("Format d'email invalide");
        return false;
      }
      
      // Validate role is one of the allowed values
      if (!['viewer', 'editor', 'admin'].includes(role)) {
        toast.error("Rôle invalide");
        return false;
      }
      
      // Ensure farmId is available
      if (!farmId) {
        toast.error("Identifiant de ferme manquant");
        console.error("Farm ID is undefined");
        return false;
      }
      
      setIsLoading(true);
      
      console.log("Sending invitation with params:", { email, role, farmId });
      
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
      
      // Check if we have a response and if it has an error
      if (!data) {
        throw new Error("Aucune réponse reçue de la fonction d'invitation");
      }
      
      // Handle function-level errors (validation, business logic, etc.)
      if (!data.success) {
        const errorMessage = data.error || "Une erreur est survenue lors de l'invitation";
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
      
      console.error('Invitation error:', error);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { inviteUser, isLoading };
}
