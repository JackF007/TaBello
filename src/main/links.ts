/** The only pages TaBello opens in the browser: its own on GitHub (reports, releases). */
export function isExternalLink(url: string): boolean {
  try {
    const { protocol, host } = new URL(url);
    return protocol === 'https:' && host === 'github.com';
  } catch {
    return false;
  }
}
