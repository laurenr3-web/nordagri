import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useFarmId } from '@/hooks/useFarmId';
import { planningService, type PlanningTask } from '@/services/planning/planningService';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unassignedTasks: PlanningTask[];
}

export function QuickAssignSheet({ open, onOpenChange, unassignedTasks }: Props) {
  const { farmId } = useFarmId();
  const { teamMembers } = useTeamMembers();
  const qc = useQueryClient();
  const [selectedMember, setSelectedMember] = useState<Record<string, string>>({});
  const [pendingId, setPendingId] = useState<string | null>(null);

  const invalidatePlanning = () => {
    qc.invalidateQueries({ queryKey: ['planningTasks'] });
    qc.invalidateQueries({ queryKey: ['planningOverdue'] });
    qc.invalidateQueries({ queryKey: ['planningRecurring'] });
    qc.invalidateQueries({ queryKey: ['planningCompletions'] });
    qc.invalidateQueries({ queryKey: ['dashboard-v2'] });
    if (farmId) qc.invalidateQueries({ queryKey: ['planned-shifts', farmId] });
  };

  const handleAssign = async (taskId: string) => {
    const farmMemberId = selectedMember[taskId];
    if (!farmMemberId) return;
    const member = teamMembers.find((m) => m.id === farmMemberId);
    const userId = member?.user_id;
    if (!userId) {
      toast.error('Ce membre n\'a pas de compte utilisateur');
      return;
    }
    setPendingId(taskId);
    try {
      await planningService.updateTask(taskId, { assigned_to: userId });
      invalidatePlanning();
      toast.success('Tâche assignée');
    } catch (e: any) {
      toast.error(e?.message || 'Échec');
    } finally {
      setPendingId(null);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Assigner les tâches du jour</SheetTitle>
        </SheetHeader>
        <div className="grid gap-2 py-3">
          {unassignedTasks.length === 0 && (
            <div className="text-sm text-muted-foreground py-6 text-center">
              Aucune tâche à assigner
            </div>
          )}
          {unassignedTasks.map((t) => {
            const priority = t.manual_priority || t.computed_priority;
            return (
              <Card key={t.id} className="p-3 grid gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-medium text-sm flex-1 min-w-0 break-words">{t.title}</div>
                  <Badge variant={priority === 'critical' ? 'destructive' : priority === 'important' ? 'warning' : 'secondary'} className="text-[10px]">
                    {priority === 'critical' ? 'Critique' : priority === 'important' ? 'Important' : 'À faire'}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Select
                    value={selectedMember[t.id] || ''}
                    onValueChange={(v) => setSelectedMember((s) => ({ ...s, [t.id]: v }))}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Choisir un membre" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.filter((m) => m.user_id).map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.first_name} {m.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => handleAssign(t.id)}
                    disabled={!selectedMember[t.id] || pendingId === t.id}
                  >
                    Assigner
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}