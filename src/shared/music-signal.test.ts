import { describe, expect, it } from 'vitest';
import { assessNotes, type NoteSpan } from './music-signal';

/** `count` notes spread evenly over `seconds`. */
const notes = (count: number, seconds: number): NoteSpan[] =>
  Array.from({ length: count }, (_, i) => ({ start: (i / Math.max(count, 1)) * seconds, duration: 0.3 }));

describe('assessNotes', () => {
  it('finds nothing in silence or near silence', () => {
    expect(assessNotes([], 12)).toBe('none');
    expect(assessNotes(notes(1, 12), 12)).toBe('none'); // a stray note from noise
  });

  it('calls a handful of notes thin', () => {
    expect(assessNotes(notes(2, 12), 12)).toBe('thin');
    expect(assessNotes(notes(4, 12), 12)).toBe('thin');
  });

  it('calls a long recording with only a few scattered notes thin', () => {
    // A ten-minute talky video that yields a dozen stray notes.
    expect(assessNotes(notes(12, 600), 600)).toBe('thin');
  });

  it('accepts a held or sung note and real playing', () => {
    // A single sustained note comes out as ~6 fragments: still music, not thin.
    expect(assessNotes(notes(6, 12), 12)).toBe('ok');
    // A slow three-minute solo, well under a note a second, is fine.
    expect(assessNotes(notes(90, 180), 180)).toBe('ok');
    // A busy strum.
    expect(assessNotes(notes(36, 12), 12)).toBe('ok');
  });
});
