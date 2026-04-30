import { useEffect, useRef, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { PointPriority, PointType } from '@/types/Point';
import { PRIORITY_LABELS, TYPE_EMOJI, TYPE_LABELS } from './pointHelpers';
import { useCreatePoint } from '@/hooks/points/usePointMutations';
import { uploadPointPhoto } from './uploadPointPhoto';
import { Camera, Loader2, X } from 'lucide-react';
import { HelpTooltip } from '@/components/help/HelpTooltip';

export interface NewPointDialogDefaults {
  type?: PointType;
  entityLabel?: string;
  priority?: PointPriority;
  title?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  farmId: string;
  defaultValues?: NewPointDialogDefaults;
}

const TYPES: PointType[] = ['animal', 'equipement', 'champ', 'batiment', 'autre'];
const PRIORITIES: PointPriority[] = ['critical', 'important', 'normal'];

export const NewPointDialog: React.FC<Props> = ({ open, onOpenChange, farmId, defaultValues }) => {
  const [type, setType] = useState<PointType>(defaultValues?.type ?? 'autre');
  const [entityLabel, setEntityLabel] = useState(defaultValues?.entityLabel ?? '');
  const [title, setTitle] = useState(defaultValues?.title ?? '');
  const [priority, setPriority] = useState<PointPriority>(defaultValues?.priority ?? 'normal');
  const [note, setNote] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const create = useCreatePoint();

  // Re-apply defaultValues only on the false → true transition of `open`,
  // so that user-typed values are not wiped on parent rerenders.
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setType(defaultValues?.type ?? 'autre');
      setEntityLabel(defaultValues?.entityLabel ?? '');
      setPriority(defaultValues?.priority ?? 'normal');
      setTitle(defaultValues?.title ?? '');
      setNote('');
      setPhotoFile(null);
    }
    wasOpenRef.current = open;
  }, [open, defaultValues]);

  const reset = () => {
    setType('autre');
    setEntityLabel('');
    setTitle('');
    setPriority('normal');
    setNote('');
    setPhotoFile(null);
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    let photoUrls: string[] = [];
    if (photoFile) {
      try {
        setUploading(true);
        const path = await uploadPointPhoto(photoFile, farmId, null);
        photoUrls = [path];
      } finally {
        setUploading(false);
      }
    }
    await create.mutateAsync({
      farm_id: farmId,
      type,
      entity_label: entityLabel.trim() || null,
      title: title.trim(),
      priority,
      initialNote: note.trim() || undefined,
      initialPhotoUrls: photoUrls.length ? photoUrls : undefined,
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[92vh] overflow-y-auto">
        <SheetHeader className="mb-4 flex-row items-center justify-between space-y-0">
          <SheetTitle>Nouveau point à surveiller</SheetTitle>
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
            <Label className="mb-2 inline-flex items-center gap-1">
              Type
              <HelpTooltip contentKey="point.field.type" />
            </Label>
            <div className="grid grid-cols-5 gap-1.5">
              {TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-2 rounded-lg border text-[11px] transition',
                    type === t ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-accent'
                  )}
                >
                  <span className="text-xl leading-none">{TYPE_EMOJI[t]}</span>
                  <span className="truncate">{TYPE_LABELS[t]}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="entity" className="inline-flex items-center gap-1">
              Élément concerné
              <HelpTooltip contentKey="point.field.entityLabel" />
            </Label>
            <Input
              id="entity"
              value={entityLabel}
              onChange={(e) => setEntityLabel(e.target.value)}
              placeholder="ex : Vache #142, Tracteur, Champ Nord…"
            />
          </div>

          <div>
            <Label htmlFor="title">Description du problème *</Label>
            <Textarea
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Décrire le problème en quelques mots…"
              rows={2}
              required
            />
          </div>

          <div>
            <Label className="mb-2 inline-flex items-center gap-1">
              Priorité
              <HelpTooltip contentKey="point.field.priority" />
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {PRIORITIES.map((p) => (
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
            <Label htmlFor="note">Note initiale (optionnel)</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Détail, contexte…"
              rows={2}
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

          <div className="flex gap-2 pt-2 sticky bottom-0 bg-background pb-1">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={!title.trim() || create.isPending || uploading}
            >
              {(create.isPending || uploading) && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Créer
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};