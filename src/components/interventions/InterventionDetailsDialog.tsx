
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Clock, CheckCircle2, X, MapPin, User, CalendarCheck, Wrench } from 'lucide-react';
import { Intervention, InterventionStatus } from '@/types/Intervention';
import { useInterventionDetail } from '@/hooks/interventions/useInterventionDetail';

interface InterventionDetailsDialogProps {
  interventionId: number | string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartWork?: () => void;
}

const InterventionDetailsDialog: React.FC<InterventionDetailsDialogProps> = ({
  interventionId,
  open,
  onOpenChange,
  onStartWork
}) => {
  const { toast } = useToast();
  
  // Use the hook to fetch intervention details
  const {
    intervention,
    loading,
    error,
    handleInterventionUpdate
  } = useInterventionDetail(interventionId);
  
  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <div className="text-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <p className="mt-4 text-muted-foreground">Chargement des détails de l'intervention...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  if (error || !intervention) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Erreur</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-red-500">Impossible de charger les détails de l'intervention.</p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Fermer</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Helper function to format date
  const formatDate = (date: Date) => {
    try {
      return new Date(date).toLocaleDateString('fr-FR', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return 'Date invalide';
    }
  };
  
  // Helper function for status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return (
          <Badge variant="outline" className="bg-secondary flex items-center gap-1 text-muted-foreground">
            <CalendarCheck size={12} />
            <span>Planifiée</span>
          </Badge>
        );
      case 'in-progress':
        return (
          <Badge className="bg-harvest-100 text-harvest-800 flex items-center gap-1">
            <Clock size={12} />
            <span>En cours</span>
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-agri-100 text-agri-800 flex items-center gap-1">
            <CheckCircle2 size={12} />
            <span>Terminée</span>
          </Badge>
        );
      case 'canceled':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 flex items-center gap-1">
            <X size={12} />
            <span>Annulée</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-secondary text-muted-foreground">
            {status}
          </Badge>
        );
    }
  };
  
  // Helper function for priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return (
          <Badge className="bg-red-100 text-red-800">Élevée</Badge>
        );
      case 'medium':
        return (
          <Badge className="bg-harvest-100 text-harvest-800">Moyenne</Badge>
        );
      case 'low':
        return (
          <Badge className="bg-agri-100 text-agri-800">Basse</Badge>
        );
      default:
        return (
          <Badge variant="outline">{priority}</Badge>
        );
    }
  };

  const handleStatusChange = (status: InterventionStatus) => {
    if (intervention) {
      const updatedIntervention: Partial<Intervention> = {
        ...intervention,
        status
      };
      handleInterventionUpdate(updatedIntervention);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{intervention.title}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex flex-wrap justify-between items-start gap-2 mb-4">
            <div className="flex flex-wrap gap-2">
              {getStatusBadge(intervention.status)}
              {getPriorityBadge(intervention.priority)}
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="flex gap-2 items-start">
              <Wrench className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Équipement</p>
                <p className="font-medium">{intervention.equipment} (ID: {intervention.equipmentId})</p>
              </div>
            </div>
            
            <div className="flex gap-2 items-start">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Technicien</p>
                <p className="font-medium">{intervention.technician}</p>
              </div>
            </div>
            
            <div className="flex gap-2 items-start">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Localisation</p>
                <p className="font-medium">{intervention.location}</p>
              </div>
            </div>
            
            <div className="flex gap-2 items-start">
              <CalendarCheck className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">{formatDate(intervention.date)}</p>
              </div>
            </div>
            
            <div className="flex gap-2 items-start">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Durée</p>
                <p className="font-medium">
                  {intervention.status === 'completed' && intervention.duration ? 
                    `${intervention.duration} hrs (Réelle)` : 
                    `${intervention.scheduledDuration || 'N/A'} hrs (Planifiée)`
                  }
                </p>
              </div>
            </div>
          </div>
          
          {intervention.description && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-1">Description</p>
              <p className="bg-secondary/50 p-3 rounded-md">{intervention.description}</p>
            </div>
          )}
          
          {intervention.partsUsed && intervention.partsUsed.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-1">Pièces utilisées</p>
              <div className="bg-secondary/50 p-3 rounded-md">
                {intervention.partsUsed.map((part) => (
                  <div key={part.id} className="flex justify-between text-sm mb-1 last:mb-0">
                    <span>{part.name}</span>
                    <span className="font-medium">Qté: {part.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {intervention.notes && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-1">Notes</p>
              <p className="bg-secondary/50 p-3 rounded-md">{intervention.notes}</p>
            </div>
          )}
          
          {/* Status controls */}
          {intervention.status !== 'completed' && intervention.status !== 'canceled' && (
            <div className="grid grid-cols-1 mt-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Mettre à jour le statut</p>
                <div className="flex flex-wrap gap-2">
                  {intervention.status !== 'in-progress' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1"
                      onClick={() => {
                        handleStatusChange('in-progress');
                        if (onStartWork) onStartWork();
                      }}
                    >
                      <Clock size={14} />
                      <span>Démarrer</span>
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1"
                    onClick={() => handleStatusChange('completed')}
                  >
                    <CheckCircle2 size={14} />
                    <span>Marquer comme terminée</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1"
                    onClick={() => handleStatusChange('canceled')}
                  >
                    <X size={14} />
                    <span>Annuler</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Fermer</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InterventionDetailsDialog;
