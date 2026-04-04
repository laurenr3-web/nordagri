
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, User, Wrench, AlertTriangle, Gauge } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MaintenanceTaskDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  task: any;
}

const MaintenanceTaskDetailDialog: React.FC<MaintenanceTaskDetailDialogProps> = ({ isOpen, onClose, task }) => {
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
    'oil_change': 'Changement d\'huile',
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            {task.title}
          </DialogTitle>
          <DialogDescription>Détails de la tâche de maintenance</DialogDescription>
        </DialogHeader>

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
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Échéance</p>
                <p className={`text-sm font-medium ${isOverdue ? 'text-destructive' : ''}`}>
                  {format(dueDate, 'd MMMM yyyy', { locale: fr })}
                </p>
              </div>
            </div>

            {task.equipment && (
              <div className="flex items-center gap-3">
                <Wrench className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Équipement</p>
                  <p className="text-sm font-medium">{task.equipment}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Type</p>
                <p className="text-sm font-medium">{typeMap[task.type] || task.type}</p>
              </div>
            </div>

            {task.assignedTo && (
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Assignée à</p>
                  <p className="text-sm font-medium">{task.assignedTo}</p>
                </div>
              </div>
            )}

            {(task.triggerHours || task.triggerKilometers) && (
              <div className="flex items-center gap-3">
                <Gauge className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Seuil de déclenchement</p>
                  <p className="text-sm font-medium">
                    {task.triggerHours ? `${task.triggerHours} heures` : ''}
                    {task.triggerHours && task.triggerKilometers ? ' / ' : ''}
                    {task.triggerKilometers ? `${task.triggerKilometers} km` : ''}
                  </p>
                </div>
              </div>
            )}

            {task.engineHours != null && task.engineHours > 0 && (
              <div className="flex items-center gap-3">
                <Gauge className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Durée estimée</p>
                  <p className="text-sm font-medium">{task.engineHours} h</p>
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MaintenanceTaskDetailDialog;
