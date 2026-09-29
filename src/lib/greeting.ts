/** Time-of-day greeting shown on Home. */
export function greetingFor(d: Date): string {
  const h = d.getHours();
  if (h >= 5 && h < 12) return 'สวัสดีตอนเช้า';
  if (h >= 12 && h < 17) return 'สวัสดีตอนบ่าย';
  if (h >= 17 && h < 21) return 'สวัสดีตอนเย็น';
  return 'สวัสดี';
}
