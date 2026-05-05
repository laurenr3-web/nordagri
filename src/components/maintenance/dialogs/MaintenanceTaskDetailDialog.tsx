
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, User, Wrench, AlertTriangle, Gauge, CheckCircle, Save } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { maintenanceService } from '@/services/supabase/maintenanceService';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import MaintenanceCompletionForm from '@/components/maintenance/forms/MaintenanceCompletionForm';

interface MaintenanceTaskDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  task: any;
  onCompleted?: () => void;
  headerBadge?: React.ReactNode;
}

const MaintenanceTaskDetailDialog: React.FC<MaintenanceTaskDetailDialogProps> = ({ isOpen, onClose, task, onCompleted, headerBadge }) => {
  const [showCompletionForm, setShowCompletionForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [localTitle, setLocalTitle] = useState('');
  const [localNotes, setLocalNotes] = useState('');
  const [localPriority, setLocalPriority] = useState('medium');
  const [localAssignedTo, setLocalAssignedTo] = useState('');
  const [localDueDate, setLocalDueDate] = useState<Date | null>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();

  useEffect(() => {
    if (task && isOpen) {
      setLocalTitle(task.title ?? '');
      setLocalNotes(task.notes ?? '');
      setLocalPriority(task.priority ?? 'medium');
      setLocalAssignedTo(task.assignedTo ?? '');
      setLocalDueDate(task.dueDate ? new Date(task.dueDate) : null);
    }
  }, [task, isOpen]);

  if (!task) return null;

  const dueDate = localDueDate ?? new Date(task.dueDate);
  const hasChanges =
    localTitle.trim() !== (task.title ?? '') ||
    localNotes !== (task.notes ?? '') ||
    localPriority !== (task.priority ?? 'medium') ||
    localAssignedTo !== (task.assignedTo ?? '') ||
    (localDueDate && new Date(task.dueDate).getTime() !== localDueDate.getTime());
  const triggerUnit = task.trigger_unit || 'none';
  const rawTriggerHours = task.triggerHours ?? task.trigger_hours;
  const rawTriggerKilometers = task.triggerKilometers ?? task.trigger_kilometers;
  const triggerHours = rawTriggerHours != null ? Number(rawTriggerHours) : null;
  const triggerKilometers = rawTriggerKilometers != null ? Number(rawTriggerKilometers) : null;
  const hasHoursTrigger = triggerUnit === 'hours' && triggerHours !== null && Number.isFinite(triggerHours);
  const hasKilometersTrigger = triggerUnit === 'kilometers' && triggerKilometers !== null && Number.isFinite(triggerKilometers);
  const formatCounterTarget = (value: number) => Number.isInteger(value)
    ? value.toString()
    : value.toLocaleString('fr-CA', { maximumFractionDigits: 1 });

  let isOverdue = false;
  if (!hasHoursTrigger && !hasKilometersTrigger) {
    isOverdue = dueDate < new Date();
  }

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

  const handleSave = async () => {
    if (!localTitle.trim()) {
      toast({ title: 'Titre requis', variant: 'destructive' });
      return;
    }
    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('maintenance_tasks')
        .update({
          title: localTitle.trim(),
          notes: localNotes,
          priority: localPriority,
          assigned_to: localAssignedTo || null,
          due_date: (localDueDate ?? new Date(task.dueDate)).toISOString(),
        })
        .eq('id', task.id);
      if (error) throw error;
      toast({ title: 'Modifications enregistrées' });
      qc.invalidateQueries({ queryKey: ['maintenanceTasks'] });
      qc.invalidateQueries({ queryKey: ['firstAction'] });
      qc.invalidateQueries({ queryKey: ['firstAction', 'maintenance'] });
    } catch (e: any) {
      toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
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
      <DialogContent
        className={
          (showCompletionForm ? "sm:max-w-[600px] " : "sm:max-w-md ") +
          "w-[calc(100vw-24px)] max-h-[calc(100dvh-32px)] p-0 gap-0 rounded-2xl overflow-hidden flex flex-col"
        }
      >
        <DialogHeader className="shrink-0 px-5 pt-5 pb-4 border-b border-border/50 text-left space-y-1.5">
          {headerBadge && <div className="mb-1">{headerBadge}</div>}
          <DialogTitle className="flex items-start gap-2 text-base sm:text-lg leading-tight pr-10">
            <Wrench className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />
            <span className="line-clamp-2 safe-text">{task.title}</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {showCompletionForm ? 'Compléter la maintenance' : 'Détails de la tâche de maintenance'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
        {showCompletionForm ? (
          <MaintenanceCompletionForm
            task={task}
            onSubmit={handleComplete}
            isSubmitting={isSubmitting}
          />
        ) : (
          <div className="space-y-4">
            {/* Editable title */}
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Titre</label>
              <Input value={localTitle} onChange={(e) => setLocalTitle(e.target.value)} />
            </div>

            {/* Status & Priority */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={status.variant}>{status.label}</Badge>
              {isOverdue && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  En retard
                </Badge>
              )}
              <Select value={localPriority} onValueChange={setLocalPriority}>
                <SelectTrigger className="h-8 w-auto gap-1 text-xs px-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Basse</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="high">Haute</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                  <SelectItem value="critical">Critique</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Info rows */}
            <div className="space-y-3 rounded-lg border p-3">
              {/* Show counter for hour/km tasks, date for date-based */}
              {hasHoursTrigger ? (
                <div className="flex items-center gap-3">
                  <Gauge className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Échéance</p>
                    <p className={`text-sm font-medium ${isOverdue ? 'text-destructive' : ''}`}>
                      {formatCounterTarget(triggerHours as number)} h moteur
                    </p>
                  </div>
                </div>
              ) : hasKilometersTrigger ? (
                <div className="flex items-center gap-3">
                  <Gauge className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Échéance</p>
                    <p className={`text-sm font-medium ${isOverdue ? 'text-destructive' : ''}`}>
                      {formatCounterTarget(triggerKilometers as number)} km
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Échéance</p>
                    <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-auto p-0 text-sm font-medium ${isOverdue ? 'text-destructive' : ''}`}
                        >
                          {format(dueDate, 'd MMMM yyyy', { locale: fr })}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarPicker
                          mode="single"
                          selected={dueDate}
                          onSelect={(d) => {
                            if (d) {
                              setLocalDueDate(d);
                              setDatePickerOpen(false);
                            }
                          }}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
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


              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Assignée à</p>
                  <Input
                    value={localAssignedTo}
                    onChange={(e) => setLocalAssignedTo(e.target.value)}
                    placeholder="Nom du technicien"
                    className="h-8 text-sm"
                  />
                </div>
              </div>

            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Notes</label>
              <Textarea
                value={localNotes}
                onChange={(e) => setLocalNotes(e.target.value)}
                rows={3}
                placeholder="Aucune note"
                className="text-sm resize-none min-h-[100px] max-h-[200px]"
              />
            </div>
          </div>
        )}
        </div>

        {!showCompletionForm && (hasChanges || task.status !== 'completed') && (
          <div
            className="shrink-0 border-t border-border/50 bg-background px-5 pt-3 flex flex-col gap-2"
            style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
          >
            {hasChanges && (
              <Button onClick={handleSave} disabled={isSaving} className="w-full gap-2 h-11" variant="default">
                <Save className="h-4 w-4" /> {isSaving ? 'Enregistrement…' : 'Enregistrer'}
              </Button>
            )}
            {task.status !== 'completed' && (
              <Button
                onClick={() => setShowCompletionForm(true)}
                variant="outline"
                className="w-full flex items-center gap-2 h-11"
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
