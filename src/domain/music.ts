export const PITCH_CLASSES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;

export type NoteName = (typeof PITCH_CLASSES)[number];

export interface PianoNote {
  index: number;
  midi: number;
  name: string;
  pitchClass: NoteName;
  octave: number;
  isBlack: boolean;
  frequency: number;
}

export interface SampleAnchor {
  midi: number;
  name: string;
  fileName: string;
}

export interface SampleMapping {
  anchor: SampleAnchor;
  semitoneOffset: number;
  playbackRate: number;
}

const BLACK_KEY_NAMES = new Set<NoteName>(["C#", "D#", "F#", "G#", "A#"]);

export const PIANO_START_MIDI = 48;
export const PIANO_END_MIDI = 83;

export const SAMPLE_ANCHORS: readonly SampleAnchor[] = [
  { midi: 48, name: "C3", fileName: "C3.mp3" },
  { midi: 51, name: "D#3", fileName: "Ds3.mp3" },
  { midi: 54, name: "F#3", fileName: "Fs3.mp3" },
  { midi: 57, name: "A3", fileName: "A3.mp3" },
  { midi: 60, name: "C4", fileName: "C4.mp3" },
  { midi: 63, name: "D#4", fileName: "Ds4.mp3" },
  { midi: 66, name: "F#4", fileName: "Fs4.mp3" },
  { midi: 69, name: "A4", fileName: "A4.mp3" },
  { midi: 72, name: "C5", fileName: "C5.mp3" },
  { midi: 75, name: "D#5", fileName: "Ds5.mp3" },
  { midi: 78, name: "F#5", fileName: "Fs5.mp3" },
  { midi: 81, name: "A5", fileName: "A5.mp3" },
  { midi: 84, name: "C6", fileName: "C6.mp3" },
] as const;

export function midiToNote(midi: number): Omit<PianoNote, "index"> {
  if (!Number.isInteger(midi) || midi < 0 || midi > 127) {
    throw new RangeError(`MIDI note must be an integer from 0 to 127: ${midi}`);
  }

  const pitchClass = PITCH_CLASSES[midi % 12];
  const octave = Math.floor(midi / 12) - 1;

  return {
    midi,
    name: `${pitchClass}${octave}`,
    pitchClass,
    octave,
    isBlack: BLACK_KEY_NAMES.has(pitchClass),
    frequency: 440 * 2 ** ((midi - 69) / 12),
  };
}

export function noteNameToMidi(name: string): number {
  const match = /^([A-G])(#?)(-1|[0-9])$/.exec(name);
  if (!match) {
    throw new RangeError(`Invalid sharp note name: ${name}`);
  }

  const pitchClass = `${match[1]}${match[2]}` as NoteName;
  const pitchIndex = PITCH_CLASSES.indexOf(pitchClass);
  if (pitchIndex < 0) {
    throw new RangeError(`Invalid sharp note name: ${name}`);
  }

  const midi = (Number(match[3]) + 1) * 12 + pitchIndex;
  if (midi < 0 || midi > 127) {
    throw new RangeError(`Note is outside the MIDI range: ${name}`);
  }
  return midi;
}

export function createPianoNotes(
  startMidi = PIANO_START_MIDI,
  endMidi = PIANO_END_MIDI,
): PianoNote[] {
  if (startMidi > endMidi) {
    throw new RangeError("Piano start MIDI must not exceed end MIDI");
  }

  return Array.from({ length: endMidi - startMidi + 1 }, (_, index) => ({
    index,
    ...midiToNote(startMidi + index),
  }));
}

export function getSampleMapping(midi: number): SampleMapping {
  const anchor = SAMPLE_ANCHORS.reduce((nearest, candidate) => {
    const nearestDistance = Math.abs(nearest.midi - midi);
    const candidateDistance = Math.abs(candidate.midi - midi);
    return candidateDistance < nearestDistance ? candidate : nearest;
  });
  const semitoneOffset = midi - anchor.midi;

  return {
    anchor,
    semitoneOffset,
    playbackRate: 2 ** (semitoneOffset / 12),
  };
}

export const PIANO_NOTES = createPianoNotes();
