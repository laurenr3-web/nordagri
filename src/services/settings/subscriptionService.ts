
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const subscriptionService = {
  async createStripePortalSession(): Promise<string | null> {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        body: {}
      });
      
      if (error) throw error;
      
      return data?.url || null;
    } catch (error: any) {
      console.error('Erreur lors de la création de la session Stripe:', error);
      toast.error(`Erreur: ${error.message || 'Impossible de créer la session Stripe'}`);
      return null;
    }
  }
};
