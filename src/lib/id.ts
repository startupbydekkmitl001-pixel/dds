function base36(rand: () => number, length: number): string {
  let out = '';
  for (let i = 0; i < length; i++) out += Math.floor(rand() * 36).toString(36);
  return out;
}

/** `${prefix}_xxxxxxxx` — short random id for records and idempotency keys. */
export function newId(prefix: string, rand: () => number = Math.random): string {
  return `${prefix}_${base36(rand, 8)}`;
}
