
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Wrench, Trash2 } from 'lucide-react';
import { Intervention } from '@/types/Intervention';
import { formatDate } from './utils/interventionUtils';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { DeleteInterventionAlert } from './dialogs/DeleteInterventionAlert';
import { useDeleteIntervention } from '@/hooks/interventions/useDeleteIntervention';

interface InterventionDetailsDialogProps {
  intervention: Intervention;
  isOpen: boolean;
  onClose: () => void;
  onStartWork: () => void;
  handleInterventionUpdate: (interventionId: number, updates: Partial<Intervention>) => void;
}

const InterventionDetailsDialog: React.FC<InterventionDetailsDialogProps> = ({ 
  intervention, 
  isOpen, 
  onClose, 
  onStartWork,
  handleInterventionUpdate
}) => {
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const { deleteIntervention, isDeleting } = useDeleteIntervention();

  const handleDelete = () => {
    deleteIntervention(intervention.id, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center justify-between">
              <span>{intervention.title}</span>
              <div className="flex items-center gap-2">
                <StatusBadge status={intervention.status} />
                <PriorityBadge priority={intervention.priority} />
              </div>
            </DialogTitle>
            <DialogDescription>
              <div className="text-sm text-muted-foreground">
                {typeof intervention.date === 'string' ? formatDate(new Date(intervention.date)) : formatDate(intervention.date)}
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">Équipement</h3>
                <p>{intervention.equipment}</p>
              </div>
              <div>
                <h3 className="font-semibold">Lieu</h3>
                <p>{intervention.location}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">Technicien assigné</h3>
                <p>{intervention.technician || 'Non assigné'}</p>
              </div>
              <div>
                <h3 className="font-semibold">Durée prévue</h3>
                <p>{intervention.scheduledDuration} heure(s)</p>
              </div>
            </div>

            {intervention.status === 'completed' && intervention.duration && (
              <div>
                <h3 className="font-semibold">Durée réelle</h3>
                <p>{intervention.duration} heure(s)</p>
              </div>
            )}

            <div>
              <h3 className="font-semibold">Description</h3>
              <p className="whitespace-pre-wrap">{intervention.description}</p>
            </div>

            {intervention.notes && (
              <div>
                <h3 className="font-semibold">Notes</h3>
                <p className="whitespace-pre-wrap">{intervention.notes}</p>
              </div>
            )}

            {intervention.partsUsed && intervention.partsUsed.length > 0 && (
              <div>
                <h3 className="font-semibold">Pièces utilisées</h3>
                <ul className="list-disc pl-5">
                  {intervention.partsUsed.map((part, index) => (
                    <li key={index}>
                      {part.name} - Quantité: {part.quantity}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsDeleteAlertOpen(true)}
              className="gap-1"
            >
              <Trash2 size={16} />
              <span>Supprimer</span>
            </Button>
            <div className="flex gap-2 ml-auto">
              {intervention.status === 'scheduled' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="gap-1"
                  onClick={onStartWork}
                >
                  <Wrench size={16} />
                  <span>Démarrer</span>
                </Button>
              )}
              <DialogClose asChild>
                <Button size="sm">Fermer</Button>
              </DialogClose>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <DeleteInterventionAlert
        open={isDeleteAlertOpen}
        onOpenChange={setIsDeleteAlertOpen}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default InterventionDetailsDialog;
