import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { Point, PointPriority } from '@/types/Point';
import { useCreateLinkedTask } from '@/hooks/points/usePointLinkedTasks';
import { useTeamMembers } from '@/hooks/useTeamMembers';

const PRIORITY_TO_PLANNING: Record<PointPriority, 'critical' | 'important' | 'todo'> = {
  critical: 'critical',
  important: 'important',
  normal: 'todo',
};

const PRIORITY_LABELS: Record<'critical' | 'important' | 'todo', string> = {
  critical: 'Critique',
  important: 'Important',
  todo: 'À faire',
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  point: Point;
}

export const CreateLinkedTaskDialog: React.FC<Props> = ({ open, onOpenChange, point }) => {
  const [title, setTitle] = useState(point.title);
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [assignedTo, setAssignedTo] = useState<string>('unassigned');
  const [priority, setPriority] = useState<'critical' | 'important' | 'todo'>(
    PRIORITY_TO_PLANNING[point.priority]
  );
  const [notes, setNotes] = useState('');
  const create = useCreateLinkedTask();
  const { teamMembers } = useTeamMembers();

  const handleSubmit = async () => {
    if (!title.trim()) return;
    await create.mutateAsync({
      farm_id: point.farm_id,
      point_id: point.id,
      title: title.trim(),
      due_date: dueDate,
      assigned_to: assignedTo === 'unassigned' ? null : assignedTo,
      priority,
      notes: notes.trim() || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[88vh] overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>Créer une tâche liée</SheetTitle>
        </SheetHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="task-title">Titre *</Label>
            <Input id="task-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="task-date">Date</Label>
            <Input id="task-date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div>
            <Label>Assignée à</Label>
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger>
                <SelectValue placeholder="Non assignée" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Non assignée</SelectItem>
                {teamMembers
                  .filter((m) => m.user_id)
                  .map((m) => (
                    <SelectItem key={m.user_id} value={m.user_id!}>
                      {m.first_name || m.last_name ? `${m.first_name ?? ''} ${m.last_name ?? ''}`.trim() : m.email}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-2 block">Priorité</Label>
            <div className="grid grid-cols-3 gap-2">
              {(['critical', 'important', 'todo'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={cn(
                    'p-2 rounded-lg border text-sm transition',
                    priority === p ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-accent'
                  )}
                >
                  {PRIORITY_LABELS[p]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="task-notes">Note (optionnel)</Label>
            <Textarea id="task-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button className="flex-1" onClick={handleSubmit} disabled={!title.trim() || create.isPending}>
              {create.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Créer la tâche
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};