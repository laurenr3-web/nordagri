import { useState } from 'react';
import { Check, ChevronDown, ChevronUp, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOnboarding } from './OnboardingProvider';
import { ONBOARDING_STEPS } from './steps';

export function OnboardingChecklist() {
  const { currentIndex, completedIds, skip } = useOnboarding();
  const [collapsed, setCollapsed] = useState(false);

  const completedCount = completedIds.length;
  const total = ONBOARDING_STEPS.length;

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setCollapsed(false)}
        className="fixed bottom-24 right-3 lg:bottom-6 z-[9999] rounded-full bg-primary text-primary-foreground shadow-lg px-3 py-2 text-xs font-medium flex items-center gap-1.5"
      >
        <span>Tutoriel</span>
        <span className="text-[10px] opacity-90">{completedCount}/{total}</span>
        <ChevronUp className="h-3.5 w-3.5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-24 right-3 lg:bottom-6 z-[9999] w-[260px] rounded-xl border bg-card text-card-foreground shadow-2xl">
      <div className="flex items-center justify-between gap-2 px-3 pt-3">
        <p className="text-xs font-semibold">Démarrage rapide</p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Réduire"
            onClick={() => setCollapsed(true)}
            className="p-1 rounded hover:bg-accent"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label="Passer le tutoriel"
            onClick={skip}
            className="p-1 rounded hover:bg-accent"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="px-3 pb-3 pt-2 space-y-1.5">
        {ONBOARDING_STEPS.map((s, idx) => {
          const done = completedIds.includes(s.id);
          const isCurrent = idx === currentIndex && !done;
          return (
            <div
              key={s.id}
              className={cn(
                'flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition',
                isCurrent && 'bg-primary/10 ring-1 ring-primary/40',
                done && 'opacity-70',
              )}
            >
              <span
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-semibold flex-shrink-0',
                  done
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : isCurrent
                      ? 'border-primary text-primary'
                      : 'border-muted-foreground/40 text-muted-foreground',
                )}
              >
                {done ? <Check className="h-3 w-3" /> : idx + 1}
              </span>
              <span className={cn('flex-1', done && 'line-through')}>{s.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}