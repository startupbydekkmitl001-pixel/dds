import type { AppAlert } from '@/data/types';
import { nextToastAlert } from '@/features/notifications/arrivals';

const alert = (id: string, read = false): AppAlert => ({
  id,
  kind: 'topup',
  title: `t-${id}`,
  body: '',
  at: '2026-09-29T02:00:00.000Z',
  read,
  link: '/wallet',
});

test('a new unread alert at the head is announced', () => {
  expect(nextToastAlert('a', [alert('b'), alert('a')])).toMatchObject({ id: 'b' });
});

test('an unchanged head is not announced again', () => {
  expect(nextToastAlert('a', [alert('a')])).toBeNull();
});

test('muted (already read) alerts stay quiet', () => {
  expect(nextToastAlert('a', [alert('b', true), alert('a')])).toBeNull();
});

test('empty inbox and first mount are quiet', () => {
  expect(nextToastAlert(null, [])).toBeNull();
  expect(nextToastAlert(undefined, [alert('a')])).toBeNull();
});
