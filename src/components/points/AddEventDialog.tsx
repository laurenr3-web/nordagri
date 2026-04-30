import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { PointEventType } from '@/types/Point';
import { EVENT_EMOJI, EVENT_LABELS } from './pointHelpers';
import { useAddPointEvent, useUpdatePointNextCheck } from '@/hooks/points/usePointMutations';
import { uploadPointPhoto } from './uploadPointPhoto';
import { Camera, Clock, Loader2, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

const TYPES: PointEventType[] = ['observation', 'action', 'verification', 'note', 'correction'];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pointId: string;
  farmId: string;
}

export const AddEventDialog: React.FC<Props> = ({ open, onOpenChange, pointId, farmId }) => {
  const [type, setType] = useState<PointEventType>('note');
  const [note, setNote] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [scheduleCheck, setScheduleCheck] = useState(false);
  const [days, setDays] = useState<number>(3);
  const add = useAddPointEvent();
  const updateNextCheck = useUpdatePointNextCheck();

  const reset = () => {
    setType('note');
    setNote('');
    setPhotoFile(null);
    setScheduleCheck(false);
    setDays(3);
  };

  const handleSubmit = async () => {
    if (!note.trim() && !photoFile) return;
    let urls: string[] = [];
    if (photoFile) {
      try {
        setUploading(true);
        urls = [await uploadPointPhoto(photoFile, farmId, pointId)];
      } finally {
        setUploading(false);
      }
    }
    await add.mutateAsync({
      point_id: pointId,
      event_type: type,
      note: note.trim() || null,
      photo_urls: urls,
    });
    if (scheduleCheck && days > 0) {
      await updateNextCheck.mutateAsync({ id: pointId, days });
    }
    reset();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
        <SheetHeader className="mb-4 flex-row items-center justify-between space-y-0">
          <SheetTitle>Ajouter à la timeline</SheetTitle>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 -mr-2"
            onClick={() => onOpenChange(false)}
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </Button>
        </SheetHeader>
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">Type d'événement</Label>
            <div className="grid grid-cols-5 gap-1.5">
              {TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-2 rounded-lg border text-[10px] transition',
                    type === t ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-accent'
                  )}
                >
                  <span className="text-xl leading-none">{EVENT_EMOJI[t]}</span>
                  <span className="truncate">{EVENT_LABELS[t]}</span>
                </button>
              ))}
            </div>
            {type === 'correction' && (
              <p className="text-[11px] text-muted-foreground mt-2">
                ⚠️ Une correction n'efface pas l'historique : elle s'ajoute en haut de la timeline.
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="event-note">Note</Label>
            <Textarea
              id="event-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Décrire l'observation, l'action, etc."
            />
          </div>

          <div>
            <Label className="mb-2 block">Photo (optionnel)</Label>
            <label className="flex items-center gap-2 p-3 rounded-lg border border-dashed cursor-pointer hover:bg-accent text-sm">
              <Camera className="h-4 w-4" />
              {photoFile ? photoFile.name : 'Ajouter une photo'}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          <div className="rounded-lg border p-3 space-y-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <Checkbox
                checked={scheduleCheck}
                onCheckedChange={(v) => setScheduleCheck(v === true)}
              />
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">À revoir dans…</span>
            </label>
            {scheduleCheck && (
              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-1.5">
                  {[1, 3, 7, 14].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDays(d)}
                      className={cn(
                        'py-2 rounded-md border text-sm transition',
                        days === d
                          ? 'border-primary bg-primary/10 text-primary font-medium'
                          : 'border-border hover:bg-accent'
                      )}
                    >
                      {d} j
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="custom-days" className="text-xs text-muted-foreground">
                    ou
                  </Label>
                  <Input
                    id="custom-days"
                    type="number"
                    min={1}
                    max={60}
                    value={days}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      if (!Number.isNaN(v)) setDays(Math.min(60, Math.max(1, v)));
                    }}
                    className="h-9 w-20"
                  />
                  <span className="text-xs text-muted-foreground">jours</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={(!note.trim() && !photoFile) || add.isPending || uploading}
            >
              {(add.isPending || uploading) && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Ajouter
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};