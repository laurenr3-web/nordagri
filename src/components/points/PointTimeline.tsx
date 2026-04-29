import { useState, useEffect } from 'react';
import { usePointEvents } from '@/hooks/points/usePointEvents';
import { EVENT_EMOJI, EVENT_LABELS, relativeFromNow } from './pointHelpers';
import { PhotoThumb } from './PhotoThumb';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getSignedPointPhotoUrl } from './uploadPointPhoto';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Pencil, Trash2, Loader2, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { PointEventType } from '@/types/Point';
import {
  useDeletePointEvent,
  useUpdatePointEvent,
} from '@/hooks/points/usePointMutations';

type EventLike = {
  id: string;
  event_type: PointEventType;
  note: string | null;
  photo_urls: string[];
  created_at: string;
  created_by: string;
};

const TYPES: PointEventType[] = ['observation', 'action', 'verification', 'note', 'correction'];

const FullPhoto = ({ path }: { path: string }) => {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    getSignedPointPhotoUrl(path).then((u) => {
      if (active) setUrl(u);
    });
    return () => {
      active = false;
    };
  }, [path]);
  if (!url) return <div className="w-full aspect-square rounded bg-muted animate-pulse" />;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="block">
      <img src={url} alt="Photo" className="w-full max-h-[70vh] object-contain rounded bg-muted/30" />
    </a>
  );
};

export const PointTimeline = ({ pointId }: { pointId: string }) => {
  const { data: events, isLoading } = usePointEvents(pointId);
  const [selected, setSelected] = useState<EventLike | null>(null);
  const [editing, setEditing] = useState(false);
  const [editNote, setEditNote] = useState('');
  const [editType, setEditType] = useState<PointEventType>('note');
  const { user } = useAuth();
  const updateEv = useUpdatePointEvent();
  const deleteEv = useDeletePointEvent();

  const openSelected = (ev: EventLike) => {
    setSelected(ev);
    setEditing(false);
    setEditNote(ev.note ?? '');
    setEditType(ev.event_type);
  };

  const canEdit = !!selected && !!user && selected.created_by === user.id;

  const handleSaveEdit = async () => {
    if (!selected) return;
    await updateEv.mutateAsync({
      id: selected.id,
      point_id: pointId,
      note: editNote.trim() || null,
      event_type: editType,
    });
    setSelected({ ...selected, note: editNote.trim() || null, event_type: editType });
    setEditing(false);
  };

  const handleDelete = async () => {
    if (!selected) return;
    if (!confirm('Supprimer cet événement ?')) return;
    await deleteEv.mutateAsync({ id: selected.id, point_id: pointId });
    setSelected(null);
  };

  if (isLoading) return <p className="text-sm text-muted-foreground py-4">Chargement…</p>;
  if (!events?.length)
    return <p className="text-sm text-muted-foreground py-4 text-center">Aucun événement pour le moment.</p>;

  return (
    <>
      <ol className="space-y-3">
        {events.map((ev) => (
          <li key={ev.id}>
            <button
              type="button"
              onClick={() => openSelected(ev as EventLike)}
              className={cn(
                'w-full text-left rounded-lg border p-3 bg-card hover:bg-accent/50 transition',
                ev.event_type === 'correction' && 'border-amber-500/50 bg-amber-500/5 hover:bg-amber-500/10'
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base leading-none">{EVENT_EMOJI[ev.event_type]}</span>
                <span className="text-xs font-medium">{EVENT_LABELS[ev.event_type]}</span>
                <span className="text-[11px] text-muted-foreground ml-auto">{relativeFromNow(ev.created_at)}</span>
              </div>
              {ev.note && <p className="text-sm whitespace-pre-wrap line-clamp-3">{ev.note}</p>}
              {ev.photo_urls?.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {ev.photo_urls.map((p, i) => (
                    <PhotoThumb
                      key={i}
                      path={p}
                      onClick={() => openSelected(ev as EventLike)}
                    />
                  ))}
                </div>
              )}
            </button>
          </li>
        ))}
      </ol>

      <Dialog open={!!selected} onOpenChange={(o) => { if (!o) { setSelected(null); setEditing(false); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="text-xl">{EVENT_EMOJI[selected.event_type]}</span>
                  <span>{EVENT_LABELS[selected.event_type]}</span>
                </DialogTitle>
                <p className="text-xs text-muted-foreground text-left">
                  {new Date(selected.created_at).toLocaleString('fr-FR')} ·{' '}
                  {relativeFromNow(selected.created_at)}
                </p>
              </DialogHeader>
              {!editing ? (
                <>
                  {selected.note && (
                    <p className="text-sm whitespace-pre-wrap">{selected.note}</p>
                  )}
                  {selected.photo_urls?.length > 0 && (
                    <div className="space-y-2">
                      {selected.photo_urls.map((p, i) => (
                        <FullPhoto key={i} path={p} />
                      ))}
                    </div>
                  )}
                  {canEdit && (
                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setEditing(true)}
                      >
                        <Pencil className="h-4 w-4 mr-1" /> Modifier
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-destructive hover:text-destructive"
                        onClick={handleDelete}
                        disabled={deleteEv.isPending}
                      >
                        {deleteEv.isPending ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-1" />
                        )}
                        Supprimer
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-3">
                  <div>
                    <Label className="mb-2 block">Type</Label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {TYPES.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setEditType(t)}
                          className={cn(
                            'flex flex-col items-center gap-1 p-2 rounded-lg border text-[10px] transition',
                            editType === t
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border hover:bg-accent'
                          )}
                        >
                          <span className="text-xl leading-none">{EVENT_EMOJI[t]}</span>
                          <span className="truncate">{EVENT_LABELS[t]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="edit-note">Note</Label>
                    <Textarea
                      id="edit-note"
                      value={editNote}
                      onChange={(e) => setEditNote(e.target.value)}
                      rows={4}
                    />
                  </div>
                  {selected.photo_urls?.length > 0 && (
                    <p className="text-[11px] text-muted-foreground">
                      Les photos existantes ne sont pas modifiables ici.
                    </p>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setEditing(false)}
                    >
                      <X className="h-4 w-4 mr-1" /> Annuler
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleSaveEdit}
                      disabled={updateEv.isPending}
                    >
                      {updateEv.isPending && (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      )}
                      Enregistrer
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};