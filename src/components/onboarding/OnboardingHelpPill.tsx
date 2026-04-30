import { useLocation } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';
import { useOnboarding } from './OnboardingProvider';
import { ONBOARDING_STEPS } from './steps';

/**
 * Discreet floating "Aide (n/4)" pill. Shown on every page that has an
 * onboarding step matching the current route, but only when the spotlight
 * is NOT already active. Clicking it starts the tutorial on that page's
 * step — no auto-redirect, no surprise spotlight.
 */
export function OnboardingHelpPill() {
  const { available, isActive, startStep, completedIds } = useOnboarding();
  const { pathname } = useLocation();

  if (!available || isActive) return null;

  // Match the most specific step whose route is a prefix of the current path.
  const match = [...ONBOARDING_STEPS]
    .map((s, idx) => ({ s, idx }))
    .filter(({ s }) => pathname.startsWith(s.route))
    .sort((a, b) => b.s.route.length - a.s.route.length)[0];

  if (!match) return null;

  const stepNumber = match.idx + 1;
  const total = ONBOARDING_STEPS.length;
  const done = completedIds.includes(match.s.id);

  return (
    <button
      type="button"
      onClick={() => startStep(match.s.id)}
      aria-label={`Démarrer l'aide pour cette page (étape ${stepNumber} sur ${total})`}
      className="fixed bottom-24 right-3 z-[9998] flex items-center gap-1.5 rounded-full border bg-popover/95 text-popover-foreground shadow-lg px-3 py-2 text-xs font-medium backdrop-blur hover:bg-accent hover:text-accent-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:bottom-6"
    >
      <HelpCircle className="h-4 w-4 text-primary" aria-hidden="true" />
      <span>
        Aide ({stepNumber}/{total}){done ? ' ✓' : ''}
      </span>
    </button>
  );
}