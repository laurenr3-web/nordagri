
import React from "react";
import { 
  BentoGrid, 
  BentoCard, 
  BentoCardHeader, 
  BentoCardTitle, 
  BentoCardDescription,
  BentoCardContent,
  BentoCardFooter,
  BentoCardIcon
} from "@/components/ui/bento-grid";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Bell, FileText, Clock } from "lucide-react";

// Demo data for our BentoGrid cards
const items = [
  {
    title: "Suivi du temps",
    description: "Suivez vos heures de travail et générez des rapports détaillés pour chaque projet ou équipement.",
    icon: Clock,
    variant: "glass" as const,
    image: "https://images.unsplash.com/photo-1614036417651-efe5912149d8?q=80&w=800&auto=format&fit=crop",
    href: "/time-tracking"
  },
  {
    title: "Maintenance planifiée",
    description: "Programmez et suivez les tâches de maintenance pour assurer le bon fonctionnement de vos équipements.",
    icon: Calendar,
    variant: "default" as const,
    image: "https://images.unsplash.com/photo-1586920740099-f3ceb65aa2f2?q=80&w=800&auto=format&fit=crop",
    href: "/maintenance"
  },
  {
    title: "Gestion des interventions",
    description: "Enregistrez et suivez toutes les interventions sur vos équipements agricoles.",
    icon: FileText,
    variant: "glass" as const,
    image: "https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?q=80&w=800&auto=format&fit=crop",
    href: "/interventions"
  },
  {
    title: "Alertes d'inventaire",
    description: "Recevez des notifications lorsque les stocks de pièces sont bas et qu'une commande est nécessaire.",
    icon: Bell,
    variant: "default" as const,
    image: "https://images.unsplash.com/photo-1535868463750-c78d9543614f?q=80&w=800&auto=format&fit=crop",
    href: "/parts"
  },
];

export function BentoGridDemo() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight mb-2">Fonctionnalités principales</h2>
        <p className="text-muted-foreground">
          Explorez les outils qui vous aideront à gérer votre équipement agricole efficacement.
        </p>
      </div>
      
      <BentoGrid className="mb-12">
        {items.map((item, i) => (
          <BentoCard 
            key={i} 
            variant={item.variant}
            backgroundUrl={item.image}
            className={i === 3 ? "md:col-span-2" : ""}
          >
            <BentoCardHeader>
              <BentoCardIcon>
                <item.icon className="h-6 w-6 text-primary" />
              </BentoCardIcon>
              <BentoCardTitle className="mt-3">{item.title}</BentoCardTitle>
              <BentoCardDescription>{item.description}</BentoCardDescription>
            </BentoCardHeader>
            <BentoCardContent />
            <BentoCardFooter>
              <Button variant="outline" size="sm" asChild>
                <a href={item.href}>
                  Voir plus <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </BentoCardFooter>
          </BentoCard>
        ))}

        <BentoCard size="md" variant="primary" height="md">
          <BentoCardHeader>
            <BentoCardTitle>Besoin d'aide?</BentoCardTitle>
            <BentoCardDescription>
              Notre équipe de support est disponible pour vous aider à tirer le meilleur parti de notre plateforme.
            </BentoCardDescription>
          </BentoCardHeader>
          <BentoCardContent className="flex items-center justify-center">
            <div className="text-center">
              <p className="text-lg font-medium">Contactez-nous</p>
            </div>
          </BentoCardContent>
          <BentoCardFooter className="justify-center">
            <Button>
              Assistance technique
            </Button>
          </BentoCardFooter>
        </BentoCard>
      </BentoGrid>
    </div>
  );
}
