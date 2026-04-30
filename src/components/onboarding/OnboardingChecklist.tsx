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
        aria-expanded="false"
        aria-label={`Rouvrir la checklist du tutoriel — ${completedCount} sur ${total} étapes terminées`}
        className="fixed bottom-24 right-3 lg:bottom-6 z-[9999] rounded-full bg-primary text-primary-foreground shadow-lg px-3 py-2 text-xs font-medium flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span>Tutoriel</span>
        <span className="text-[10px] opacity-90" aria-hidden="true">
          {completedCount}/{total}
        </span>
        <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    );
  }

  return (
    <section
      aria-label="Progression du tutoriel d'accueil"
      className="fixed bottom-24 right-3 lg:bottom-6 z-[9999] w-[260px] rounded-xl border bg-card text-card-foreground shadow-2xl"
    >
      <div className="flex items-center justify-between gap-2 px-3 pt-3">
        <p className="text-xs font-semibold" id="onboarding-checklist-title">
          Démarrage rapide
          <span className="sr-only">
            {` — ${completedCount} sur ${total} étapes terminées`}
          </span>
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Réduire la checklist du tutoriel"
            aria-expanded="true"
            onClick={() => setCollapsed(true)}
            className="p-1 rounded hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Passer le tutoriel d'accueil"
            onClick={skip}
            className="p-1 rounded hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
      <ol
        className="px-3 pb-3 pt-2 space-y-1.5 list-none"
        aria-labelledby="onboarding-checklist-title"
      >
        {ONBOARDING_STEPS.map((s, idx) => {
          const done = completedIds.includes(s.id);
          const isCurrent = idx === currentIndex && !done;
          const stateLabel = done
            ? 'terminée'
            : isCurrent
              ? 'en cours'
              : 'à faire';
          return (
            <li
              key={s.id}
              aria-current={isCurrent ? 'step' : undefined}
              aria-label={`Étape ${idx + 1} sur ${ONBOARDING_STEPS.length} — ${s.label} — ${stateLabel}`}
              className={cn(
                'flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition',
                isCurrent && 'bg-primary/10 ring-1 ring-primary/40',
                done && 'opacity-70',
              )}
            >
              <span
                aria-hidden="true"
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
              <span className={cn('flex-1', done && 'line-through')} aria-hidden="true">
                {s.label}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}