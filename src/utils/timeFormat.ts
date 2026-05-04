/**
 * Time-tracking display helpers.
 * Returns durations in the canonical XhYY format (e.g. 0h26, 2h15, 10h05).
 */

export function formatHM(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) ms = 0;
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h}h${String(m).padStart(2, '0')}`;
}

export function formatHMRange(start: string | Date | null | undefined, end?: string | Date | null): string {
  if (!start) return '0h00';
  const startMs = typeof start === 'string' ? Date.parse(start) : start.getTime();
  if (!Number.isFinite(startMs)) return '0h00';
  const endMs = end
    ? (typeof end === 'string' ? Date.parse(end) : end.getTime())
    : Date.now();
  return formatHM(endMs - startMs);
}

export function formatHoursDecimalToHM(hoursDecimal: number): string {
  if (!Number.isFinite(hoursDecimal) || hoursDecimal < 0) hoursDecimal = 0;
  return formatHM(Math.round(hoursDecimal * 3600) * 1000);
}