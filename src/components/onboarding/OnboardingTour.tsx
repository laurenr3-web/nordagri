
import React, { useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface OnboardingTourProps {
  onComplete?: () => void;
}

export const OnboardingTour = ({ onComplete }: OnboardingTourProps) => {
  const [run, setRun] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const location = useLocation();

  // Effet pour déterminer quels steps afficher selon la page
  useEffect(() => {
    // Récupérer le statut de l'onboarding
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial') === 'true';
    
    if (hasSeenTutorial) {
      return;
    }

    // Définir les étapes selon la page actuelle
    const currentSteps: Step[] = [];
    
    // Étapes pour la page dashboard
    if (location.pathname === '/dashboard') {
      currentSteps.push(
        {
          target: 'body',
          content: 'Bienvenue sur NordAgri! Découvrez comment utiliser l\'application avec ce tutoriel rapide.',
          placement: 'center',
          disableBeacon: true,
        },
        {
          target: '.time-tracking-button',
          content: 'Suivez votre temps de travail avec cet outil. Cliquez pour démarrer une nouvelle session.',
          placement: 'top',
        }
      );
    }

    // Étapes pour la page équipement
    else if (location.pathname === '/equipment') {
      currentSteps.push(
        {
          target: '.equipment-filters',
          content: 'Filtrez vos équipements par catégorie ou état.',
          placement: 'bottom',
        },
        {
          target: '.equipment-add-button',
          content: 'Ajoutez un nouvel équipement en cliquant ici.',
          placement: 'left',
        }
      );
    }

    // Étapes pour la page de pièces
    else if (location.pathname === '/parts') {
      currentSteps.push(
        {
          target: '.parts-search',
          content: 'Recherchez des pièces par nom ou référence.',
          placement: 'bottom',
        },
        {
          target: '.add-part-button',
          content: 'Ajoutez une nouvelle pièce à votre inventaire.',
          placement: 'left',
        }
      );
    }

    // Étapes pour la page de suivi du temps
    else if (location.pathname === '/time-tracking') {
      currentSteps.push(
        {
          target: '.time-tracking-filters',
          content: 'Filtrez vos sessions par date, équipement ou type de tâche.',
          placement: 'bottom',
        },
        {
          target: '.export-reports-button',
          content: 'Exportez vos rapports de temps en PDF ou Excel.',
          placement: 'left',
        }
      );
    }

    // Si des étapes ont été définies, démarrer le tour
    if (currentSteps.length > 0) {
      setSteps(currentSteps);
      setRun(true);
    }
  }, [location.pathname]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    
    // Si le tutoriel est terminé ou sauté
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRun(false);
      
      // Montrer un toast pour proposer de désactiver définitivement
      toast.info(
        "Tutoriel terminé", 
        { 
          description: "Vous pouvez le réactiver depuis les paramètres.", 
          action: {
            label: "Ne plus afficher",
            onClick: () => {
              localStorage.setItem('hasSeenTutorial', 'true');
              if (onComplete) onComplete();
            }
          }
        }
      );
    }
  };

  // Si aucune étape n'est définie ou si le tutoriel a déjà été vu, ne rien afficher
  if (steps.length === 0) {
    return null;
  }

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
          primaryColor: '#22c55e', // vert comme le thème agricole
          zIndex: 10000,
        },
        tooltip: {
          fontSize: '14px',
        },
        buttonSkip: {
          color: '#666',
        },
      }}
      locale={{
        back: 'Précédent',
        close: 'Fermer',
        last: 'Terminer',
        next: 'Suivant',
        skip: 'Passer',
      }}
    />
  );
};
