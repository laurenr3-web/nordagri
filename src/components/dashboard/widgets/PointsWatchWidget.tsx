import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { PointsWatchData, PointWatchItem } from '@/hooks/dashboard/usePointsWatchData';

interface Props {
  data: PointsWatchData | null;
  loading: boolean;
  size?: 'small' | 'medium' | 'large' | 'full';
}

const PRIORITY_LABEL: Record<PointWatchItem['priority'], string> = {
  critical: 'critique',
  important: 'important',
  normal: 'normal',
};

const PRIORITY_TEXT_CLASS: Record<PointWatchItem['priority'], string> = {
  critical: 'text-destructive',
  important: 'text-[hsl(30_90%_45%)]',
  normal: 'text-muted-foreground',
};

export const PointsWatchWidget = ({ data, loading }: Props) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  if (!data || data.total === 0) {
    return (
      <button
        onClick={() => navigate('/points')}
        className="w-full flex items-center gap-2 text-left py-2"
      >
        <AlertCircle className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Aucun point à surveiller ✓</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => navigate('/points')}
      className="w-full text-left space-y-2 group"
    >
      <div className="flex items-center gap-2">
        <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
        <span className="text-sm font-semibold text-foreground">
          {data.total} point{data.total > 1 ? 's' : ''} à surveiller
        </span>
        {(data.criticalCount > 0 || data.importantCount > 0) && (
          <span className="text-xs text-muted-foreground">
            — {data.criticalCount > 0 && `${data.criticalCount} critique${data.criticalCount > 1 ? 's' : ''}`}
            {data.criticalCount > 0 && data.importantCount > 0 && ', '}
            {data.importantCount > 0 && `${data.importantCount} important${data.importantCount > 1 ? 's' : ''}`}
          </span>
        )}
        <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto group-hover:translate-x-0.5 transition-transform" />
      </div>
      <ul className="space-y-1 pl-7">
        {data.examples.map((p) => {
          const label = p.entity_label || p.title;
          return (
            <li key={p.id} className="text-sm truncate">
              <span className="text-muted-foreground">→ </span>
              <span className="text-foreground">{label}</span>
              {p.priority !== 'normal' && (
                <span className={cn('ml-1 text-xs', PRIORITY_TEXT_CLASS[p.priority])}>
                  ({PRIORITY_LABEL[p.priority]})
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </button>
  );
};