import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, AlertTriangle, Plus, ChevronRight, Wrench } from 'lucide-react';
import { EquipmentItem } from '../hooks/useEquipmentFilters';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import AddMaintenanceDialog from '@/components/maintenance/dialogs/AddMaintenanceDialog';
import { maintenanceService } from '@/services/supabase/maintenanceService';
import { toast } from 'sonner';
import MaintenanceTaskDetailDialog from '@/components/maintenance/dialogs/MaintenanceTaskDetailDialog';
import { getComputedWearValue } from '../detail/statusHelpers';

interface EquipmentMaintenanceStatusProps {
  equipment: EquipmentItem;
}

const EquipmentMaintenanceStatus: React.FC<EquipmentMaintenanceStatusProps> = ({ equipment }) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [pendingTasks, setPendingTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const tasks = await maintenanceService.getTasksForEquipment(Number(equipment.id));
        // Keep only non-completed tasks
        const pending = tasks.filter((t: any) => 
          t.status !== 'completed' && t.status !== 'cancelled'
        ).sort((a: any, b: any) => 
          new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        );
        setPendingTasks(pending);
      } catch (err) {
        console.error('Error fetching maintenance tasks:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [equipment.id]);

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      'scheduled': { label: 'Planifiée', variant: 'secondary' },
      'in-progress': { label: 'En cours', variant: 'default' },
      'pending-parts': { label: 'En attente de pièces', variant: 'outline' },
    };
    const info = map[status] || { label: status, variant: 'secondary' as const };
    return <Badge variant={info.variant}>{info.label}</Badge>;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-600';
      default: return 'text-muted-foreground';
    }
  };

  const currentHours = getComputedWearValue(equipment) ?? 0;
  const wearUnit = equipment.unite_d_usure || 'heures';


  // Normalize trigger fields (handle both camelCase and snake_case)
  const getTaskTriggerHours = (task: any) => task.triggerHours ?? task.trigger_hours ?? null;
  const getTaskTriggerKm = (task: any) => task.triggerKilometers ?? task.trigger_kilometers ?? null;
  const hasHoursTrigger = (task: any) => task.trigger_unit === 'hours' && getTaskTriggerHours(task) != null;
  const hasKmTrigger = (task: any) => task.trigger_unit === 'kilometers' && getTaskTriggerKm(task) != null;

  const isTaskOverdue = (task: any) => {
    if (hasHoursTrigger(task)) return currentHours >= getTaskTriggerHours(task);
    if (hasKmTrigger(task)) return currentHours >= getTaskTriggerKm(task);
    return new Date(task.dueDate) < new Date();
  };

  const isTaskApproaching = (task: any) => {
    if (hasHoursTrigger(task)) {
      const th = getTaskTriggerHours(task);
      const remaining = th - currentHours;
      return remaining > 0 && remaining <= th * 0.1;
    }
    if (hasKmTrigger(task)) {
      const tk = getTaskTriggerKm(task);
      const remaining = tk - currentHours;
      return remaining > 0 && remaining <= tk * 0.1;
    }
    const diffDays = Math.ceil((new Date(task.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 7;
  };

  const formatTaskDue = (task: any) => {
    if (hasHoursTrigger(task)) {
      return `à ${getTaskTriggerHours(task)} h`;
    }
    if (hasKmTrigger(task)) {
      return `à ${getTaskTriggerKm(task)} km`;
    }
    const date = new Date(task.dueDate);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return `En retard de ${Math.abs(diffDays)} j`;
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return 'Demain';
    if (diffDays < 7) return `Dans ${diffDays} j`;
    return format(date, 'd MMM yyyy', { locale: fr });
  };

  const handleAddMaintenance = async (maintenanceData: any) => {
    try {
      await maintenanceService.addTask({ ...maintenanceData });
      toast.success('Maintenance créée avec succès');
      // Refresh list
      const tasks = await maintenanceService.getTasksForEquipment(Number(equipment.id));
      const pending = tasks.filter((t: any) => t.status !== 'completed' && t.status !== 'cancelled')
        .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      setPendingTasks(pending);
    } catch (error) {
      console.error("Erreur lors de l'ajout de la maintenance:", error);
      toast.error("Impossible d'ajouter la maintenance");
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row justify-between items-start">
        <div>
          <CardTitle className="text-base">Maintenance</CardTitle>
          <CardDescription>Tâches à compléter</CardDescription>
        </div>
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          variant="outline" 
          size="sm"
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Nouvelle
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {loading ? (
            <div className="space-y-2">
              {[1, 2].map(i => (
                <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : pendingTasks.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Wrench className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucune maintenance en attente</p>
              <p className="text-xs mt-1">Cet équipement est à jour</p>
            </div>
          ) : (
            pendingTasks.map((task: any) => {
              const overdue = isTaskOverdue(task);
              const approaching = !overdue && isTaskApproaching(task);
              return (
                <button
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className={`w-full text-left rounded-lg border p-3 transition-colors hover:bg-accent/50 ${
                    overdue ? 'border-destructive/50 bg-destructive/5' : approaching ? 'border-orange-300 bg-orange-50 dark:bg-orange-950/20' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-1 min-w-0">
                        {overdue && <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />}
                        <span className="eq-item-title">{task.title}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {getStatusBadge(task.status)}
                        <span className={`text-xs ${overdue ? 'text-destructive font-semibold' : approaching ? 'text-orange-600 font-medium' : 'text-muted-foreground'}`}>
                          {(hasHoursTrigger(task) || hasKmTrigger(task)) 
                            ? <Wrench className="h-3 w-3 inline mr-1" />
                            : <Clock className="h-3 w-3 inline mr-1" />
                          }
                          {formatTaskDue(task)}
                        </span>
                        {task.priority && task.priority !== 'medium' && (
                          <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority === 'urgent' ? '🔴 Urgent' : task.priority === 'high' ? '🟠 Haute' : ''}
                          </span>
                        )}
                      </div>
                      {/* Show current counter vs trigger for hour/km tasks */}
                      {hasHoursTrigger(task) && (
                        <div className="mt-1.5">
                          <div className="flex justify-between text-xs text-muted-foreground mb-0.5">
                            <span>Compteur: {Math.round(currentHours)} h</span>
                            <span>Seuil: {getTaskTriggerHours(task)} h</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${overdue ? 'bg-destructive' : approaching ? 'bg-orange-500' : 'bg-primary'}`}
                              style={{ width: `${Math.min((currentHours / getTaskTriggerHours(task)) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                      {hasKmTrigger(task) && (
                        <div className="mt-1.5">
                          <div className="flex justify-between text-xs text-muted-foreground mb-0.5">
                            <span>Compteur: {Math.round(currentHours)} km</span>
                            <span>Seuil: {getTaskTriggerKm(task)} km</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${overdue ? 'bg-destructive' : approaching ? 'bg-orange-500' : 'bg-primary'}`}
                              style={{ width: `${Math.min((currentHours / getTaskTriggerKm(task)) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                  </div>
                </button>
              );
            })
          )}
        </div>
      </CardContent>

      <AddMaintenanceDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddMaintenance}
        equipment={equipment}
      />

      <MaintenanceTaskDetailDialog
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
        onCompleted={async () => {
          const tasks = await maintenanceService.getTasksForEquipment(Number(equipment.id));
          const pending = tasks.filter((t: any) => t.status !== 'completed' && t.status !== 'cancelled')
            .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
          setPendingTasks(pending);
        }}
      />
    </Card>
  );
};

export default EquipmentMaintenanceStatus;
