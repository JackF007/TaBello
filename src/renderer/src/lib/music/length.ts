// Note values (whole, half, quarter…) chosen by hand. The tab is written from the notes' times in the
// recording, so choosing a value means giving the note the length of that value at the piece's
// tempo there, and marking it as chosen (see NoteEvent.exactLength) so it is written as is.
import type { Arrangement, NoteValue, TabBeat } from './arrange';
import type { NoteLocation } from './edit';

/** Length of a written beat in ticks (a quarter note is 12). */
export function beatTicks(beat: Pick<TabBeat, 'value' | 'dotted' | 'tuplet'>): number {
  return (48 / beat.value) * (beat.dotted ? 1.5 : 1) * (beat.tuplet ? 2 / 3 : 1);
}

export interface NoteSpan {
  /** Ticks written for the note now, ties included. */
  length: number;
  /** Ticks until the next note of its voice starts (or the end of the piece): the longest it can be. */
  room: number;
  /** Where the note starts: its bar, and ticks into that bar. */
  bar: number;
  tick: number;
}

const voiceOf = (arrangement: Arrangement, location: NoteLocation) =>
  location.voice === 1 && arrangement.bass ? arrangement.bass : arrangement.bars;

/** How long the note at `location` is written, and how long it could be. */
export function noteSpan(arrangement: Arrangement, location: NoteLocation): NoteSpan | null {
  const bars = voiceOf(arrangement, location);
  const first = bars[location.bar]?.[location.beat];
  const note = first?.notes.find((n) => n.string === location.string);
  if (!first || !note) return null;
  const tick = bars[location.bar].slice(0, location.beat).reduce((sum, beat) => sum + beatTicks(beat), 0);
  let length = beatTicks(first);
  let room = length;
  let held = true;
  for (let bar = location.bar, beat = location.beat + 1; bar < bars.length; bar++, beat = 0) {
    for (; beat < bars[bar].length; beat++) {
      const next = bars[bar][beat];
      const ticks = beatTicks(next);
      const continues = next.notes.some((n) => n.tied && n.pitch === note.pitch && n.string === note.string);
      if (held && continues) {
        length += ticks;
        room += ticks;
        continue;
      }
      held = false;
      if (next.notes.some((n) => !n.tied)) return { length, room, bar: location.bar, tick };
      room += ticks;
    }
  }
  return { length, room, bar: location.bar, tick };
}

/** The time in the recording, in seconds, of a point given in ticks from the start of a bar. */
export function tickTime(arrangement: Arrangement, bar: number, tick: number): number {
  const { bars, barTimes } = arrangement;
  const barLength = (b: number) => bars[b]?.reduce((sum, beat) => sum + beatTicks(beat), 0) ?? 0;
  // Walk into the following bars when the tick goes past this one.
  while (bar < bars.length - 1 && tick >= barLength(bar) && barLength(bar) > 0) {
    tick -= barLength(bar);
    bar++;
  }
  const start = barTimes[bar];
  const end = barTimes[bar + 1] ?? start + (barTimes[bar] - (barTimes[bar - 1] ?? start - 1));
  const length = barLength(bar) || 1;
  return start + ((end - start) * tick) / length;
}

export interface ValueChoice {
  value: NoteValue;
  dotted: boolean;
  ticks: number;
  name: string;
  /** The British name, as many musicians say it. */
  british: string;
}

const VALUES: { value: NoteValue; name: string; british: string }[] = [
  { value: 1, name: 'Whole note', british: 'semibreve' },
  { value: 2, name: 'Half note', british: 'minim' },
  { value: 4, name: 'Quarter note', british: 'crotchet' },
  { value: 8, name: 'Eighth note', british: 'quaver' },
  { value: 16, name: 'Sixteenth note', british: 'semiquaver' },
];

/** The note values that can be chosen, plain or dotted. */
export function valueChoices(dotted: boolean): ValueChoice[] {
  return VALUES.map((v) => ({ ...v, dotted, ticks: (48 / v.value) * (dotted ? 1.5 : 1), name: dotted ? `Dotted ${v.name.toLowerCase()}` : v.name }));
}

/** Whether a length in ticks is the one of a value (plain or dotted). */
export function matchesValue(length: number, choice: Pick<ValueChoice, 'ticks'>): boolean {
  return Math.abs(length - choice.ticks) < 1e-6;
}
