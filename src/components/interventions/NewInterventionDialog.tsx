import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Intervention, InterventionFormValues } from '@/types/Intervention';
import { formatDate } from './utils/interventionUtils';

interface NewInterventionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (intervention: Partial<Intervention>) => void;
}

const NewInterventionDialog: React.FC<NewInterventionDialogProps> = ({ 
  open, 
  onOpenChange,
  onCreate 
}) => {
  // Mock form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create a mock intervention
    const newIntervention: Partial<Intervention> = {
      title: 'Nouvelle intervention',
      equipment: 'Tracteur Test',
      equipmentId: 999,
      location: 'Atelier principal',
      coordinates: { lat: 48.8566, lng: 2.3522 },
      status: 'scheduled',
      priority: 'medium',
      date: new Date(),
      scheduledDuration: 2,
      technician: 'Technicien Test',
      description: 'Description de la nouvelle intervention',
      notes: 'Notes pour la nouvelle intervention',
    };
    
    // Call the parent component's onCreate function
    onCreate(newIntervention);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nouvelle Intervention</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* This would be replaced with real form fields */}
          <div className="text-center text-muted-foreground">
            Formulaire de création d'intervention (exemple simplifié)
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit">Créer</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewInterventionDialog;
