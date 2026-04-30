import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, RotateCcw, PlayCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useOnboarding } from '@/contexts/OnboardingContext';

/**
 * Section "Tutoriel" dans Réglages → Profil.
 * Permet de relancer manuellement le tour de bienvenue ou de réinitialiser
 * tous les tours pour les voir réapparaître automatiquement.
 */
export function OnboardingSection() {
  const { forceStartTour, resetTours, completedTours, currentTour } = useOnboarding();

  const handleRestart = () => {
    forceStartTour('welcome');
    toast.success('Tour de bienvenue relancé');
  };

  const handleReset = async () => {
    await resetTours();
    toast.success('Tutoriels réinitialisés', {
      description: 'Ils se relanceront automatiquement aux moments opportuns.',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          Tutoriel guidé
        </CardTitle>
        <CardDescription>
          Relancez la visite guidée à tout moment ou réinitialisez tous les tutoriels.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          {completedTours.length === 0
            ? 'Aucun tutoriel complété pour le moment.'
            : `Tutoriels complétés : ${completedTours.length}/3`}
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleRestart}
            disabled={currentTour !== null}
            variant="default"
          >
            <PlayCircle className="h-4 w-4 mr-2" />
            Relancer le tour de bienvenue
          </Button>
          <Button
            onClick={handleReset}
            disabled={currentTour !== null}
            variant="outline"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Réinitialiser tous les tutoriels
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}