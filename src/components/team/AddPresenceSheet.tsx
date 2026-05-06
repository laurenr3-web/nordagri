import { useEffect, useState } from 'react';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useFarmId } from '@/hooks/useFarmId';
import { useUpsertPlannedShift, useDeletePlannedShift } from '@/hooks/planned-shifts';
import { plannedShiftsService } from '@/services/planned-shifts/plannedShiftsService';
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

const STATUS_VALUES: PlannedShiftStatus[] = ['scheduled', 'confirmed', 'absent', 'completed'];

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function toMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export function AddPresenceSheet({ open, onOpenChange, defaultDate, shift, defaultFarmMemberId }: Props) {
  const { t } = useTranslation();
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
  const [submitting, setSubmitting] = useState(false);

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

  const buildSchema = () =>
    z
      .object({
        farmMemberId: z.string().trim().min(1, t('team.presence.error.member')),
        date: z
          .string()
          .trim()
          .min(1, t('team.presence.error.date'))
          .regex(DATE_RE, t('team.presence.error.dateInvalid')),
        startTime: z
          .string()
          .trim()
          .refine((v) => v === '' || TIME_RE.test(v), t('team.presence.error.timeFormat')),
        endTime: z
          .string()
          .trim()
          .refine((v) => v === '' || TIME_RE.test(v), t('team.presence.error.timeFormat')),
        role: z.string().trim().max(60, t('team.presence.error.roleTooLong')),
        status: z.enum(STATUS_VALUES as [PlannedShiftStatus, ...PlannedShiftStatus[]], {
          errorMap: () => ({ message: t('team.presence.error.status') }),
        }),
        notes: z.string().trim().max(500, t('team.presence.error.notesTooLong')),
      })
      .superRefine((val, ctx) => {
        const hasStart = !!val.startTime;
        const hasEnd = !!val.endTime;
        if (hasStart !== hasEnd) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['endTime'],
            message: t('team.presence.error.timesRequiredTogether'),
          });
        }
        if (hasStart && hasEnd && toMinutes(val.startTime) >= toMinutes(val.endTime)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['endTime'],
            message: t('team.presence.error.startBeforeEnd'),
          });
        }
        if (val.status === 'absent' && (hasStart || hasEnd)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['status'],
            message: t('team.presence.error.absentNoTimes'),
          });
        }
      });

  const handleSubmit = async () => {
    setError(null);
    if (!farmId) return;

    const parsed = buildSchema().safeParse({
      farmMemberId,
      date,
      startTime,
      endTime,
      role,
      status,
      notes,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || t('team.presence.toast.failed'));
      return;
    }

    setSubmitting(true);
    try {
      // Overlap check (only when times provided)
      if (parsed.data.startTime && parsed.data.endTime) {
        try {
          const sameDay = await plannedShiftsService.listByDay(farmId, parsed.data.date);
          const startMin = toMinutes(parsed.data.startTime);
          const endMin = toMinutes(parsed.data.endTime);
          const overlaps = sameDay.some((s) => {
            if (s.id === shift?.id) return false;
            if (s.farm_member_id !== parsed.data.farmMemberId) return false;
            if (s.status === 'absent') return false;
            if (!s.start_time || !s.end_time) return false;
            const sStart = toMinutes(s.start_time.slice(0, 5));
            const sEnd = toMinutes(s.end_time.slice(0, 5));
            return startMin < sEnd && endMin > sStart;
          });
          if (overlaps) {
            setError(t('team.presence.error.overlap'));
            return;
          }
        } catch {
          setError(t('team.presence.error.checkOverlapFailed'));
          return;
        }
      }

      await upsert.mutateAsync({
        id: shift?.id,
        farm_id: farmId,
        farm_member_id: parsed.data.farmMemberId,
        shift_date: parsed.data.date,
        start_time: parsed.data.startTime || null,
        end_time: parsed.data.endTime || null,
        role: parsed.data.role || null,
        status: parsed.data.status,
        notes: parsed.data.notes || null,
      });
      toast.success(shift ? t('team.presence.toast.updated') : t('team.presence.toast.added'));
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message || t('team.presence.toast.failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!shift || !farmId) return;
    try {
      await remove.mutateAsync({ id: shift.id, farmId });
      toast.success(t('team.presence.toast.deleted'));
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message || t('team.presence.toast.failed'));
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {shift ? t('team.presence.title.edit') : t('team.presence.title.add')}
          </SheetTitle>
        </SheetHeader>
        <div className="grid gap-3 py-3">
          <div className="grid gap-1.5">
            <Label>{t('team.presence.field.member')} *</Label>
            <Select value={farmMemberId} onValueChange={setFarmMemberId}>
              <SelectTrigger>
                <SelectValue placeholder={t('team.presence.error.member')} />
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
            <Label>{t('team.presence.field.date')} *</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>{t('team.presence.field.start')}</Label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>{t('team.presence.field.end')}</Label>
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>{t('team.presence.field.role')}</Label>
            <Input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder={t('team.presence.field.role.placeholder')}
              maxLength={60}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>{t('team.presence.field.status')} *</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as PlannedShiftStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_VALUES.map((s) => (
                  <SelectItem key={s} value={s}>{t(`team.presence.status.${s}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label>{t('team.presence.field.notes')}</Label>
            <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} />
          </div>
          {error && <div role="alert" className="text-sm text-destructive">{error}</div>}
        </div>
        <div className="flex flex-col gap-2 pt-2">
          <Button onClick={handleSubmit} disabled={submitting || upsert.isPending} className="w-full">
            {shift ? t('team.presence.action.save') : t('team.presence.action.add')}
          </Button>
          {shift && (
            <Button onClick={handleDelete} disabled={remove.isPending} variant="ghost" className="w-full text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              {t('team.presence.action.delete')}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}