import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
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

  const dialogRef = useRef<HTMLDivElement | null>(null);
  const nextBtnRef = useRef<HTMLButtonElement | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descId = useId();

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

  // Save / restore focus when the tutorial opens & closes
  useEffect(() => {
    if (!isActive) return;
    lastFocusedRef.current = document.activeElement as HTMLElement | null;
    return () => {
      const prev = lastFocusedRef.current;
      if (prev && typeof prev.focus === 'function' && document.contains(prev)) {
        prev.focus();
      }
    };
  }, [isActive]);

  // Keyboard: ESC to skip. We intentionally do NOT trap focus, so the user
  // can interact with the highlighted element on the page.
  useEffect(() => {
    if (!isActive) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        skip();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isActive, skip]);

  if (!isActive || !step) return null;

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  const tooltipStyle: React.CSSProperties = {
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
    tooltipStyle.bottom = 16;
    tooltipStyle.left = 12;
    tooltipStyle.right = 12;
    tooltipStyle.width = 'auto';
    tooltipStyle.maxWidth = '100%';
  }

  const totalSteps = ONBOARDING_STEPS.length;
  const isLast = currentIndex === totalSteps - 1;
  const stepProgressLabel = `Étape ${currentIndex + 1} sur ${totalSteps}`;

  // Spotlight cutout dimensions
  const cut = rect
    ? {
        top: Math.max(0, rect.top - PADDING),
        left: Math.max(0, rect.left - PADDING),
        width: rect.width + PADDING * 2,
        height: rect.height + PADDING * 2,
      }
    : null;

  return createPortal(
    <div className="pointer-events-none">
      {/* Polite live region announces step changes for assistive tech */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {`${stepProgressLabel} : ${step.title}. ${step.description}`}
      </div>

      {/* Backdrop split into 4 panels around the spotlight so the cutout is
          natively clickable (no clip-path event blocking). */}
      {cut ? (
        <>
          <div
            aria-hidden="true"
            className="fixed left-0 right-0 top-0 z-[10000] bg-black/55"
            style={{ height: cut.top }}
          />
          <div
            aria-hidden="true"
            className="fixed left-0 z-[10000] bg-black/55"
            style={{ top: cut.top, height: cut.height, width: cut.left }}
          />
          <div
            aria-hidden="true"
            className="fixed right-0 z-[10000] bg-black/55"
            style={{
              top: cut.top,
              height: cut.height,
              left: cut.left + cut.width,
            }}
          />
          <div
            aria-hidden="true"
            className="fixed left-0 right-0 bottom-0 z-[10000] bg-black/55"
            style={{ top: cut.top + cut.height }}
          />
        </>
      ) : (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-[10000] pointer-events-auto bg-black/55 backdrop-blur-[2px]"
        />
      )}

      {/* Spotlight ring */}
      {rect && (
        <div
          aria-hidden="true"
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
        ref={dialogRef}
        role="dialog"
        aria-modal="false"
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
        style={tooltipStyle}
        className="pointer-events-auto rounded-xl border bg-popover text-popover-foreground shadow-2xl p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <p
          className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
          aria-label={stepProgressLabel}
        >
          Étape {currentIndex + 1} / {totalSteps}
        </p>
        <h3 id={titleId} className="text-base font-semibold mt-1">
          {step.title}
        </h3>
        <p id={descId} className="text-sm text-muted-foreground mt-1.5">
          {step.description}
        </p>
        {rect && (
          <p className="mt-2 text-xs font-medium text-primary">
            👉 Clique sur l'élément encadré pour continuer.
          </p>
        )}

        {missing && !rect && (
          <div className="mt-3 rounded-md bg-muted/60 p-2 text-xs">
            Cet élément n'est pas visible sur la page actuelle.
            <button
              type="button"
              onClick={() => navigate(withPreviewToken(step.route))}
              className="ml-1 font-medium text-primary underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              aria-label={`Aller à la page ${step.label}`}
            >
              Y aller
            </button>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={skip}
            aria-label="Passer le tutoriel d'accueil et fermer cette fenêtre"
          >
            Passer
          </Button>
          <Button
            ref={nextBtnRef}
            size="sm"
            variant="outline"
            onClick={next}
            aria-label={
              isLast
                ? 'Terminer le tutoriel'
                : `Passer à l'étape ${currentIndex + 2} sur ${totalSteps}`
            }
          >
            {isLast ? 'Terminer' : 'Ignorer cette étape'}
          </Button>
        </div>
        <p className="sr-only">Appuyez sur Échap pour passer le tutoriel.</p>
      </div>
    </div>,
    document.body,
  );
}