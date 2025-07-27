// Utility to format Kenyan phone numbers to 2547XXXXXXXX
export function formatPhone(phone: string): string {
  let p = phone.trim();
  if (p.startsWith('0') && p.length === 10) return '254' + p.slice(1);
  if (p.startsWith('7') && p.length === 9) return '254' + p;
  if (p.startsWith('+254')) return p.slice(1);
  if (p.startsWith('254') && p.length === 12) return p;
  return p;
}
