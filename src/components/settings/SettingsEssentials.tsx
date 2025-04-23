import React from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/providers/AuthProvider";
import { useOnboarding } from "@/hooks/useOnboarding";
import { OnboardingOverlay } from "@/components/onboarding/OnboardingOverlay";

const STRIPE_PRICE_ID_PRO_MONTHLY = "price_xxx_month"; // TODO: Remplacer par votre prix mensuel Stripe réel
const STRIPE_PRICE_ID_PRO_YEARLY = "price_xxx_year";  // TODO: Remplacer par votre prix annuel Stripe réel

export function SettingsEssentials() {
  const { subscription, loading, refresh } = useSubscription();
  const { user } = useAuthContext();
  const { hasSeen, setFlag } = useOnboarding(user?.id);
  const [showOnboarding, setShowOnboarding] = React.useState(false);

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

  const triggerOnboarding = () => setShowOnboarding(true);

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

      <div className="mt-10">
        <h3 className="font-semibold">Onboarding</h3>
        <p className="text-muted-foreground text-sm">
          Vous pouvez relancer le tutoriel à tout moment.
        </p>
        <button
          type="button"
          className="mt-2 px-4 py-2 rounded bg-primary text-white hover:bg-primary/90"
          onClick={triggerOnboarding}
        >
          Relancer le tutoriel
        </button>
        <OnboardingOverlay
          open={showOnboarding}
          onClose={() => {
            setShowOnboarding(false);
            setFlag(true);
          }}
        />
      </div>
    </div>
  );
}
