import { describe, expect, it } from "vitest";
import {
  PIANO_NOTES,
  SAMPLE_ANCHORS,
  createPianoNotes,
  getSampleMapping,
  midiToNote,
  noteNameToMidi,
} from "./music";

describe("music domain", () => {
  it("creates the fixed C3-B5 range", () => {
    expect(PIANO_NOTES).toHaveLength(36);
    expect(PIANO_NOTES[0].name).toBe("C3");
    expect(PIANO_NOTES.at(-1)?.name).toBe("B5");
    expect(PIANO_NOTES.filter((note) => note.isBlack)).toHaveLength(15);
    expect(PIANO_NOTES.filter((note) => !note.isBlack)).toHaveLength(21);
  });

  it("converts between MIDI values and sharp note names", () => {
    expect(midiToNote(60)).toMatchObject({
      name: "C4",
      pitchClass: "C",
      octave: 4,
      isBlack: false,
    });
    expect(midiToNote(66)).toMatchObject({
      name: "F#4",
      pitchClass: "F#",
      octave: 4,
      isBlack: true,
    });
    expect(noteNameToMidi("C3")).toBe(48);
    expect(noteNameToMidi("A#5")).toBe(82);
    expect(midiToNote(69).frequency).toBeCloseTo(440);
  });

  it("rejects invalid ranges and note names", () => {
    expect(() => createPianoNotes(72, 60)).toThrow(RangeError);
    expect(() => noteNameToMidi("Bb4")).toThrow(RangeError);
    expect(() => midiToNote(128)).toThrow(RangeError);
  });

  it("maps every piano key to the nearest local sample anchor", () => {
    for (const note of PIANO_NOTES) {
      const mapping = getSampleMapping(note.midi);
      expect(Math.abs(mapping.semitoneOffset)).toBeLessThanOrEqual(2);
      expect(mapping.playbackRate).toBeCloseTo(
        2 ** (mapping.semitoneOffset / 12),
      );
    }

    for (const anchor of SAMPLE_ANCHORS) {
      const mapping = getSampleMapping(anchor.midi);
      expect(mapping.anchor).toEqual(anchor);
      expect(mapping.semitoneOffset).toBe(0);
      expect(mapping.playbackRate).toBe(1);
    }
  });
});
