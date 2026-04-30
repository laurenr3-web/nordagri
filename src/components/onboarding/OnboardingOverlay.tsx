import { useEffect, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { withPreviewToken } from '@/utils/previewRouting';
import { useOnboarding } from './OnboardingProvider';
import { ONBOARDING_STEPS } from './steps';

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PADDING = 8;

export function OnboardingOverlay() {
  const { currentIndex, next, skip, isActive } = useOnboarding();
  const step = ONBOARDING_STEPS[currentIndex];
  const navigate = useNavigate();
  const [rect, setRect] = useState<Rect | null>(null);
  const [missing, setMissing] = useState(false);

  // Locate target & follow layout changes
  useLayoutEffect(() => {
    if (!isActive || !step) return;
    let raf = 0;
    let timeoutId: number | undefined;
    let observer: MutationObserver | null = null;

    const update = () => {
      const el = document.querySelector<HTMLElement>(
        `[data-onboarding="${step.target}"]`,
      );
      if (!el) {
        setRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      setMissing(false);
      // Bring into view
      if (r.top < 0 || r.bottom > window.innerHeight) {
        el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    };

    const tick = () => {
      update();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    observer = new MutationObserver(update);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });

    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);

    timeoutId = window.setTimeout(() => {
      const el = document.querySelector<HTMLElement>(
        `[data-onboarding="${step.target}"]`,
      );
      if (!el) setMissing(true);
    }, 1500);

    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [isActive, step]);

  // Reset rect on step change
  useEffect(() => {
    setRect(null);
    setMissing(false);
  }, [currentIndex]);

  if (!isActive || !step) return null;

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  // Compute tooltip position
  let tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 10001,
    maxWidth: 360,
    width: isMobile ? 'calc(100vw - 24px)' : 'min(360px, calc(100vw - 24px))',
  };

  if (rect && !isMobile) {
    const spaceBelow = window.innerHeight - (rect.top + rect.height);
    const placeBelow = spaceBelow > 200 || rect.top < 220;
    tooltipStyle.top = placeBelow
      ? rect.top + rect.height + PADDING + 12
      : Math.max(12, rect.top - 12 - 200);
    tooltipStyle.left = Math.min(
      Math.max(12, rect.left + rect.width / 2 - 180),
      window.innerWidth - 372,
    );
  } else {
    // Mobile or no target: bottom sheet style
    tooltipStyle.bottom = 16;
    tooltipStyle.left = 12;
    tooltipStyle.right = 12;
    tooltipStyle.width = 'auto';
    tooltipStyle.maxWidth = '100%';
  }

  const totalSteps = ONBOARDING_STEPS.length;
  const isLast = currentIndex === totalSteps - 1;

  return createPortal(
    <div className="pointer-events-none">
      {/* Backdrop with spotlight cutout */}
      {rect ? (
        <div
          aria-hidden
          className="fixed inset-0 z-[10000] pointer-events-auto"
          style={{
            background: 'rgba(0, 0, 0, 0.55)',
            clipPath: `polygon(
              0 0, 100% 0, 100% 100%, 0 100%, 0 0,
              ${rect.left - PADDING}px ${rect.top - PADDING}px,
              ${rect.left - PADDING}px ${rect.top + rect.height + PADDING}px,
              ${rect.left + rect.width + PADDING}px ${rect.top + rect.height + PADDING}px,
              ${rect.left + rect.width + PADDING}px ${rect.top - PADDING}px,
              ${rect.left - PADDING}px ${rect.top - PADDING}px
            )`,
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <div
          aria-hidden
          className="fixed inset-0 z-[10000] pointer-events-auto bg-black/55 backdrop-blur-[2px]"
        />
      )}

      {/* Spotlight ring */}
      {rect && (
        <div
          aria-hidden
          className="fixed z-[10000] rounded-xl ring-2 ring-primary ring-offset-2 ring-offset-background animate-pulse"
          style={{
            top: rect.top - PADDING,
            left: rect.left - PADDING,
            width: rect.width + PADDING * 2,
            height: rect.height + PADDING * 2,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Tooltip card */}
      <div
        role="dialog"
        aria-label={step.title}
        style={tooltipStyle}
        className="pointer-events-auto rounded-xl border bg-popover text-popover-foreground shadow-2xl p-4"
      >
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Étape {currentIndex + 1} / {totalSteps}
        </p>
        <h3 className="text-base font-semibold mt-1">{step.title}</h3>
        <p className="text-sm text-muted-foreground mt-1.5">{step.description}</p>

        {missing && !rect && (
          <div className="mt-3 rounded-md bg-muted/60 p-2 text-xs">
            Cet élément n'est pas visible sur la page actuelle.
            <button
              type="button"
              onClick={() => navigate(withPreviewToken(step.route))}
              className="ml-1 font-medium text-primary underline-offset-2 hover:underline"
            >
              Y aller
            </button>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={skip}>
            Passer
          </Button>
          <Button size="sm" onClick={next}>
            {isLast ? 'Terminer' : 'Suivant'}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}