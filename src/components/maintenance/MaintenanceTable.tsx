
import React, { useState, useEffect, useRef } from 'react';
import { format, isPast, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Clock, CheckCircle, AlertTriangle, Trash2, X } from 'lucide-react';
import TaskDetailsDialog from '@/components/maintenance/dialogs/TaskDetailsDialog';
import { MaintenanceTask } from '@/hooks/maintenance/maintenanceSlice';
import { getPriorityBadge } from '@/components/maintenance/MaintenanceUtils';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface MaintenanceTableProps {
  tasks: MaintenanceTask[];
  updateTaskStatus: (taskId: number, status: string) => void;
  updateTaskPriority: (taskId: number, priority: string) => void;
  deleteTask: (taskId: number) => void;
  userName?: string;
  highlightedTaskId?: number;
}

export const MaintenanceTable: React.FC<MaintenanceTableProps> = ({
  tasks,
  updateTaskStatus,
  updateTaskPriority,
  deleteTask,
  userName = 'Utilisateur',
  highlightedTaskId
}) => {
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkAction, setBulkAction] = useState<'complete' | 'delete' | null>(null);
  const highlightedRowRef = useRef<HTMLTableRowElement>(null);
  
  // Clear selection when tasks change
  useEffect(() => {
    setSelectedIds(new Set());
  }, [tasks.length]);

  // Scroll to and open details for highlighted task
  useEffect(() => {
    if (highlightedTaskId) {
      const task = tasks.find(t => t.id === highlightedTaskId);
      if (task) {
        setSelectedTask(task);
        setIsTaskDetailsOpen(true);
        setTimeout(() => {
          if (highlightedRowRef.current) {
            highlightedRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    }
  }, [highlightedTaskId, tasks]);

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === tasks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(tasks.map(t => t.id)));
    }
  };

  const handleBulkComplete = () => {
    selectedIds.forEach(id => updateTaskStatus(id, 'completed'));
    setSelectedIds(new Set());
    setBulkAction(null);
  };

  const handleBulkDelete = () => {
    selectedIds.forEach(id => deleteTask(id));
    setSelectedIds(new Set());
    setBulkAction(null);
  };
  
  const isCounterOverdue = (task: MaintenanceTask): boolean => {
    const cv = task.equipment_current_value;
    if (cv == null) return false;
    if (task.trigger_unit === 'hours' && task.trigger_hours != null) return cv >= task.trigger_hours;
    if (task.trigger_unit === 'kilometers' && task.trigger_kilometers != null) return cv >= task.trigger_kilometers;
    return false;
  };

  const isCounterBased = (task: MaintenanceTask): boolean => {
    return (task.trigger_unit === 'hours' && task.trigger_hours != null) ||
           (task.trigger_unit === 'kilometers' && task.trigger_kilometers != null);
  };

  const getStatusBadge = (task: MaintenanceTask) => {
    const { dueDate, status } = task;
    if (status === 'completed') {
      return (
        <Badge className="bg-green-500 hover:bg-green-600 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          <span>Terminée</span>
        </Badge>
      );
    }
    if (status === 'in-progress') {
      return (
        <Badge className="bg-blue-500 hover:bg-blue-600 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>En cours</span>
        </Badge>
      );
    }
    // Counter-based overdue
    if (isCounterBased(task) && isCounterOverdue(task)) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          <span>En retard</span>
        </Badge>
      );
    }
    // Date-based overdue
    if (!isCounterBased(task) && isPast(dueDate) && !isToday(dueDate)) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          <span>En retard</span>
        </Badge>
      );
    }
    if (!isCounterBased(task) && isToday(dueDate)) {
      return (
        <Badge variant="outline" className="bg-orange-100 text-orange-800 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>Aujourd'hui</span>
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <Clock className="w-3 h-3" />
        <span>Planifiée</span>
      </Badge>
    );
  };

  const isAllSelected = tasks.length > 0 && selectedIds.size === tasks.length;
  const hasSelection = selectedIds.size > 0;
  
  return (
    <>
      {tasks.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-2">Aucune tâche trouvée</p>
          <p className="text-xs text-muted-foreground">
            {userName}, vous n'avez pas encore de tâches dans cette catégorie.
          </p>
        </div>
      ) : (
        <>
          {/* Bulk action bar */}
          {hasSelection && (
            <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-muted/80 border animate-in fade-in slide-in-from-top-2">
              <span className="text-sm font-medium ml-1">
                {selectedIds.size} sélectionnée{selectedIds.size > 1 ? 's' : ''}
              </span>
              <div className="flex-1" />
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => setBulkAction('complete')}
              >
                <CheckCircle className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Compléter</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-destructive hover:text-destructive"
                onClick={() => setBulkAction('delete')}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Supprimer</span>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
                onClick={() => setSelectedIds(new Set())}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}

          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={toggleAll}
                      aria-label="Tout sélectionner"
                    />
                  </TableHead>
                  <TableHead>Équipement</TableHead>
                  <TableHead>Tâche</TableHead>
                  <TableHead className="hidden md:table-cell">Type</TableHead>
                  <TableHead>Échéance</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead className="hidden md:table-cell">Statut</TableHead>
                  <TableHead className="hidden lg:table-cell">Assigné à</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => {
                  const isSelected = selectedIds.has(task.id);
                  return (
                    <TableRow 
                      key={task.id} 
                      className={`cursor-pointer hover:bg-muted/50 ${
                        isSelected ? 'bg-primary/5' : ''
                      } ${task.id === highlightedTaskId ? 'bg-primary/10 border-l-4 border-primary' : ''}`}
                      ref={task.id === highlightedTaskId ? highlightedRowRef : null}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelect(task.id)}
                          aria-label={`Sélectionner ${task.title}`}
                        />
                      </TableCell>
                      <TableCell 
                        onClick={() => { setSelectedTask(task); setIsTaskDetailsOpen(true); }}
                        className="font-medium"
                      >
                        {task.equipment}
                      </TableCell>
                      <TableCell onClick={() => { setSelectedTask(task); setIsTaskDetailsOpen(true); }}>
                        {task.title}
                      </TableCell>
                      <TableCell 
                        className="hidden md:table-cell"
                        onClick={() => { setSelectedTask(task); setIsTaskDetailsOpen(true); }}
                      >
                        {task.type === 'preventive' ? 'Préventive' : 
                         task.type === 'corrective' ? 'Corrective' : 
                         task.type === 'condition-based' ? 'Conditionnelle' : task.type}
                      </TableCell>
                      <TableCell onClick={() => { setSelectedTask(task); setIsTaskDetailsOpen(true); }}>
                        {task.trigger_unit === 'hours' && task.trigger_hours
                          ? `${task.trigger_hours} h`
                          : task.trigger_unit === 'kilometers' && task.trigger_kilometers
                          ? `${task.trigger_kilometers} km`
                          : format(task.dueDate, 'dd MMM yyyy', { locale: fr })}
                      </TableCell>
                      <TableCell onClick={() => { setSelectedTask(task); setIsTaskDetailsOpen(true); }}>
                        {getPriorityBadge(task.priority)}
                      </TableCell>
                      <TableCell 
                        className="hidden md:table-cell"
                        onClick={() => { setSelectedTask(task); setIsTaskDetailsOpen(true); }}
                      >
                        {getStatusBadge(task.dueDate, task.status)}
                      </TableCell>
                      <TableCell 
                        className="hidden lg:table-cell"
                        onClick={() => { setSelectedTask(task); setIsTaskDetailsOpen(true); }}
                      >
                        {task.assignedTo || 'Non assigné'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 focus-visible:ring-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setSelectedTask(task); setIsTaskDetailsOpen(true); }}>
                              Voir les détails
                            </DropdownMenuItem>
                            {task.status !== 'completed' && (
                              <DropdownMenuItem onClick={() => updateTaskStatus(task.id, 'completed')}>
                                Marquer comme terminée
                              </DropdownMenuItem>
                            )}
                            {task.status === 'scheduled' && (
                              <DropdownMenuItem onClick={() => updateTaskStatus(task.id, 'in-progress')}>
                                Démarrer la tâche
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => deleteTask(task.id)} className="text-red-600">
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}
      
      <TaskDetailsDialog
        task={selectedTask}
        open={isTaskDetailsOpen}
        onOpenChange={setIsTaskDetailsOpen}
        onStatusChange={updateTaskStatus}
        onPriorityChange={updateTaskPriority}
        onDeleteTask={deleteTask}
      />

      {/* Bulk complete confirmation */}
      <AlertDialog open={bulkAction === 'complete'} onOpenChange={() => setBulkAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Compléter {selectedIds.size} tâche{selectedIds.size > 1 ? 's' : ''} ?</AlertDialogTitle>
            <AlertDialogDescription>
              Les tâches sélectionnées seront marquées comme terminées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkComplete}>Confirmer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk delete confirmation */}
      <AlertDialog open={bulkAction === 'delete'} onOpenChange={() => setBulkAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer {selectedIds.size} tâche{selectedIds.size > 1 ? 's' : ''} ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Les tâches sélectionnées seront définitivement supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
