
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { maintenanceService } from '@/services/supabase/maintenanceService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, Clock } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';

interface MaintenanceCompletionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  task: any;
  onCompleted?: () => void;
  userName?: string;
}

export default function MaintenanceCompletionDialog({
  isOpen,
  onClose,
  task,
  onCompleted,
  userName = 'Utilisateur'
}: MaintenanceCompletionDialogProps) {
  const [loading, setLoading] = useState(false);
  const [completedDate, setCompletedDate] = useState<Date>(new Date());
  const [actualDuration, setActualDuration] = useState<string>(task?.engineHours?.toString() || "1");
  const [notes, setNotes] = useState<string>('');
  const [technician, setTechnician] = useState<string>(userName);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!task) {
      toast.error("Aucune tâche sélectionnée");
      return;
    }

    try {
      setLoading(true);
      
      // Préparer les données de complétion
      const completionData = {
        completedDate,
        actualDuration: parseFloat(actualDuration),
        notes,
        technician
      };

      // Appeler le service pour compléter la tâche
      await maintenanceService.completeTask(task.id, completionData);
      
      toast.success("Tâche marquée comme complétée avec succès!");
      
      // Fermer le dialogue et rafraîchir
      onClose();
      onCompleted && onCompleted();
      
    } catch (error) {
      console.error("Erreur lors de la complétion de la tâche:", error);
      toast.error("Impossible de compléter la tâche");
    } finally {
      setLoading(false);
    }
  };
  
  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Marquer la tâche comme terminée</DialogTitle>
          <DialogDescription>
            Enregistrez les informations d'achèvement pour la tâche {task.title}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 py-2">
            <div className="bg-secondary/30 p-3 rounded-md text-sm">
              <p className="font-medium mb-1">{task.title}</p>
              <p className="text-xs text-muted-foreground">
                Équipement: {task.equipment || "Non spécifié"} | 
                Durée estimée: {task.engineHours || "N/A"} heures
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="completedDate">Date d'achèvement</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-full justify-start text-left font-normal"
                    id="completedDate"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {completedDate ? (
                      format(completedDate, "d MMMM yyyy", { locale: fr })
                    ) : (
                      <span>Sélectionner une date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={completedDate}
                    onSelect={(date) => date && setCompletedDate(date)}
                    initialFocus
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="actualDuration">Durée réelle (heures)</Label>
              <div className="flex items-center">
                <Input
                  id="actualDuration"
                  value={actualDuration}
                  onChange={(e) => setActualDuration(e.target.value)}
                  type="number"
                  min="0"
                  step="0.5"
                  className="w-full"
                  required
                />
                <Clock className="ml-2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="technician">Technicien</Label>
              <Input
                id="technician"
                value={technician}
                onChange={(e) => setTechnician(e.target.value)}
                placeholder="Nom du technicien"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes sur la complétion des travaux..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Enregistrement..." : "Marquer comme terminée"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
