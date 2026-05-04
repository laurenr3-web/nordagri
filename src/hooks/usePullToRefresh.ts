import { useEffect, useRef, useState, useCallback } from 'react';

export type PullState = 'idle' | 'pulling' | 'ready' | 'refreshing' | 'done';

interface Options {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  disabled?: boolean;
}

const isInteractiveTarget = (el: EventTarget | null): boolean => {
  if (!(el instanceof Element)) return false;
  if (
    el.closest(
      'input, textarea, select, button[aria-haspopup], [contenteditable="true"], ' +
        '[role="dialog"], [role="alertdialog"], [role="menu"], [role="listbox"], [role="combobox"], ' +
        '[data-radix-scroll-area-viewport], [data-vaul-drawer], [data-state="open"][data-side]',
    )
  ) {
    return true;
  }
  // Avoid hijacking nested scrollable containers
  let node: Element | null = el;
  while (node && node !== document.body) {
    const style = window.getComputedStyle(node);
    const oy = style.overflowY;
    if ((oy === 'auto' || oy === 'scroll') && node.scrollHeight > node.clientHeight && node.scrollTop > 0) {
      return true;
    }
    node = node.parentElement;
  }
  return false;
};

const hasOpenOverlay = (): boolean => {
  // Radix sets data-state="open" on dialogs, sheets, popovers, dropdowns, drawers
  if (document.querySelector(
    '[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"], ' +
      '[data-radix-popper-content-wrapper], [data-vaul-drawer][data-state="open"], ' +
      '[role="menu"][data-state="open"], [role="listbox"][data-state="open"]'
  )) {
    return true;
  }
  // Body scroll-lock applied by Radix when modal is open
  if (document.body.hasAttribute('data-scroll-locked')) return true;
  // Active text input
  const ae = document.activeElement as HTMLElement | null;
  if (ae) {
    const tag = ae.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || ae.isContentEditable) {
      return true;
    }
  }
  return false;
};

export function usePullToRefresh({ onRefresh, threshold = 80, disabled = false }: Options) {
  const [state, setState] = useState<PullState>('idle');
  const [distance, setDistance] = useState(0);
  const startY = useRef<number | null>(null);
  const startX = useRef<number | null>(null);
  const cancelledRef = useRef(false);
  const refreshingRef = useRef(false);
  const activeRef = useRef(false);
  const distanceRef = useRef(0);
  const onRefreshRef = useRef(onRefresh);
  useEffect(() => { onRefreshRef.current = onRefresh; }, [onRefresh]);

  const reset = useCallback(() => {
    startY.current = null;
    startX.current = null;
    activeRef.current = false;
    cancelledRef.current = false;
    setDistance(0);
  }, []);

  useEffect(() => {
    if (disabled) return;
    if (typeof window === 'undefined') return;
    // Touch only
    if (!('ontouchstart' in window)) return;

    const onTouchStart = (e: TouchEvent) => {
      if (refreshingRef.current) return;
      if (window.scrollY > 0) return;
      if (hasOpenOverlay()) return;
      if (isInteractiveTarget(e.target)) return;
      if (e.touches.length !== 1) return;
      startY.current = e.touches[0].clientY;
      startX.current = e.touches[0].clientX;
      cancelledRef.current = false;
      activeRef.current = true;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!activeRef.current || startY.current === null || startX.current === null) return;
      if (refreshingRef.current) return;
      if (cancelledRef.current) return;
      if (hasOpenOverlay()) {
        cancelledRef.current = true;
        distanceRef.current = 0;
        setDistance(0);
        setState('idle');
        return;
      }
      const dy = e.touches[0].clientY - startY.current;
      const dx = e.touches[0].clientX - startX.current;
      // Cancel on dominant horizontal gesture (swipe-to-postpone, carousel, drawer, etc.)
      if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy)) {
        cancelledRef.current = true;
        distanceRef.current = 0;
        setDistance(0);
        setState('idle');
        return;
      }
      if (dy <= 0) {
        if (distanceRef.current !== 0) {
          distanceRef.current = 0;
          setDistance(0);
        }
        return;
      }
      if (window.scrollY > 0) {
        reset();
        setState('idle');
        return;
      }
      // Resistance curve
      const pulled = Math.min(dy * 0.5, threshold * 1.6);
      distanceRef.current = pulled;
      setDistance(pulled);
      setState(pulled >= threshold ? 'ready' : 'pulling');
    };

    const onTouchEnd = async () => {
      if (!activeRef.current) return;
      const wasReady = !cancelledRef.current && distanceRef.current >= threshold && !hasOpenOverlay();
      activeRef.current = false;
      startY.current = null;
      startX.current = null;
      if (wasReady && !refreshingRef.current) {
        refreshingRef.current = true;
        setState('refreshing');
        setDistance(threshold);
        distanceRef.current = threshold;
        try {
          await onRefreshRef.current();
          setState('done');
        } catch {
          setState('done');
        } finally {
          setTimeout(() => {
            refreshingRef.current = false;
            distanceRef.current = 0;
            setDistance(0);
            setState('idle');
          }, 700);
        }
      } else {
        distanceRef.current = 0;
        cancelledRef.current = false;
        setDistance(0);
        setState('idle');
      }
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [disabled, threshold, reset]);

  return { state, distance, threshold, isRefreshing: state === 'refreshing' };
}