import type { AppAlert } from '@/data/types';

/**
 * The alert to announce as a toast: a new, unread alert at the head of the inbox.
 * `prevHeadId` undefined means "not initialised yet" (first mount) — stay quiet.
 */
export function nextToastAlert(prevHeadId: string | null | undefined, alerts: AppAlert[]): AppAlert | null {
  if (prevHeadId === undefined) return null;
  const head = alerts[0];
  if (!head || head.id === prevHeadId || head.read) return null;
  return head;
}
