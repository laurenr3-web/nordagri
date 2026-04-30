import { useEffect, useState } from 'react';

/**
 * Détecte la présence d'un dialog Radix ouvert (modale, sheet, drawer)
 * via `[role="dialog"][data-state="open"]`.
 *
 * - Utilise un MutationObserver scoping `data-state` + childList
 * - Vérifie l'état initial au montage
 * - Cleanup propre (disconnect) au démontage
 * - Pas de timer (setTimeout/setInterval)
 */
export function useHasOpenDialog(): boolean {
  const [hasOpenDialog, setHasOpenDialog] = useState<boolean>(false);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const check = (): void => {
      const found = document.querySelector(
        '[role="dialog"][data-state="open"]',
      );
      setHasOpenDialog(found !== null);
    };

    // État initial
    check();

    const observer = new MutationObserver(() => {
      check();
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['data-state'],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return hasOpenDialog;
}