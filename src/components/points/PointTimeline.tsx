import { usePointEvents } from '@/hooks/points/usePointEvents';
import { EVENT_EMOJI, EVENT_LABELS, relativeFromNow } from './pointHelpers';
import { PhotoThumb } from './PhotoThumb';
import { cn } from '@/lib/utils';

export const PointTimeline = ({ pointId }: { pointId: string }) => {
  const { data: events, isLoading } = usePointEvents(pointId);

  if (isLoading) return <p className="text-sm text-muted-foreground py-4">Chargement…</p>;
  if (!events?.length)
    return <p className="text-sm text-muted-foreground py-4 text-center">Aucun événement pour le moment.</p>;

  return (
    <ol className="space-y-3">
      {events.map((ev) => (
        <li
          key={ev.id}
          className={cn(
            'rounded-lg border p-3 bg-card',
            ev.event_type === 'correction' && 'border-amber-500/50 bg-amber-500/5'
          )}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base leading-none">{EVENT_EMOJI[ev.event_type]}</span>
            <span className="text-xs font-medium">{EVENT_LABELS[ev.event_type]}</span>
            <span className="text-[11px] text-muted-foreground ml-auto">{relativeFromNow(ev.created_at)}</span>
          </div>
          {ev.note && <p className="text-sm whitespace-pre-wrap">{ev.note}</p>}
          {ev.photo_urls?.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {ev.photo_urls.map((p, i) => (
                <PhotoThumb key={i} path={p} />
              ))}
            </div>
          )}
        </li>
      ))}
    </ol>
  );
};