
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SubscriptionData {
  plan: string;
  status: string;
  active: boolean;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
}

/**
 * Hook pour gérer l'état de l'abonnement de l'utilisateur
 * Récupère les données d'abonnement depuis Stripe via une fonction Supabase
 */
export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSubscription = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Appeler la fonction edge pour vérifier l'état de l'abonnement
      const { data, error } = await supabase.functions.invoke("check-subscription", {
        body: {}
      });
      
      if (error) {
        throw new Error(error.message || "Impossible de récupérer les détails de l'abonnement");
      }
      
      setSubscription(data);
    } catch (err: any) {
      console.error("Erreur lors de la vérification de l'abonnement:", err);
      setError(err);
      toast.error("Impossible de récupérer les informations d'abonnement");
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Récupérer l'abonnement au montage du composant
  useEffect(() => {
    fetchSubscription();
    
    // Paramètres d'URL pour le retour de Stripe Checkout
    const urlParams = new URLSearchParams(window.location.search);
    const checkoutStatus = urlParams.get('checkout');
    
    // Afficher des notifications en fonction du statut de retour de Stripe
    if (checkoutStatus === 'success') {
      toast.success("Paiement traité avec succès! Votre abonnement est maintenant actif.");
    } else if (checkoutStatus === 'cancel') {
      toast.info("Paiement annulé. Votre abonnement n'a pas été modifié.");
    }
  }, [fetchSubscription]);

  return { 
    subscription, 
    loading, 
    error, 
    refresh: fetchSubscription 
  };
}
