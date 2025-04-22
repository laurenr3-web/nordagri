
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    name: "Gratuit",
    price: "0 $/mois",
    badge: "🆓",
    description: "Accédez aux modules essentiels pour petits besoins.",
    features: [
      { label: "Modules inclus", value: "Temps, pièces", available: true },
      { label: "Nombre d’utilisateurs", value: "1 utilisateur", available: true },
      { label: "Équipements", value: "5", available: true },
      { label: "Support", value: "Email", available: true },
      { label: "Export CSV/PDF", value: "❌", available: false },
      { label: "Alertes SMS/Email", value: "❌", available: false },
      { label: "API & Webhooks", value: "❌", available: false },
      { label: "Personnalisation", value: "❌", available: false },
    ],
    cta: "Démarrer",
  },
  {
    name: "Pro",
    price: "29 $/mois\nou 290 $/an",
    badge: "💼",
    description: "Fonctionnalités complètes pour équipes et fermes en croissance.",
    features: [
      { label: "Modules inclus", value: "Tous (carburant, rapport…)", available: true },
      { label: "Nombre d’utilisateurs", value: "5 utilisateurs", available: true },
      { label: "Équipements", value: "Illimité", available: true },
      { label: "Support", value: "Prioritaire par email", available: true },
      { label: "Export CSV/PDF", value: "✅", available: true },
      { label: "Alertes SMS/Email", value: "Email uniquement", available: true },
      { label: "API & Webhooks", value: "❌", available: false },
      { label: "Personnalisation", value: "Partielle (logos)", available: true },
    ],
    cta: "Démarrer",
    badgeVariant: "info"
  },
  {
    name: "Entreprise",
    price: "Sur demande (à partir de 99 $/mois)\nou 990 $/an minimum",
    badge: "🏢",
    description: "Tout inclus et personnalisable pour grandes structures agricoles.",
    features: [
      { label: "Modules inclus", value: "Tous + API + exports avancés", available: true },
      { label: "Nombre d’utilisateurs", value: "Illimité", available: true },
      { label: "Équipements", value: "Illimité", available: true },
      { label: "Support", value: "Dédié (email + téléphone)", available: true },
      { label: "Export CSV/PDF", value: "✅ + Automatisé", available: true },
      { label: "Alertes SMS/Email", value: "Email + SMS", available: true },
      { label: "API & Webhooks", value: "✅", available: true },
      { label: "Personnalisation", value: "Avancée (modules, branding)", available: true },
    ],
    cta: "Démarrer",
    badgeVariant: "success"
  },
];

export default function Pricing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex flex-col items-center bg-background px-4 py-10">
      <div className="w-full max-w-5xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">Tarification NordAgri</h1>
        <p className="text-center mb-8 text-muted-foreground max-w-2xl mx-auto">
          Découvrez nos formules adaptables à toutes les exploitations. Démarrez gratuitement, puis choisissez l’accompagnement qui vous convient.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <Card key={plan.name} className="flex flex-col shadow-card hover:shadow-elevated transition-shadow border-2 border-muted/60">
              <CardHeader className="text-center flex flex-col items-center gap-2">
                <Badge variant={
                  plan.badgeVariant
                    ? plan.badgeVariant as any
                    : "secondary"
                } className="text-2xl px-3 py-1 mb-2">{plan.badge}</Badge>
                <CardTitle className="text-2xl mb-1">{plan.name}</CardTitle>
                <CardDescription className="whitespace-pre-line">{plan.price}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-2">
                <p className="text-muted-foreground mb-4 text-center">{plan.description}</p>
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={feature.label} className="flex items-center gap-2 text-sm">
                      {feature.available ? (
                        <Check className="text-green-600 shrink-0" aria-label="Inclus" />
                      ) : (
                        <X className="text-destructive shrink-0" aria-label="Non inclus" />
                      )}
                      <span className="font-medium">{feature.label} :</span>
                      <span className="ml-1">{feature.value}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="flex flex-col">
                <Button
                  className="w-full mt-2"
                  size="lg"
                  onClick={() => navigate("/auth")}
                  variant={plan.name === "Gratuit" ? "outline" : "default"}
                >
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        <div className="mt-9 text-center text-muted-foreground text-xs max-w-xl mx-auto">
          <span className="block mb-1">🔁 <strong>Option annuelle</strong> : </span>
          <span className="block">
            <span className="font-bold">Pro</span> : 290 $/an (2&nbsp;mois offerts)<br />
            <span className="font-bold">Entreprise</span> : 990 $/an minimum (tarif personnalisé selon la taille de la ferme)
          </span>
        </div>
      </div>
    </div>
  );
}
