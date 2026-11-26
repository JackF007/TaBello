import { describe, expect, it } from 'vitest';
import { REPORT_URL } from '../shared/ipc';
import { isExternalLink } from './links';

describe('links opened in the browser', () => {
  it("opens TaBello's GitHub pages", () => {
    expect(isExternalLink(REPORT_URL)).toBe(true);
    expect(isExternalLink('https://github.com/JackF007/taBello/releases/tag/v0.1.0')).toBe(true);
  });

  it('opens nothing else', () => {
    for (const url of [
      'https://example.com/malware',
      'http://github.com/JackF007/taBello',
      'https://github.com.evil.example/x',
      'https://evil.example/?https://github.com/',
      'file:///C:/Windows/System32/calc.exe',
      'javascript:alert(1)',
      'not a url',
    ]) {
      expect(isExternalLink(url)).toBe(false);
    }
  });
});
