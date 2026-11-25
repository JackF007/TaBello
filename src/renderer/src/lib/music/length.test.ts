import { describe, expect, it } from 'vitest';
import type { NoteEvent } from '../../../../shared/ipc';
import { INSTRUMENTS } from '../../../../shared/instruments';
import { arrange, type ArrangeOptions } from './arrange';
import { applyEdit, findNote, type NoteLocation } from './edit';
import { beatTicks, matchesValue, noteSpan, tickTime, valueChoices } from './length';

const guitar = INSTRUMENTS.guitar;
const options: ArrangeOptions = { tuning: guitar.tunings[0].strings, frets: guitar.frets, bpm: 120, offset: 0 };
const context = { tuning: guitar.tunings[0].strings, capo: 0, frets: guitar.frets };
const note = (start: number, pitch: number, duration: number): NoteEvent => ({ start, duration, pitch, velocity: 0.8 });

/** The first note's location, and the note there. */
const first = (notes: NoteEvent[]) => {
  const tab = arrange(notes, options);
  const beat = tab.bars[0].findIndex((b) => b.notes.length > 0);
  const location: NoteLocation = { bar: 0, beat, string: tab.bars[0][beat].notes[0].string };
  return { tab, location, placed: findNote(tab, location)! };
};

/** The written rhythm of bar `bar`: values, with an r for rests. */
const rhythm = (notes: NoteEvent[], bar = 0) =>
  arrange(notes, options).bars[bar].map((b) => `${b.notes.length ? '' : 'r'}${b.value}${b.dotted ? '.' : ''}`).join(' ');

describe('note values', () => {
  it('measures how long a note is written and how long it could be', () => {
    // At 120 BPM a bar of 4/4 lasts 2 s: a note ringing almost to the next bar is a whole note.
    const whole = first([note(0, 64, 1.9), note(2, 67, 0.4)]);
    expect(noteSpan(whole.tab, whole.location)).toMatchObject({ length: 48, room: 48, bar: 0, tick: 0 });
    // Followed by a note half a bar later: a half note, with room for a half note.
    const half = first([note(0, 64, 0.9), note(1, 67, 0.4)]);
    expect(noteSpan(half.tab, half.location)).toMatchObject({ length: 24, room: 24 });
  });

  it('times a point of the score in the recording', () => {
    const { tab } = first([note(0, 64, 1.9), note(2, 67, 0.4)]);
    expect(tickTime(tab, 0, 0)).toBeCloseTo(0);
    expect(tickTime(tab, 0, 24)).toBeCloseTo(1);
    // Past the end of a bar: into the next one.
    expect(tickTime(tab, 0, 60)).toBeCloseTo(2.5);
  });

  it('writes a note with the value chosen, and a rest after it', () => {
    const notes = [note(0, 64, 1.9), note(2, 67, 0.4)];
    expect(rhythm(notes)).toBe('1');
    const { tab, location, placed } = first(notes);
    // A half note: the note ends half a bar in.
    const result = applyEdit(notes, placed, location, { type: 'length', end: tickTime(tab, 0, 24) }, context)!;
    expect(result.notes[0]).toMatchObject({ duration: 1, exactLength: true });
    expect(rhythm(result.notes)).toBe('2 r2');
  });

  it('keeps a short value chosen by hand, where a detected one would ring on', () => {
    // Two quarter notes; the first detected short, as plucked notes often are, is held on to the next.
    const notes = [note(0, 64, 0.2), note(0.5, 67, 0.4), note(1, 69, 0.9)];
    expect(rhythm(notes).startsWith('4 4')).toBe(true);
    const { tab, location, placed } = first(notes);
    const eighth = applyEdit(notes, placed, location, { type: 'length', end: tickTime(tab, 0, 6) }, context)!;
    expect(rhythm(eighth.notes).startsWith('8 r8 4')).toBe(true);
  });

  it('offers plain and dotted values, and recognizes them', () => {
    expect(valueChoices(false).map((v) => v.ticks)).toEqual([48, 24, 12, 6, 3]);
    expect(valueChoices(true).map((v) => v.ticks)).toEqual([72, 36, 18, 9, 4.5]);
    expect(valueChoices(true)[1].name).toBe('Dotted half note');
    expect(matchesValue(beatTicks({ value: 2, dotted: true, tuplet: false }), valueChoices(true)[1])).toBe(true);
  });

  it('does not end a note before it starts', () => {
    const notes = [note(1, 64, 0.5)];
    const { location, placed } = first(notes);
    expect(applyEdit(notes, placed, location, { type: 'length', end: 0.5 }, context)).toBeNull();
  });
});
