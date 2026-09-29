/**
 * The app's single source of "now". Everything that needs the current time
 * reads it here so tests (and demos) can pin the clock.
 */
let override: (() => Date) | null = null;

export function now(): Date {
  return override ? override() : new Date();
}

/** Tests only: pin the clock, or pass null to restore real time. */
export function setClock(fn: (() => Date) | null): void {
  override = fn;
}

const pad2 = (n: number) => String(n).padStart(2, '0');

/** Local calendar date as `YYYY-MM-DD`. */
export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
