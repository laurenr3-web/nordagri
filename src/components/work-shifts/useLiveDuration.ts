import { useEffect, useState } from 'react';

export function useLiveDuration(startISO: string | null | undefined): number {
  const [seconds, setSeconds] = useState<number>(() => computeSeconds(startISO));

  useEffect(() => {
    if (!startISO) {
      setSeconds(0);
      return;
    }
    setSeconds(computeSeconds(startISO));
    const interval = setInterval(() => setSeconds(computeSeconds(startISO)), 60_000);
    return () => clearInterval(interval);
  }, [startISO]);

  return seconds;
}

function computeSeconds(startISO: string | null | undefined): number {
  if (!startISO) return 0;
  const ms = Date.now() - new Date(startISO).getTime();
  return Math.max(0, Math.floor(ms / 1000));
}

export function formatLiveDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h === 0) return `${m} min`;
  return `${h}h${m.toString().padStart(2, '0')}`;
}
