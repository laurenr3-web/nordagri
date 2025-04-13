
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { maintenanceService } from '@/services/supabase/maintenanceService';

interface MaintenanceCompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: any; // Using any for now since we're adapting between different types
  onCompleted: () => void;
  userName?: string;
}

const MaintenanceCompletionDialog: React.FC<MaintenanceCompletionDialogProps> = ({
  open,
  onOpenChange,
  task,
  onCompleted,
  userName = ''
}) => {
  const [actualDuration, setActualDuration] = useState<string>(
    task && task.estimated_duration ? task.estimated_duration.toString() : ''
  );
  const [completionNotes, setCompletionNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleComplete = async () => {
    try {
      setIsSubmitting(true);
      
      // Validate input
      if (!actualDuration || isNaN(parseFloat(actualDuration))) {
        toast.error("Veuillez saisir une durée valide");
        return;
      }
      
      // Prepare completion notes
      const notes = `${task.notes || ''}
      
Complété le ${new Date().toLocaleDateString()} 
Durée: ${actualDuration} heures
${userName ? `Technicien: ${userName}` : ''}
Notes de complétion: ${completionNotes}`;
      
      // Call service to complete the task
      await maintenanceService.completeTask(
        task.id, 
        parseFloat(actualDuration),
        notes
      );
      
      toast.success("Tâche de maintenance marquée comme terminée");
      onCompleted();
    } catch (error) {
      console.error("Erreur lors de la complétion de la tâche:", error);
      toast.error("Impossible de compléter la tâche de maintenance");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Compléter la tâche de maintenance</DialogTitle>
          <DialogDescription>
            Enregistrez les détails de complétion pour "{task?.title}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="actual-duration" className="text-right">
              Durée réelle
            </Label>
            <Input
              id="actual-duration"
              type="number"
              step="0.5"
              min="0"
              className="col-span-3"
              placeholder="Heures"
              value={actualDuration}
              onChange={(e) => setActualDuration(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="completion-notes" className="text-right">
              Notes
            </Label>
            <Textarea
              id="completion-notes"
              className="col-span-3"
              placeholder="Notes sur les travaux réalisés"
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              rows={5}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleComplete}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enregistrement...' : 'Marquer comme complété'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MaintenanceCompletionDialog;
