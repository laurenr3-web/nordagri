import React from 'react';
import { RefreshCw, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PullState } from '@/hooks/usePullToRefresh';

interface Props {
  state: PullState;
  distance: number;
  threshold: number;
}

const labels: Record<PullState, string> = {
  idle: '',
  pulling: 'Tirez pour actualiser',
  ready: 'Relâchez pour actualiser',
  refreshing: 'Actualisation…',
  done: 'Mis à jour',
};

export const PullToRefreshIndicator: React.FC<Props> = ({ state, distance, threshold }) => {
  const visible = state !== 'idle' || distance > 0;
  const progress = Math.min(distance / threshold, 1);
  const translate = state === 'refreshing' || state === 'done' ? threshold * 0.6 : distance * 0.6;
  const rotate = progress * 360;

  return (
    <div
      aria-hidden={!visible}
      className="pointer-events-none fixed inset-x-0 top-2 z-[60] flex justify-center md:hidden"
      style={{
        transform: `translateY(${visible ? translate - 24 : -48}px)`,
        opacity: visible ? 1 : 0,
        transition: state === 'pulling' || state === 'ready' ? 'opacity 120ms' : 'transform 220ms ease, opacity 220ms',
      }}
    >
      <div
        className={cn(
          'flex items-center gap-2 rounded-full border bg-background/95 px-3 py-1.5 shadow-sm backdrop-blur',
          'border-border text-xs font-medium text-foreground',
          state === 'ready' && 'border-primary/40 bg-primary/5 text-primary',
          state === 'done' && 'border-emerald-500/40 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
        )}
      >
        {state === 'done' ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <RefreshCw
            className={cn('h-3.5 w-3.5', state === 'refreshing' && 'animate-spin')}
            style={state === 'refreshing' ? undefined : { transform: `rotate(${rotate}deg)`, transition: 'transform 80ms linear' }}
          />
        )}
        <span>{labels[state] || labels.pulling}</span>
      </div>
    </div>
  );
};

export default PullToRefreshIndicator;