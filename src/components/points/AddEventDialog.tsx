import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { PointEventType } from '@/types/Point';
import { EVENT_EMOJI, EVENT_LABELS } from './pointHelpers';
import { useAddPointEvent } from '@/hooks/points/usePointMutations';
import { uploadPointPhoto } from './uploadPointPhoto';
import { Camera, Loader2, X } from 'lucide-react';

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
  const add = useAddPointEvent();

  const reset = () => {
    setType('note');
    setNote('');
    setPhotoFile(null);
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