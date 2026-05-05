import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wrench, Plus, ChevronRight, AlertTriangle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { EquipmentItem } from '../hooks/useEquipmentFilters';
import { maintenanceService } from '@/services/supabase/maintenanceService';
import MaintenanceTaskDetailDialog from '@/components/maintenance/dialogs/MaintenanceTaskDetailDialog';
import AddMaintenanceDialog from '@/components/maintenance/dialogs/AddMaintenanceDialog';
import { toast } from 'sonner';

interface Props { equipment: EquipmentItem; canEdit?: boolean; }

const MaintenancePriorityCard: React.FC<Props> = ({ equipment, canEdit = true }) => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [addOpen, setAddOpen] = useState(false);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      const t = await maintenanceService.getTasksForEquipment(Number(equipment.id));
      setTasks(Array.isArray(t) ? t : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [equipment.id]);

  useEffect(() => { reload(); }, [reload]);

  const currentValue = equipment.valeur_actuelle ?? 0;
  const isOverdue = (t: any) => {
    const th = t.triggerHours ?? t.trigger_hours;
    const tk = t.triggerKilometers ?? t.trigger_kilometers;
    if (t.trigger_unit === 'hours' && th != null) return currentValue >= th;
    if (t.trigger_unit === 'kilometers' && tk != null) return currentValue >= tk;
    return t.dueDate ? new Date(t.dueDate) < new Date() : false;
  };

  const pending = tasks.filter((t) => t.status !== 'completed' && t.status !== 'cancelled');
  const overdue = pending.filter(isOverdue);
  const upcoming = pending.filter((t) => !isOverdue(t)).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  const completed = tasks
    .filter((t) => t.status === 'completed')
    .sort((a, b) => new Date(b.completedDate || b.dueDate).getTime() - new Date(a.completedDate || a.dueDate).getTime())
    .slice(0, 1);

  const display = [...overdue, ...upcoming, ...completed].slice(0, 5);

  const formatDue = (t: any) => {
    const th = t.triggerHours ?? t.trigger_hours;
    const tk = t.triggerKilometers ?? t.trigger_kilometers;
    if (t.trigger_unit === 'hours' && th != null) return `${th} h`;
    if (t.trigger_unit === 'kilometers' && tk != null) return `${tk} km`;
    if (!t.dueDate) return '';
    const d = new Date(t.dueDate);
    const diff = Math.ceil((d.getTime() - Date.now()) / 86400000);
    if (diff < 0) return `+${Math.abs(diff)} j`;
    if (diff === 0) return "Aujourd'hui";
    if (diff === 1) return 'Demain';
    if (diff < 7) return `Dans ${diff} j`;
    return format(d, 'd MMM', { locale: fr });
  };

  return (
    <Card className="rounded-2xl border bg-card shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Wrench className="h-4 w-4 text-amber-600" /> Maintenances
        </CardTitle>
        {canEdit && (
          <Button size="sm" variant="outline" onClick={() => setAddOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Nouvelle
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">{[1,2].map(i => <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />)}</div>
        ) : display.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Wrench className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Aucune maintenance planifiée</p>
            {canEdit && (
              <Button size="sm" variant="link" onClick={() => setAddOpen(true)}>Ajouter une maintenance</Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {display.map((t) => {
              const od = isOverdue(t) && t.status !== 'completed';
              const done = t.status === 'completed';
              return (
                <button key={t.id} onClick={() => setSelected(t)}
                  className={`w-full text-left rounded-xl border p-3 transition-colors hover:bg-accent/50 ${
                    od ? 'border-destructive/40 bg-destructive/5' : done ? 'opacity-70' : ''
                  }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-2 mb-0.5 min-w-0">
                        {od && <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />}
                        <span className="font-medium text-sm leading-snug line-clamp-2 break-words safe-text min-w-0">{t.title}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {done ? (
                          <Badge variant="secondary" className="text-[10px]">Terminée</Badge>
                        ) : od ? (
                          <Badge variant="destructive" className="text-[10px]">En retard</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px]">Planifiée</Badge>
                        )}
                        <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {formatDue(t)}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </CardContent>

      <MaintenanceTaskDetailDialog
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        task={selected}
        onCompleted={reload}
      />
      <AddMaintenanceDialog
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        equipment={equipment}
        onSubmit={async (data: any) => {
          try {
            await maintenanceService.addTask({ ...data });
            toast.success('Maintenance créée');
            reload();
          } catch { toast.error('Erreur création maintenance'); }
        }}
      />
    </Card>
  );
};

export default MaintenancePriorityCard;