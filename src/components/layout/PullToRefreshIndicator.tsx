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
  const rotate = progress * 180;

  return (
    <div
      aria-hidden={!visible}
      className="pointer-events-none fixed inset-x-0 top-2 z-[60] flex justify-center md:hidden"
      style={{
        transform: `translateY(${visible ? translate - 24 : -48}px)`,
        opacity: visible ? (state === 'pulling' ? 0.6 + progress * 0.4 : 1) : 0,
        transition:
          state === 'pulling' || state === 'ready'
            ? 'opacity 180ms ease-out'
            : 'transform 260ms ease, opacity 260ms ease',
      }}
    >
      <div
        className={cn(
          'flex items-center gap-2 rounded-full border bg-background/95 px-3 py-1.5 shadow-sm backdrop-blur',
          'border-border text-[11px] font-medium text-muted-foreground',
          'transition-colors duration-200',
          state === 'ready' && 'border-primary/30 bg-primary/5 text-primary',
          state === 'refreshing' && 'text-foreground',
          state === 'done' && 'border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
        )}
      >
        {state === 'done' ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <RefreshCw
            className={cn(
              'h-3.5 w-3.5',
              state === 'refreshing' && '[animation:spin_1.2s_linear_infinite]',
            )}
            style={
              state === 'refreshing'
                ? undefined
                : { transform: `rotate(${rotate}deg)`, transition: 'transform 160ms ease-out' }
            }
          />
        )}
        <span>{labels[state] || labels.pulling}</span>
      </div>
    </div>
  );
};

export default PullToRefreshIndicator;