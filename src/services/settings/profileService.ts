
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProfileUpdateData {
  full_name?: string;
  email?: string;
}

export const profileService = {
  async updateProfile(userId: string, data: ProfileUpdateData): Promise<boolean> {
    try {
      // Mettre à jour l'email dans Auth si nécessaire
      if (data.email) {
        const { error: authError } = await supabase.auth.updateUser({
          email: data.email,
        });
        
        if (authError) throw authError;
      }
      
      // Mettre à jour le profil dans la table profiles
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: data.full_name?.split(' ')[0] || '',
          last_name: data.full_name?.split(' ').slice(1).join(' ') || ''
        })
        .eq('id', userId);
      
      if (error) throw error;
      
      return true;
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      toast.error(`Erreur: ${error.message || 'Impossible de mettre à jour le profil'}`);
      return false;
    }
  },

  async updatePassword(newPassword: string): Promise<boolean> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) throw error;
      
      return true;
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error);
      toast.error(`Erreur: ${error.message || 'Impossible de mettre à jour le mot de passe'}`);
      return false;
    }
  }
};
