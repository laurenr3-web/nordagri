import { useState } from 'react';
import { usePointEvents } from '@/hooks/points/usePointEvents';
import { EVENT_EMOJI, EVENT_LABELS, relativeFromNow } from './pointHelpers';
import { PhotoThumb } from './PhotoThumb';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getSignedPointPhotoUrl } from './uploadPointPhoto';
import { useEffect } from 'react';

type EventLike = {
  id: string;
  event_type: keyof typeof EVENT_EMOJI;
  note: string | null;
  photo_urls: string[];
  created_at: string;
};

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
              onClick={() => setSelected(ev as EventLike)}
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
                      onClick={() => setSelected(ev as EventLike)}
                    />
                  ))}
                </div>
              )}
            </button>
          </li>
        ))}
      </ol>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
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
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};