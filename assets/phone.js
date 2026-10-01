// Normalize a US phone number to E.164 (+1XXXXXXXXXX). Returns null if it isn't one.
export function normalizePhone(input) {
  if (typeof input !== 'string') return null;
  if (/[a-z]/i.test(input)) return null;
  const digits = input.replace(/\D/g, '');
  if (digits.length === 10) return '+1' + digits;
  if (digits.length === 11 && digits[0] === '1') return '+' + digits;
  return null;
}
