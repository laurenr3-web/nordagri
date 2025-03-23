
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, Clock, MapPin, Tractor } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface OptiFieldHeaderProps {
  trackingActive: boolean;
  setTrackingActive: (active: boolean) => void;
}

const OptiFieldHeader: React.FC<OptiFieldHeaderProps> = ({ 
  trackingActive, 
  setTrackingActive 
}) => {
  const { toast } = useToast();

  const handleTrackingToggle = () => {
    const newState = !trackingActive;
    setTrackingActive(newState);
    
    toast({
      title: newState ? "Suivi activé" : "Suivi désactivé",
      description: newState 
        ? "Le suivi de position est maintenant actif."
        : "Le suivi de position est maintenant en pause.",
      variant: newState ? "default" : "destructive",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">OptiField</h1>
          <p className="text-muted-foreground">
            Suivi et optimisation des travaux au champ
          </p>
        </div>
        <Button
          onClick={handleTrackingToggle}
          variant={trackingActive ? "destructive" : "default"}
          size="lg"
          className="gap-2"
        >
          {trackingActive ? (
            <>
              <Pause className="h-4 w-4" />
              Arrêter le suivi
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Démarrer le suivi
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Tractor className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Équipement actif</p>
            <p className="font-medium">Tracteur John Deere 6250R</p>
          </div>
        </Card>
        
        <Card className="p-4 flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <MapPin className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Parcelle actuelle</p>
            <p className="font-medium">Les Grandes Terres</p>
          </div>
        </Card>
        
        <Card className="p-4 flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Clock className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Temps de travail</p>
            <p className="font-medium">3h 15min aujourd'hui</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OptiFieldHeader;
