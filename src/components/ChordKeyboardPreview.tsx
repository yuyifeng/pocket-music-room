import type { CSSProperties } from "react";
import { createPianoNotes, type PianoNote } from "../domain/music";

interface ChordKeyboardPreviewProps {
  chordNotes: PianoNote[];
  activeNotes: ReadonlySet<number>;
}

const PREVIEW_NOTES = createPianoNotes(60, 83);
const WHITE_KEY_COUNT = PREVIEW_NOTES.filter((note) => !note.isBlack).length;

export function ChordKeyboardPreview({
  chordNotes,
  activeNotes,
}: ChordKeyboardPreviewProps) {
  const chordMidi = new Set(chordNotes.map((note) => note.midi));
  let whiteKeysBefore = 0;
  const positionedNotes = PREVIEW_NOTES.map((note) => {
    const position = whiteKeysBefore;
    if (!note.isBlack) {
      whiteKeysBefore += 1;
    }
    return { note, position };
  });

  const renderKey = (note: PianoNote, style?: CSSProperties) => {
    const isChordNote = chordMidi.has(note.midi);
    return (
      <span
        key={note.midi}
        className={[
          "preview-key",
          `preview-key--${note.isBlack ? "black" : "white"}`,
          isChordNote ? "is-chord-note" : "",
          activeNotes.has(note.midi) ? "is-sounding" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={style}
        aria-label={`${note.name}${isChordNote ? "，和弦组成音" : ""}`}
      >
        {isChordNote && <b>{note.pitchClass}</b>}
      </span>
    );
  };

  return (
    <div
      className="chord-keyboard-preview"
      role="img"
      aria-label="当前和弦琴键示意"
    >
      <div className="preview-white-keys">
        {positionedNotes
          .filter(({ note }) => !note.isBlack)
          .map(({ note }) => renderKey(note))}
      </div>
      <div className="preview-black-keys">
        {positionedNotes
          .filter(({ note }) => note.isBlack)
          .map(({ note, position }) =>
            renderKey(note, {
              left: `${(position / WHITE_KEY_COUNT) * 100}%`,
            }),
          )}
      </div>
    </div>
  );
}
