export function resolveApiUrl(value: string | undefined, development: boolean, fallback: string): string | null {
  const input = value?.trim() || (development ? fallback : '');
  if (!input) return null;
  try {
    const url = new URL(input);
    if (url.username || url.password || url.search || url.hash) return null;
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, '');
    const local = host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') ||
      host === '::1' || host === '0.0.0.0' || /^127\./.test(host) || /^10\./.test(host) ||
      /^192\.168\./.test(host) || /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
      /^169\.254\./.test(host) || (host.includes(':') && /^(fc|fd|fe80:)/.test(host));
    if (!development && (url.protocol !== 'https:' || local)) return null;
    return url.toString().replace(/\/+$/, '');
  } catch { return null; }
}
