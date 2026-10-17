import {
  useRef,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { PIANO_NOTES, type PianoNote } from "../domain/music";

interface PianoKeyboardProps {
  activeNotes: ReadonlySet<number>;
  onNoteOn: (voiceId: string, midi: number) => void;
  onNoteOff: (voiceId: string) => void;
}

const WHITE_KEY_COUNT = PIANO_NOTES.filter((note) => !note.isBlack).length;

function pointerVoiceId(pointerId: number): string {
  return `piano-pointer-${pointerId}`;
}

function keyboardVoiceId(midi: number): string {
  return `piano-keyboard-${midi}`;
}

export function PianoKeyboard({
  activeNotes,
  onNoteOn,
  onNoteOff,
}: PianoKeyboardProps) {
  const keyboardRef = useRef<HTMLDivElement>(null);
  const pointerNotes = useRef(new Map<number, number | null>());

  const startPointerNote = (
    event: ReactPointerEvent<HTMLButtonElement>,
    midi: number,
  ) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    pointerNotes.current.set(event.pointerId, midi);
    onNoteOn(pointerVoiceId(event.pointerId), midi);
  };

  const movePointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointerNotes.current.has(event.pointerId)) {
      return;
    }

    const hit = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest<HTMLElement>("[data-midi]");
    const nextMidi =
      hit && keyboardRef.current?.contains(hit)
        ? Number(hit.dataset.midi)
        : null;
    const currentMidi = pointerNotes.current.get(event.pointerId);
    if (currentMidi === nextMidi) {
      return;
    }

    const voiceId = pointerVoiceId(event.pointerId);
    onNoteOff(voiceId);
    pointerNotes.current.set(event.pointerId, nextMidi);
    if (nextMidi !== null) {
      onNoteOn(voiceId, nextMidi);
    }
  };

  const endPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointerNotes.current.has(event.pointerId)) {
      return;
    }
    onNoteOff(pointerVoiceId(event.pointerId));
    pointerNotes.current.delete(event.pointerId);
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    note: PianoNote,
  ) => {
    if ((event.key === " " || event.key === "Enter") && !event.repeat) {
      event.preventDefault();
      onNoteOn(keyboardVoiceId(note.midi), note.midi);
    }
  };

  const handleKeyUp = (
    event: KeyboardEvent<HTMLButtonElement>,
    note: PianoNote,
  ) => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      onNoteOff(keyboardVoiceId(note.midi));
    }
  };

  let whiteKeysBefore = 0;
  const positionedNotes = PIANO_NOTES.map((note) => {
    const position = whiteKeysBefore;
    if (!note.isBlack) {
      whiteKeysBefore += 1;
    }
    return { note, position };
  });

  const renderKey = (note: PianoNote, style?: React.CSSProperties) => (
    <button
      key={note.midi}
      className={`piano-key piano-key--${note.isBlack ? "black" : "white"}`}
      style={style}
      type="button"
      data-midi={note.midi}
      aria-label={`${note.name} 琴键`}
      aria-pressed={activeNotes.has(note.midi)}
      onPointerDown={(event) => startPointerNote(event, note.midi)}
      onKeyDown={(event) => handleKeyDown(event, note)}
      onKeyUp={(event) => handleKeyUp(event, note)}
      onBlur={() => onNoteOff(keyboardVoiceId(note.midi))}
    >
      <span>{note.name}</span>
    </button>
  );

  return (
    <div
      ref={keyboardRef}
      className="piano-keyboard"
      onPointerMove={movePointer}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
    >
      <div className="piano-keyboard__white-keys">
        {positionedNotes
          .filter(({ note }) => !note.isBlack)
          .map(({ note }) => renderKey(note))}
      </div>
      <div className="piano-keyboard__black-keys">
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
