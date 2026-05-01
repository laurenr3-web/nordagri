/**
 * Date utilities that use the LOCAL timezone (not UTC).
 * The planning module uses YYYY-MM-DD strings as canonical "calendar day"
 * identifiers. Using `toISOString()` returns UTC, which shifts the day by
 * -4h/-5h in America (Quebec) and breaks "today" comparisons after ~20:00 local.
 *
 * `localDateStr(d)` returns the calendar date as seen by the user.
 */
export function localDateStr(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayLocal(): string {
  return localDateStr(new Date());
}

export function tomorrowLocal(): string {
  return localDateStr(new Date(Date.now() + 86400000));
}
