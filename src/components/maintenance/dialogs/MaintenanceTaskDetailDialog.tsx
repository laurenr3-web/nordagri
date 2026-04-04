
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, User, Wrench, AlertTriangle, Gauge, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { maintenanceService } from '@/services/supabase/maintenanceService';
import { useToast } from '@/hooks/use-toast';
import MaintenanceCompletionForm from '@/components/maintenance/forms/MaintenanceCompletionForm';

interface MaintenanceTaskDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  task: any;
  onCompleted?: () => void;
}

const MaintenanceTaskDetailDialog: React.FC<MaintenanceTaskDetailDialogProps> = ({ isOpen, onClose, task, onCompleted }) => {
  const [showCompletionForm, setShowCompletionForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  if (!task) return null;

  const dueDate = new Date(task.dueDate);
  const isOverdue = dueDate < new Date();

  const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    'scheduled': { label: 'Planifiée', variant: 'secondary' },
    'in-progress': { label: 'En cours', variant: 'default' },
    'pending-parts': { label: 'En attente de pièces', variant: 'outline' },
    'completed': { label: 'Complétée', variant: 'default' },
  };

  const typeMap: Record<string, string> = {
    'preventive': 'Préventive',
    'corrective': 'Corrective',
    'repair': 'Réparation',
    'oil_change': "Changement d'huile",
    'inspection': 'Inspection',
  };

  const priorityMap: Record<string, { label: string; className: string }> = {
    'low': { label: 'Basse', className: 'text-muted-foreground' },
    'medium': { label: 'Moyenne', className: 'text-yellow-600' },
    'high': { label: 'Haute', className: 'text-orange-500' },
    'urgent': { label: 'Urgente', className: 'text-red-600' },
    'critical': { label: 'Critique', className: 'text-red-700 font-bold' },
  };

  const status = statusMap[task.status] || { label: task.status, variant: 'secondary' as const };
  const priority = priorityMap[task.priority] || { label: task.priority, className: '' };

  const handleComplete = async (data: any) => {
    try {
      setIsSubmitting(true);
      await maintenanceService.completeTask(task.id, {
        completedDate: data.completedDate,
        actualDuration: data.actualDuration,
        notes: data.notes,
        technician: data.technician,
        completedAtHours: data.completedAtHours,
        completedAtKm: data.completedAtKm,
      });
      toast({
        title: "Maintenance complétée",
        description: `"${task.title}" a été marquée comme terminée.`,
      });
      setShowCompletionForm(false);
      onClose();
      onCompleted?.();
    } catch (error: any) {
      console.error('Error completing task:', error);
      toast({
        title: "Erreur",
        description: `Impossible de compléter: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setShowCompletionForm(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className={showCompletionForm ? "sm:max-w-[600px] max-h-[90vh] overflow-y-auto" : "max-w-md"}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            {task.title}
          </DialogTitle>
          <DialogDescription>
            {showCompletionForm ? 'Compléter la maintenance' : 'Détails de la tâche de maintenance'}
          </DialogDescription>
        </DialogHeader>

        {showCompletionForm ? (
          <MaintenanceCompletionForm
            task={task}
            onSubmit={handleComplete}
            isSubmitting={isSubmitting}
          />
        ) : (
          <div className="space-y-4">
            {/* Status & Priority */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={status.variant}>{status.label}</Badge>
              {isOverdue && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  En retard
                </Badge>
              )}
              <span className={`text-sm font-medium ${priority.className}`}>
                Priorité: {priority.label}
              </span>
            </div>

            {/* Info rows */}
            <div className="space-y-3 rounded-lg border p-3">
              {/* Show counter for hour/km tasks, date for date-based */}
              {(task.trigger_unit === 'hours' && task.triggerHours) ? (
                <div className="flex items-center gap-3">
                  <Gauge className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">À effectuer au compteur</p>
                    <p className={`text-sm font-medium ${isOverdue ? 'text-destructive' : ''}`}>
                      {task.triggerHours} heures
                    </p>
                  </div>
                </div>
              ) : (task.trigger_unit === 'kilometers' && task.triggerKilometers) ? (
                <div className="flex items-center gap-3">
                  <Gauge className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">À effectuer au compteur</p>
                    <p className={`text-sm font-medium ${isOverdue ? 'text-destructive' : ''}`}>
                      {task.triggerKilometers} km
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Échéance</p>
                    <p className={`text-sm font-medium ${isOverdue ? 'text-destructive' : ''}`}>
                      {format(dueDate, 'd MMMM yyyy', { locale: fr })}
                    </p>
                  </div>
                </div>
              )}

              {task.equipment && (
                <div className="flex items-center gap-3">
                  <Wrench className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Équipement</p>
                    <p className="text-sm font-medium">{task.equipment}</p>
                  </div>
                </div>
              )}


              {task.assignedTo && (
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Assignée à</p>
                    <p className="text-sm font-medium">{task.assignedTo}</p>
                  </div>
                </div>
              )}

            </div>

            {/* Notes */}
            {task.notes && (
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground mb-1">Notes</p>
                <p className="text-sm">{task.notes}</p>
              </div>
            )}

            {/* Complete button */}
            {task.status !== 'completed' && (
              <Button
                onClick={() => setShowCompletionForm(true)}
                className="w-full flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Compléter cette maintenance
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MaintenanceTaskDetailDialog;
