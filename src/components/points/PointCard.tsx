import { Card } from '@/components/ui/card';
import { PointWithLastEvent } from '@/types/Point';
import {
  EVENT_EMOJI,
  EVENT_LABELS,
  FRESHNESS_DOT,
  TYPE_EMOJI,
  daysOpen,
  freshnessOf,
  relativeFromNow,
} from './pointHelpers';
import { PointStatusBadge } from './StatusBadge';
import { PointPriorityBadge } from './PriorityBadge';
import { cn } from '@/lib/utils';

interface Props {
  point: PointWithLastEvent;
  onClick: () => void;
}

export const PointCard: React.FC<Props> = ({ point, onClick }) => {
  const fresh = freshnessOf(point.last_event_at);
  const evt = point.last_event_type;
  return (
    <Card
      role="button"
      onClick={onClick}
      className="p-3 cursor-pointer hover:bg-accent/40 active:scale-[0.99] transition-all"
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl leading-none mt-0.5">{TYPE_EMOJI[point.type]}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={cn('inline-block w-2 h-2 rounded-full flex-shrink-0', FRESHNESS_DOT[fresh])} aria-hidden />
            {point.entity_label && (
              <span className="font-semibold text-sm truncate">{point.entity_label}</span>
            )}
          </div>
          <p className="text-sm text-foreground line-clamp-2 mb-1.5">{point.title}</p>
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            <PointPriorityBadge priority={point.priority} />
            <PointStatusBadge status={point.status} />
          </div>
          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            {evt && <span>{EVENT_EMOJI[evt]} {EVENT_LABELS[evt]}</span>}
            {evt && <span>·</span>}
            <span className="truncate">Activité {relativeFromNow(point.last_event_at)}</span>
            <span>·</span>
            <span className="whitespace-nowrap">{daysOpen(point.created_at)} j</span>
          </div>
          {point.last_event_note && (
            <p className="text-[11px] text-muted-foreground italic line-clamp-1 mt-1">"{point.last_event_note}"</p>
          )}
        </div>
      </div>
    </Card>
  );
};