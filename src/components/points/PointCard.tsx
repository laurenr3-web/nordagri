import { Card } from '@/components/ui/card';
import { PointWithLastEvent } from '@/types/Point';
import { Button } from '@/components/ui/button';
import { Eye, RotateCcw } from 'lucide-react';
import { useUpdatePointStatus } from '@/hooks/points/usePointMutations';
import {
  EVENT_EMOJI,
  EVENT_LABELS,
  FRESHNESS_DOT,
  TYPE_EMOJI,
  freshnessOf,
  nextCheckState,
  relativeFromNow,
} from './pointHelpers';
import { PointStatusBadge } from './StatusBadge';
import { PointPriorityBadge } from './PriorityBadge';
import { cn } from '@/lib/utils';

interface Props {
  point: PointWithLastEvent;
  onClick: () => void;
}

/**
 * Compact point card — max 5 visible lines:
 * 1. type emoji + entity_label (bold)
 * 2. title
 * 3. badges (priority + status)
 * 4. last event icon + label (1 line)
 * 5. relative time (discreet)
 */
export const PointCard: React.FC<Props> = ({ point, onClick }) => {
  const fresh = freshnessOf(point.last_event_at);
  const evt = point.last_event_type;
  const updateStatus = useUpdatePointStatus();
  const isResolved = point.status === 'resolved';

  const handleQuickStatus = (e: React.MouseEvent, status: 'open' | 'watch') => {
    e.stopPropagation();
    updateStatus.mutate({ id: point.id, status });
  };

  return (
    <Card
      role="button"
      onClick={onClick}
      className="px-3 py-2.5 cursor-pointer hover:bg-accent/40 active:scale-[0.99] transition-all"
    >
      <div className="flex items-start gap-2.5">
        <div className="relative flex-shrink-0">
          <div className="text-xl leading-none mt-0.5" aria-hidden>
            {TYPE_EMOJI[point.type]}
          </div>
          <span
            className={cn(
              'absolute -top-0.5 -right-1 w-2 h-2 rounded-full ring-2 ring-card',
              FRESHNESS_DOT[fresh]
            )}
            aria-label={`Fraîcheur: ${fresh}`}
          />
        </div>

        <div className="flex-1 min-w-0">
          {/* Line 1: entity label */}
          {point.entity_label ? (
            <p className="font-semibold text-sm leading-tight truncate">
              {point.entity_label}
            </p>
          ) : (
            <p className="font-semibold text-sm leading-tight truncate text-muted-foreground">
              Sans cible
            </p>
          )}

          {/* Line 2: title */}
          <p className="text-sm text-foreground/90 line-clamp-1 mt-0.5">
            {point.title}
          </p>

          {/* Line 3: badges */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <PointPriorityBadge priority={point.priority} />
            <PointStatusBadge status={point.status} />
            {point.status !== 'resolved' && (() => {
              const nc = nextCheckState(point.next_check_at);
              if (nc.kind === 'none') return null;
              const icon = nc.kind === 'overdue' ? '⚠️' : nc.kind === 'today' ? '🔴' : '🕒';
              return (
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded border whitespace-nowrap',
                    nc.badgeClass
                  )}
                >
                  {icon} {nc.shortLabel}
                </span>
              );
            })()}
          </div>

          {/* Line 4: last event */}
          {evt && (
            <p className="text-[11px] text-muted-foreground line-clamp-1 mt-1.5 flex items-center gap-1">
              <span aria-hidden>{EVENT_EMOJI[evt]}</span>
              <span className="truncate">
                {point.last_event_note?.trim() || EVENT_LABELS[evt]}
              </span>
            </p>
          )}

          {/* Line 5: relative time */}
          <p className="text-[10px] text-muted-foreground/70 mt-0.5">
            {relativeFromNow(point.last_event_at)}
          </p>

          {isResolved && (
            <div className="flex gap-1.5 mt-2 pt-2 border-t">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7 px-2 text-[11px] flex-1"
                onClick={(e) => handleQuickStatus(e, 'open')}
                disabled={updateStatus.isPending}
              >
                <RotateCcw className="h-3 w-3 mr-1" /> Rouvrir
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7 px-2 text-[11px] flex-1"
                onClick={(e) => handleQuickStatus(e, 'watch')}
                disabled={updateStatus.isPending}
              >
                <Eye className="h-3 w-3 mr-1" /> À surveiller
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};