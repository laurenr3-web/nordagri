import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useFarmId } from '@/hooks/useFarmId';
import { useUpsertPlannedShift, useDeletePlannedShift } from '@/hooks/planned-shifts';
import { toast } from 'sonner';
import type { PlannedShift, PlannedShiftStatus } from '@/types/PlannedShift';
import { Trash2 } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate: string;
  shift?: PlannedShift | null;
  defaultFarmMemberId?: string | null;
}

const STATUSES: { value: PlannedShiftStatus; label: string }[] = [
  { value: 'scheduled', label: 'Planifié' },
  { value: 'confirmed', label: 'Confirmé' },
  { value: 'absent', label: 'Absent' },
  { value: 'completed', label: 'Terminé' },
];

export function AddPresenceSheet({ open, onOpenChange, defaultDate, shift, defaultFarmMemberId }: Props) {
  const { farmId } = useFarmId();
  const { teamMembers } = useTeamMembers();
  const upsert = useUpsertPlannedShift();
  const remove = useDeletePlannedShift();

  const [farmMemberId, setFarmMemberId] = useState<string>('');
  const [date, setDate] = useState<string>(defaultDate);
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [status, setStatus] = useState<PlannedShiftStatus>('scheduled');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (shift) {
      setFarmMemberId(shift.farm_member_id);
      setDate(shift.shift_date);
      setStartTime(shift.start_time?.slice(0, 5) || '');
      setEndTime(shift.end_time?.slice(0, 5) || '');
      setRole(shift.role || '');
      setStatus(shift.status);
      setNotes(shift.notes || '');
    } else {
      setFarmMemberId(defaultFarmMemberId || '');
      setDate(defaultDate);
      setStartTime('');
      setEndTime('');
      setRole('');
      setStatus('scheduled');
      setNotes('');
    }
    setError(null);
  }, [open, shift, defaultDate, defaultFarmMemberId]);

  const eligibleMembers = teamMembers.filter((m) => m.id);

  const handleSubmit = async () => {
    setError(null);
    if (!farmId) return;
    if (!farmMemberId) return setError('Sélectionnez un membre');
    if (!date) return setError('Sélectionnez une date');
    if (!status) return setError('Statut requis');
    if (startTime && endTime && startTime >= endTime) {
      return setError('Heure de début doit être avant heure de fin');
    }
    try {
      await upsert.mutateAsync({
        id: shift?.id,
        farm_id: farmId,
        farm_member_id: farmMemberId,
        shift_date: date,
        start_time: startTime || null,
        end_time: endTime || null,
        role: role || null,
        status,
        notes: notes || null,
      });
      toast.success(shift ? 'Présence mise à jour' : 'Présence ajoutée');
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message || 'Échec');
    }
  };

  const handleDelete = async () => {
    if (!shift || !farmId) return;
    try {
      await remove.mutateAsync({ id: shift.id, farmId });
      toast.success('Présence supprimée');
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message || 'Échec');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{shift ? 'Modifier la présence' : 'Ajouter une présence'}</SheetTitle>
        </SheetHeader>
        <div className="grid gap-3 py-3">
          <div className="grid gap-1.5">
            <Label>Membre *</Label>
            <Select value={farmMemberId} onValueChange={setFarmMemberId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un membre" />
              </SelectTrigger>
              <SelectContent>
                {eligibleMembers.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.first_name} {m.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label>Date *</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Début</Label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>Fin</Label>
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Rôle</Label>
            <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Ex. traite, champs" />
          </div>
          <div className="grid gap-1.5">
            <Label>Statut *</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as PlannedShiftStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label>Notes</Label>
            <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          {error && <div role="alert" className="text-sm text-destructive">{error}</div>}
        </div>
        <div className="flex flex-col gap-2 pt-2">
          <Button onClick={handleSubmit} disabled={upsert.isPending} className="w-full">
            {shift ? 'Enregistrer' : 'Ajouter'}
          </Button>
          {shift && (
            <Button onClick={handleDelete} disabled={remove.isPending} variant="ghost" className="w-full text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}