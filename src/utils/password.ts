import { getRandomBytes } from 'expo-crypto';
function randomIndex(limit: number): number {
  const max = 256 - (256 % limit);
  let byte: number;
  do { byte = getRandomBytes(1)[0]; } while (byte >= max);
  return byte % limit;
}
export function createPassword(): string {
  const groups = ['ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz', '0123456789', '!@#$%^&*'];
  const all = groups.join('');
  const chars = groups.map((group) => group[randomIndex(group.length)]);
  while (chars.length < 16) chars.push(all[randomIndex(all.length)]);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}
