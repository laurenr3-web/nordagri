
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Step {
  title: string;
  description: string;
  selector?: string;
}

const ONBOARDING_STEPS: Step[] = [
  {
    title: "Navigation principale",
    description: "Voici la barre de navigation latérale pour accéder à toutes les fonctionnalités.",
    selector: "[aria-label='Barre latérale principale']"
  },
  {
    title: "Créer un équipement",
    description: "Créez de nouveaux équipements pour suivre leur état et maintenance.",
    selector: "[aria-label='navbar.equipment']"
  },
  {
    title: "Suivi du temps",
    description: "Cliquez ici pour suivre votre temps de travail simplement.",
    selector: "[aria-label='navbar.time']"
  },
  {
    title: "Exporter un rapport",
    description: "Rendez-vous dans le tableau de bord ou le suivi du temps pour exporter vos rapports.",
    selector: ".story-link"
  }
];

interface OnboardingOverlayProps {
  open: boolean;
  onClose: () => void;
}
export const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({ open, onClose }) => {
  const [currentStep, setCurrentStep] = React.useState(0);
  React.useEffect(() => {
    if (open) setCurrentStep(0);
  }, [open]);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      onClose();
    }
  };

  const step = ONBOARDING_STEPS[currentStep];

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-md mx-auto animate-fade-in">
        <DialogHeader>
          <DialogTitle>{step.title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">{step.description}</div>
        <DialogFooter>
          <Button onClick={handleNext} autoFocus>
            {currentStep < ONBOARDING_STEPS.length - 1 ? "Suivant" : "Terminer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
