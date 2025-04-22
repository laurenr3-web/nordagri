
import React, { useState, useEffect } from 'react';
import Joyride, { CallBackProps, Status, Step } from 'react-joyride';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface OnboardingTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function OnboardingTour({ onComplete, onSkip }: OnboardingTourProps) {
  const [run, setRun] = useState(true);
  const [steps] = useState<Step[]>([
    {
      target: 'body',
      content: (
        <div className="space-y-2">
          <h3 className="font-medium text-lg">Bienvenue à NordAgri</h3>
          <p>Découvrez comment gérer facilement vos équipements agricoles.</p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '.navbar-link-equipment',
      content: (
        <div className="space-y-2">
          <h3 className="font-medium">Gestion d'équipements</h3>
          <p>Consultez et gérez tous vos équipements agricoles ici.</p>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '.time-tracking-button',
      content: (
        <div className="space-y-2">
          <h3 className="font-medium">Suivi du temps</h3>
          <p>Suivez le temps passé sur chaque équipement et intervention.</p>
        </div>
      ),
      placement: 'top',
    },
    {
      target: '.filter-section',
      content: (
        <div className="space-y-2">
          <h3 className="font-medium">Filtres avancés</h3>
          <p>Utilisez ces filtres pour trouver rapidement ce que vous cherchez.</p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '.reports-section',
      content: (
        <div className="space-y-2">
          <h3 className="font-medium">Rapports et analyses</h3>
          <p>Générez des rapports détaillés pour analyser vos activités.</p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: 'body',
      content: (
        <div className="space-y-2">
          <h3 className="font-medium">Prêt à commencer!</h3>
          <p>Vous avez maintenant une vue d'ensemble de l'application. Bonne utilisation!</p>
        </div>
      ),
      placement: 'center',
    }
  ]);

  useEffect(() => {
    // Check if there are matching elements for each step
    // This prevents errors when a step's target doesn't exist
    steps.forEach((step, index) => {
      if (index > 0 && step.target !== 'body') {
        const target = document.querySelector(step.target as string);
        if (!target) {
          console.warn(`Target element for step ${index} not found: ${step.target}`);
        }
      }
    });
  }, [steps]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    
    if (status === 'finished') {
      setRun(false);
      onComplete();
      toast.success("Tutoriel terminé avec succès!");
    } else if (status === 'skipped') {
      setRun(false);
      onSkip();
      toast.info("Tutoriel désactivé");
    }
  };

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      hideCloseButton
      run={run}
      scrollToFirstStep
      showProgress
      showSkipButton
      steps={steps}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: '#22c55e',
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        buttonBack: {
          marginRight: 10,
        },
      }}
      locale={{
        last: 'Terminer',
        skip: 'Désactiver le tutoriel',
        next: 'Suivant',
        back: 'Précédent',
      }}
    />
  );
}
