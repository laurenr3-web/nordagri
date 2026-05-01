/**
 * Helpers d'affichage timezone-locale pour les sessions de temps.
 * Stockage = ISO UTC ; affichage = `Intl.DateTimeFormat('fr-FR')` (timezone navigateur).
 * Aucun composant ne doit imprimer un ISO directement — toujours passer par ces helpers.
 */

const TIME_FMT = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' });
const DATE_FMT = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });

export const formatSessionTime = (iso: string): string => TIME_FMT.format(new Date(iso));
export const formatSessionDate = (iso: string): string => DATE_FMT.format(new Date(iso));

export function formatSessionRange(start: string, end: string | null): string {
  return end
    ? `${formatSessionTime(start)} – ${formatSessionTime(end)}`
    : `${formatSessionTime(start)} – en cours`;
}

export function formatDurationShort(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h${String(m).padStart(2, '0')}`;
  return `${m} min`;
}