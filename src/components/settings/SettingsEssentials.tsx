
import React from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const STRIPE_PRICE_ID_PRO_MONTHLY = "price_xxx_month"; // TODO: Remplacer par votre prix mensuel Stripe réel
const STRIPE_PRICE_ID_PRO_YEARLY = "price_xxx_year";  // TODO: Remplacer par votre prix annuel Stripe réel

export function SettingsEssentials() {
  const { subscription, loading, refresh } = useSubscription();

  const handleUpgrade = async (interval: "month" | "year") => {
    const priceId = interval === "month" ? STRIPE_PRICE_ID_PRO_MONTHLY : STRIPE_PRICE_ID_PRO_YEARLY;
    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: { priceId, interval },
    });
    if (data?.url) {
      window.location.href = data.url;
    } else {
      alert(error?.message || "Erreur lors de la création de la session de paiement");
    }
  };

  const handleManage = async () => {
    const { data, error } = await supabase.functions.invoke("customer-portal", { body: {} });
    if (data?.url) {
      window.location.href = data.url;
    } else {
      alert(error?.message || "Erreur lors de l'accès au portail client");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="font-semibold text-xl mb-1">Abonnement</h2>
      <div>
        {loading ? (
          <span className="text-muted-foreground">Chargement…</span>
        ) : subscription ? (
          <div className="p-4 border rounded-lg bg-muted space-y-2">
            <div>
              <span className="font-bold">Plan actif :</span>{" "}
              <span className="inline-block px-2 py-1 rounded bg-primary/10 text-primary font-medium">
                {subscription.plan?.toUpperCase()}
              </span>
              <span className="ml-3 text-xs text-muted-foreground">
                {subscription.status === "active"
                  ? "Actif"
                  : subscription.status === "trialing"
                  ? "Période d'essai"
                  : subscription.status === "past_due"
                  ? "En attente de paiement"
                  : subscription.status === "canceled"
                  ? "Annulé"
                  : "Inactif"}
              </span>
              {subscription.current_period_end && (
                <span className="ml-3 text-xs text-muted-foreground">
                  Jusqu'au : {new Date(subscription.current_period_end).toLocaleDateString()}
                </span>
              )}
            </div>
            {!subscription.active && (
              <div className="text-sm text-destructive font-medium p-2">
                Votre abonnement est inactif — certaines fonctionnalités sont désactivées.
              </div>
            )}
            <div className="flex gap-3">
              {subscription.plan === "pro" || subscription.plan === "enterprise" ? (
                <Button variant="secondary" onClick={handleManage}>
                  Gérer mon abonnement
                </Button>
              ) : (
                <>
                  <Button onClick={() => handleUpgrade("month")}>Mettre à niveau (29 $/mois)</Button>
                  <Button variant="outline" onClick={() => handleUpgrade("year")}>Annuel (290 $/an)</Button>
                </>
              )}
              <Button variant="ghost" onClick={refresh}>Rafraîchir</Button>
            </div>
          </div>
        ) : (
          <div className="p-4 border rounded text-muted-foreground">Aucun abonnement détecté.</div>
        )}
      </div>
    </div>
  );
}
