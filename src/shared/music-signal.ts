// Tells apart a real transcription from a file that is not music (speech, noise, silence, an image
// or document the user picked by mistake). It looks only at the detected notes, so the same check
// guards the result in the worker and warns on the project page.
//
// Measured on synthetic inputs run through the real detector: silence, white and pink noise, a hum,
// band-passed "voice-like" noise and fast "babble" all give 0 notes (white noise once gave 1); a
// held, sung note gives ~6, a slow arpeggio ~24, a strum ~36. So the clear line is "almost no
// notes", and the check must stay well below a slow melody (never reject real music).

/** The least a note needs for this check: when it starts and how long it lasts, in seconds. */
export interface NoteSpan {
  start: number;
  duration: number;
}

export type MusicSignal =
  /** A plausible transcription. */
  | 'ok'
  /** Nothing musical was found: not worth a project. */
  | 'none'
  /** A handful of notes, scattered or very sparse: probably not a clear recording of an instrument. */
  | 'thin';

/** Below this many notes there is nothing to transcribe (0, or the odd stray note from noise). */
const MIN_NOTES = 2;
/** Fewer notes than this, whatever the length, is thin (a held note alone comes out as ~6). */
const FEW_NOTES = 5;
/** On a recording longer than this, notes rarer than THIN_DENSITY per second are thin. */
const LONG_SECONDS = 30;
/** Notes per second (over the whole recording) below which a long recording looks like stray notes. */
const THIN_DENSITY = 0.12;

/**
 * How much the detected notes look like music, from their count and how densely they fill the
 * recording. Never answers 'none' or 'thin' for anything a slow melody could produce.
 */
export function assessNotes(notes: readonly NoteSpan[], durationSeconds: number): MusicSignal {
  if (notes.length < MIN_NOTES) return 'none';
  const density = notes.length / Math.max(durationSeconds, 1);
  if (notes.length < FEW_NOTES) return 'thin';
  if (durationSeconds > LONG_SECONDS && density < THIN_DENSITY) return 'thin';
  return 'ok';
}
