
import React, { useState, useEffect } from 'react';
import { PlanningTask, PlanningStatus } from '@/services/planning/planningService';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Unlock, CalendarIcon, Trash2, Save, Clock, Wrench, ExternalLink, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { HelpTooltip } from '@/components/help/HelpTooltip';
import { TaskTimeBadge } from './TaskTimeBadge';
import { TaskTimeControls } from './TaskTimeControls';
import { TaskSessionsList } from './TaskSessionsList';
import { useTaskTimeStats } from '@/hooks/planning/usePlanningTaskTime';
import { useAuthContext } from '@/providers/AuthProvider';
import { todayLocal, localDateStr } from '@/lib/dateLocal';


const categoryLabels: Record<string, string> = {
  animaux: '🐄 Animaux',
  champs: '🌾 Champs',
  alimentation: '🥩 Alimentation',
  equipement: '🚜 Équipement',
  batiment: '🏠 Bâtiment',
  administration: '📋 Administration',
  autre: '📌 Autre',
};

const statusLabels: Record<string, string> = {
  todo: 'À faire',
  in_progress: 'En cours',
  paused: 'En pause',
  done: 'Terminé',
  blocked: 'Bloqué',
};

const statusColors: Record<string, string> = {
  todo: 'bg-muted text-muted-foreground',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  paused: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  done: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  blocked: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

const priorityConfig: Record<string, { label: string; className: string }> = {
  critical: { label: 'Critique', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
  important: { label: 'Important', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' },
  todo: { label: 'À faire', className: 'bg-muted text-muted-foreground' },
};

interface TaskDetailDialogProps {
  task: PlanningTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamMembers: { id: string; name: string }[];
  onStatusChange: (id: string, status: PlanningStatus) => void;
  onPostpone: (id: string, newDate: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<PlanningTask>) => void;
  onEdit?: (task: PlanningTask) => void;
  headerBadge?: React.ReactNode;
}

export function TaskDetailDialog({
  task,
  open,
  onOpenChange,
  teamMembers,
  onStatusChange,
  onPostpone,
  onDelete,
  onUpdate,
  onEdit,
  headerBadge,
}: TaskDetailDialogProps) {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [localAssignedTo, setLocalAssignedTo] = useState<string | null>(null);
  const [localTitle, setLocalTitle] = useState<string>('');
  const [localNotes, setLocalNotes] = useState<string>('');
  const [localPriority, setLocalPriority] = useState<string>('todo');
  const [localDueDate, setLocalDueDate] = useState<string>('');
  const [hasChanges, setHasChanges] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const enableTimeTracking = !!task && !task.is_recurring;
  const { data: timeStats } = useTaskTimeStats(enableTimeTracking ? task.id : null);

  // Reset local state on open/task change
  useEffect(() => {
    if (task && open) {
      setLocalAssignedTo(task.assigned_to);
      setLocalTitle(task.title ?? '');
      setLocalNotes(task.notes ?? '');
      setLocalPriority((task.manual_priority || task.computed_priority) ?? 'todo');
      setLocalDueDate(task.due_date);
      setHasChanges(false);
      setShowDeleteConfirm(false);
      setShowDatePicker(false);
    }
  }, [task, open]);

  if (!task) return null;

  const effectivePriority = task.manual_priority || task.computed_priority;
  const priority = priorityConfig[effectivePriority] || priorityConfig.todo;

  const todayStr = todayLocal();
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = localDateStr(tomorrowDate);

  const isOverdue = task.due_date < todayStr && task.status !== 'done';
  const overdueDays = isOverdue
    ? Math.floor((new Date(todayStr).getTime() - new Date(task.due_date).getTime()) / 86400000)
    : 0;

  const recomputeChanges = (next: {
    title?: string;
    notes?: string;
    priority?: string;
    dueDate?: string;
    assignedTo?: string | null;
  }) => {
    const t = next.title ?? localTitle;
    const n = next.notes ?? localNotes;
    const p = next.priority ?? localPriority;
    const d = next.dueDate ?? localDueDate;
    const a = next.assignedTo !== undefined ? next.assignedTo : localAssignedTo;
    const currentPriority = (task.manual_priority || task.computed_priority) ?? 'todo';
    const changed =
      t !== (task.title ?? '') ||
      n !== (task.notes ?? '') ||
      p !== currentPriority ||
      d !== task.due_date ||
      a !== task.assigned_to;
    setHasChanges(changed);
  };

  const handleAssignChange = (value: string) => {
    const newVal = value === 'none' ? null : value;
    setLocalAssignedTo(newVal);
    recomputeChanges({ assignedTo: newVal });
  };

  const handleSave = () => {
    const updates: Partial<PlanningTask> = {
      title: localTitle.trim() || task.title,
      notes: localNotes,
      assigned_to: localAssignedTo,
      due_date: localDueDate,
      manual_priority: localPriority as any,
    };
    onUpdate(task.id, updates);
    setHasChanges(false);
  };

  const handleStatusAction = (status: PlanningStatus) => {
    onStatusChange(task.id, status);
    onOpenChange(false);
  };

  const handlePostpone = (dateStr: string) => {
    setLocalDueDate(dateStr);
    recomputeChanges({ dueDate: dateStr });
  };

  const handleDeleteConfirm = () => {
    onDelete(task.id);
    setShowDeleteConfirm(false);
    onOpenChange(false);
  };

  const dueDateRaw = localDueDate || task.due_date;
  const dueDateObj = dueDateRaw ? new Date(dueDateRaw + 'T12:00:00') : null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            {headerBadge && <div className="mb-1">{headerBadge}</div>}
            <DialogTitle className="text-lg leading-tight pr-6">
              <Input
                value={localTitle}
                onChange={(e) => {
                  setLocalTitle(e.target.value);
                  recomputeChanges({ title: e.target.value });
                }}
                className="text-lg font-semibold border-0 shadow-none px-0 focus-visible:ring-0 h-auto py-1"
              />
            </DialogTitle>
          </DialogHeader>

          {/* Section: Informations */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">{categoryLabels[task.category] || task.category}</span>
              <Badge variant="outline" className={cn("text-xs", statusColors[task.status])}>
                {statusLabels[task.status]}
              </Badge>
              <Select
                value={localPriority}
                onValueChange={(v) => {
                  setLocalPriority(v);
                  recomputeChanges({ priority: v });
                }}
              >
                <SelectTrigger className="h-7 w-auto gap-1 text-xs px-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critique</SelectItem>
                  <SelectItem value="important">Important</SelectItem>
                  <SelectItem value="todo">À faire</SelectItem>
                </SelectContent>
              </Select>
              {isOverdue && (
                <Badge className="text-xs bg-orange-500 text-white border-0 gap-1">
                  <Clock className="h-3 w-3" />
                  {overdueDays}j en retard
                </Badge>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Notes</label>
              <Textarea
                value={localNotes}
                onChange={(e) => {
                  setLocalNotes(e.target.value);
                  recomputeChanges({ notes: e.target.value });
                }}
                rows={3}
                placeholder="Aucune note"
                className="text-sm resize-none"
              />
            </div>

            {/* Source maintenance indicator */}
            {task.source_module === 'maintenance' && task.equipment_id && (
              <button
                onClick={() => {
                  onOpenChange(false);
                  navigate(`/equipment/${task.equipment_id}`);
                }}
                className="flex items-center gap-2 w-full p-2 rounded-md border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 text-sm text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors"
              >
                <Wrench className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">Créée depuis une maintenance</span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              </button>
            )}

            {(task.field_name || task.building_name || task.animal_group) && (
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {task.field_name && <span>🌾 {task.field_name}</span>}
                {task.building_name && <span>🏠 {task.building_name}</span>}
                {task.animal_group && <span>🐄 {task.animal_group}</span>}
              </div>
            )}
          </div>

          <Separator />

          {/* Section: Assignation et date */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Assignation et date</h4>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Assignée à</label>
              <Select value={localAssignedTo || 'none'} onValueChange={handleAssignChange}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Non assignée" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Non assignée</SelectItem>
                  {teamMembers.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span>{dueDateObj && !isNaN(dueDateObj.getTime()) ? format(dueDateObj, 'd MMMM yyyy', { locale: fr }) : '—'}</span>
            </div>

            {hasChanges && (
              <Button onClick={handleSave} size="sm" className="w-full gap-2">
                <Save className="h-4 w-4" /> Enregistrer
              </Button>
            )}
          </div>

          {task.status !== 'done' && (
            <>
              <Separator />

              {/* Section: Suivi de temps */}
              {enableTimeTracking && (
                <>
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold inline-flex items-center gap-1">
                      Temps
                    </h4>
                    {timeStats && <TaskTimeBadge stats={timeStats} size="md" />}
                    <TaskTimeControls task={task} userId={user?.id ?? null} variant="dialog" />
                    <TaskSessionsList taskId={task.id} />
                  </div>
                  <Separator />
                </>
              )}

              {/* Section: Actions */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold inline-flex items-center gap-1">
                  Actions
                  <HelpTooltip contentKey="planning.field.statusActions" />
                </h4>

                <div className="flex flex-wrap gap-2">
                  {task.status === 'blocked' ? (
                    <Button size="sm" variant="outline" className="gap-1.5 flex-1" onClick={() => handleStatusAction('todo')}>
                      <Unlock className="h-3.5 w-3.5" /> Débloquer
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => handleStatusAction('blocked')}>
                      <AlertTriangle className="h-3.5 w-3.5" /> Bloqué
                    </Button>
                  )}
                </div>

                {/* Reporter */}
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground inline-flex items-center gap-1">
                    Reporter à
                    <HelpTooltip contentKey="planning.field.postpone" />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => handlePostpone(todayStr)}>
                      Aujourd'hui
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => handlePostpone(tomorrowStr)}>
                      Demain
                    </Button>
                    <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                      <PopoverTrigger asChild>
                        <Button size="sm" variant="outline" className="text-xs gap-1.5">
                          <CalendarIcon className="h-3.5 w-3.5" /> Choisir
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dueDateObj ?? undefined}
                          onSelect={(date) => {
                            if (date) {
                              handlePostpone(localDateStr(date));
                              setShowDatePicker(false);
                            }
                          }}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-2">
                  {onEdit && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1.5"
                      onClick={() => {
                        onEdit(task);
                        onOpenChange(false);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" /> Modifier
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex-1 text-destructive hover:text-destructive gap-1.5"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Supprimer
                  </Button>
                </div>
              </div>
            </>
          )}

          {task.status === 'done' && (
            <>
              <Separator />
              <div className="flex gap-2">
                {onEdit && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-1.5"
                    onClick={() => {
                      onEdit(task);
                      onOpenChange(false);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" /> Modifier
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-1 text-destructive hover:text-destructive gap-1.5"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Supprimer
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette tâche ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La tâche sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
