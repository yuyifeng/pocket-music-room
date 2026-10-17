import { describe, expect, it } from "vitest";
import {
  CHORD_ROOTS,
  CHORD_TYPES,
  COMMON_CHORDS_BY_KEY,
  COMMON_SEVENTH_CHORDS_BY_KEY,
  buildChord,
} from "./chords";

describe("chord domain", () => {
  it("defines the nine approved chord formulas", () => {
    expect(
      Object.fromEntries(
        CHORD_TYPES.map((type) => [type.id, [...type.intervals]]),
      ),
    ).toEqual({
      major: [0, 4, 7],
      minor: [0, 3, 7],
      diminished: [0, 3, 6],
      augmented: [0, 4, 8],
      sus2: [0, 2, 7],
      sus4: [0, 5, 7],
      dominant7: [0, 4, 7, 10],
      major7: [0, 4, 7, 11],
      minor7: [0, 3, 7, 10],
    });
  });

  it("builds all 108 root and type combinations in root position", () => {
    const chords = CHORD_ROOTS.flatMap((root) =>
      CHORD_TYPES.map((type) => buildChord(root, type.id)),
    );

    expect(chords).toHaveLength(108);
    for (const chord of chords) {
      const midiValues = chord.notes.map((note) => note.midi);
      expect(midiValues).toEqual([...midiValues].sort((a, b) => a - b));
      expect(chord.notes[0].pitchClass).toBe(chord.root);
      expect(chord.notes).toHaveLength(chord.type.intervals.length);
    }
  });

  it("moves notes above B4 into the next octave", () => {
    const chord = buildChord("B", "major7");
    expect(chord.notes.map((note) => note.name)).toEqual([
      "B4",
      "D#5",
      "F#5",
      "A#5",
    ]);
  });

  it("provides beginner-facing names, symbols, and note names", () => {
    const major = buildChord("C", "major");
    expect(major.displayName).toBe("C Major");
    expect(major.symbol).toBe("C");
    expect(major.notes.map((note) => note.name)).toEqual(["C4", "E4", "G4"]);

    const minorSeven = buildChord("F#", "minor7");
    expect(minorSeven.displayName).toBe("F# Minor 7");
    expect(minorSeven.symbol).toBe("F#m7");
    expect(minorSeven.notes.map((note) => note.name)).toEqual([
      "F#4",
      "A4",
      "C#5",
      "E5",
    ]);
  });

  it("provides the six common diatonic chords for C and G major", () => {
    const symbolsByKey = Object.fromEntries(
      Object.entries(COMMON_CHORDS_BY_KEY).map(([key, presets]) => [
        key,
        presets.map((preset) =>
          buildChord(preset.root, preset.typeId).symbol,
        ),
      ]),
    );

    expect(symbolsByKey).toEqual({
      C: ["C", "Dm", "Em", "F", "G", "Am"],
      G: ["G", "Am", "Bm", "C", "D", "Em"],
    });
  });

  it("provides the six common diatonic seventh chords for C and G major", () => {
    const symbolsByKey = Object.fromEntries(
      Object.entries(COMMON_SEVENTH_CHORDS_BY_KEY).map(([key, presets]) => [
        key,
        presets.map((preset) =>
          buildChord(preset.root, preset.typeId).symbol,
        ),
      ]),
    );

    expect(symbolsByKey).toEqual({
      C: ["Cmaj7", "Dm7", "Em7", "Fmaj7", "G7", "Am7"],
      G: ["Gmaj7", "Am7", "Bm7", "Cmaj7", "D7", "Em7"],
    });
  });
});
