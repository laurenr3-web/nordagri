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

  const currentHours = equipment.valeur_actuelle || 0;
  const wearUnit = equipment.unite_d_usure || 'heures';

  const isTaskOverdue = (task: any) => {
    const triggerUnit = task.trigger_unit || 'none';
    // Hour-based trigger
    if (triggerUnit === 'hours' && task.triggerHours) {
      return currentHours >= task.triggerHours;
    }
    // Km-based trigger
    if (triggerUnit === 'kilometers' && task.triggerKilometers) {
      return currentHours >= task.triggerKilometers; // valeur_actuelle stores current counter
    }
    // Date-based trigger
    return new Date(task.dueDate) < new Date();
  };

  const isTaskApproaching = (task: any) => {
    const triggerUnit = task.trigger_unit || 'none';
    if (triggerUnit === 'hours' && task.triggerHours) {
      const remaining = task.triggerHours - currentHours;
      return remaining > 0 && remaining <= task.triggerHours * 0.1; // within 10%
    }
    if (triggerUnit === 'kilometers' && task.triggerKilometers) {
      const remaining = task.triggerKilometers - currentHours;
      return remaining > 0 && remaining <= task.triggerKilometers * 0.1;
    }
    // Date: within 7 days
    const diffDays = Math.ceil((new Date(task.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 7;
  };

  const formatTaskDue = (task: any) => {
    const triggerUnit = task.trigger_unit || 'none';
    if (triggerUnit === 'hours' && task.triggerHours) {
      const remaining = task.triggerHours - currentHours;
      if (remaining <= 0) return `Dépassé de ${Math.abs(Math.round(remaining))} h`;
      return `Dans ${Math.round(remaining)} h (à ${task.triggerHours} h)`;
    }
    if (triggerUnit === 'kilometers' && task.triggerKilometers) {
      const remaining = task.triggerKilometers - currentHours;
      if (remaining <= 0) return `Dépassé de ${Math.abs(Math.round(remaining))} km`;
      return `Dans ${Math.round(remaining)} km (à ${task.triggerKilometers} km)`;
    }
    // Date
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
              const overdue = isOverdue(task.dueDate);
              return (
                <button
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className={`w-full text-left rounded-lg border p-3 transition-colors hover:bg-accent/50 ${
                    overdue ? 'border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-800' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {overdue && <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />}
                        <span className="font-medium text-sm truncate">{task.title}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {getStatusBadge(task.status)}
                        <span className={`text-xs ${overdue ? 'text-red-600 font-semibold' : 'text-muted-foreground'}`}>
                          <Clock className="h-3 w-3 inline mr-1" />
                          {formatDueDate(task.dueDate)}
                        </span>
                        {task.priority && task.priority !== 'medium' && (
                          <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority === 'urgent' ? '🔴 Urgent' : task.priority === 'high' ? '🟠 Haute' : ''}
                          </span>
                        )}
                      </div>
                      {(task.triggerHours || task.triggerKilometers) && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {task.triggerHours ? `À ${task.triggerHours} h` : ''}
                          {task.triggerKilometers ? `À ${task.triggerKilometers} km` : ''}
                        </p>
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
