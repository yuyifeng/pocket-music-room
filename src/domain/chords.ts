import {
  PITCH_CLASSES,
  midiToNote,
  type NoteName,
  type PianoNote,
} from "./music";

export const CHORD_ROOTS = PITCH_CLASSES;

export type ChordTypeId =
  | "major"
  | "minor"
  | "diminished"
  | "augmented"
  | "sus2"
  | "sus4"
  | "dominant7"
  | "major7"
  | "minor7";

export interface ChordType {
  id: ChordTypeId;
  label: string;
  shortLabel: string;
  symbolSuffix: string;
  intervals: readonly number[];
}

export interface Chord {
  root: NoteName;
  type: ChordType;
  displayName: string;
  symbol: string;
  notes: PianoNote[];
}

export type CommonChordKey = "C" | "G";
export type CommonChordVoicing = "triad" | "seventh";

export interface CommonChordPreset {
  degree: "I" | "ii" | "iii" | "IV" | "V" | "vi";
  root: NoteName;
  typeId: Extract<
    ChordTypeId,
    "major" | "minor" | "dominant7" | "major7" | "minor7"
  >;
}

export const CHORD_TYPES: readonly ChordType[] = [
  {
    id: "major",
    label: "大三和弦",
    shortLabel: "Major",
    symbolSuffix: "",
    intervals: [0, 4, 7],
  },
  {
    id: "minor",
    label: "小三和弦",
    shortLabel: "Minor",
    symbolSuffix: "m",
    intervals: [0, 3, 7],
  },
  {
    id: "diminished",
    label: "减三和弦",
    shortLabel: "Diminished",
    symbolSuffix: "dim",
    intervals: [0, 3, 6],
  },
  {
    id: "augmented",
    label: "增三和弦",
    shortLabel: "Augmented",
    symbolSuffix: "aug",
    intervals: [0, 4, 8],
  },
  {
    id: "sus2",
    label: "挂二和弦",
    shortLabel: "Sus2",
    symbolSuffix: "sus2",
    intervals: [0, 2, 7],
  },
  {
    id: "sus4",
    label: "挂四和弦",
    shortLabel: "Sus4",
    symbolSuffix: "sus4",
    intervals: [0, 5, 7],
  },
  {
    id: "dominant7",
    label: "属七和弦",
    shortLabel: "Dominant 7",
    symbolSuffix: "7",
    intervals: [0, 4, 7, 10],
  },
  {
    id: "major7",
    label: "大七和弦",
    shortLabel: "Major 7",
    symbolSuffix: "maj7",
    intervals: [0, 4, 7, 11],
  },
  {
    id: "minor7",
    label: "小七和弦",
    shortLabel: "Minor 7",
    symbolSuffix: "m7",
    intervals: [0, 3, 7, 10],
  },
] as const;

export const COMMON_CHORDS_BY_KEY: Record<
  CommonChordKey,
  readonly CommonChordPreset[]
> = {
  C: [
    { degree: "I", root: "C", typeId: "major" },
    { degree: "ii", root: "D", typeId: "minor" },
    { degree: "iii", root: "E", typeId: "minor" },
    { degree: "IV", root: "F", typeId: "major" },
    { degree: "V", root: "G", typeId: "major" },
    { degree: "vi", root: "A", typeId: "minor" },
  ],
  G: [
    { degree: "I", root: "G", typeId: "major" },
    { degree: "ii", root: "A", typeId: "minor" },
    { degree: "iii", root: "B", typeId: "minor" },
    { degree: "IV", root: "C", typeId: "major" },
    { degree: "V", root: "D", typeId: "major" },
    { degree: "vi", root: "E", typeId: "minor" },
  ],
};

export const COMMON_SEVENTH_CHORDS_BY_KEY: Record<
  CommonChordKey,
  readonly CommonChordPreset[]
> = {
  C: [
    { degree: "I", root: "C", typeId: "major7" },
    { degree: "ii", root: "D", typeId: "minor7" },
    { degree: "iii", root: "E", typeId: "minor7" },
    { degree: "IV", root: "F", typeId: "major7" },
    { degree: "V", root: "G", typeId: "dominant7" },
    { degree: "vi", root: "A", typeId: "minor7" },
  ],
  G: [
    { degree: "I", root: "G", typeId: "major7" },
    { degree: "ii", root: "A", typeId: "minor7" },
    { degree: "iii", root: "B", typeId: "minor7" },
    { degree: "IV", root: "C", typeId: "major7" },
    { degree: "V", root: "D", typeId: "dominant7" },
    { degree: "vi", root: "E", typeId: "minor7" },
  ],
};

export const COMMON_CHORDS_BY_VOICING: Record<
  CommonChordVoicing,
  Record<CommonChordKey, readonly CommonChordPreset[]>
> = {
  triad: COMMON_CHORDS_BY_KEY,
  seventh: COMMON_SEVENTH_CHORDS_BY_KEY,
};

export function getChordType(id: ChordTypeId): ChordType {
  const chordType = CHORD_TYPES.find((type) => type.id === id);
  if (!chordType) {
    throw new RangeError(`Unknown chord type: ${id}`);
  }
  return chordType;
}

export function buildChord(root: NoteName, typeId: ChordTypeId): Chord {
  const rootIndex = CHORD_ROOTS.indexOf(root);
  if (rootIndex < 0) {
    throw new RangeError(`Unknown chord root: ${root}`);
  }

  const type = getChordType(typeId);
  const rootMidi = 60 + rootIndex;
  const notes = type.intervals.map((interval, index) => ({
    index,
    ...midiToNote(rootMidi + interval),
  }));

  return {
    root,
    type,
    displayName: `${root} ${type.shortLabel}`,
    symbol: `${root}${type.symbolSuffix}`,
    notes,
  };
}
