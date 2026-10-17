import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Music2 } from "lucide-react";
import {
  COMMON_CHORDS_BY_VOICING,
  buildChord,
  type CommonChordKey,
  type CommonChordPreset,
  type CommonChordVoicing,
} from "../domain/chords";
import { ChordKeyboardPreview } from "./ChordKeyboardPreview";

interface ChordViewProps {
  activeNotes: ReadonlySet<number>;
  onNoteOn: (voiceId: string, midi: number) => void;
  onNoteOff: (voiceId: string) => void;
  onStopAll: () => void;
}

export function ChordView({
  activeNotes,
  onNoteOn,
  onNoteOff,
  onStopAll,
}: ChordViewProps) {
  const [chordKey, setChordKey] = useState<CommonChordKey>("C");
  const [voicing, setVoicing] = useState<CommonChordVoicing>("triad");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [soundingIndex, setSoundingIndex] = useState<number | null>(null);
  const activeVoiceIds = useRef<string[]>([]);
  const releaseTimer = useRef<number | null>(null);
  const playSequence = useRef(0);
  const commonChords = COMMON_CHORDS_BY_VOICING[voicing][chordKey];
  const selectedPreset = commonChords[selectedIndex] ?? commonChords[0];
  const chord = useMemo(
    () => buildChord(selectedPreset.root, selectedPreset.typeId),
    [selectedPreset],
  );

  const clearReleaseTimer = useCallback(() => {
    if (releaseTimer.current !== null) {
      window.clearTimeout(releaseTimer.current);
      releaseTimer.current = null;
    }
  }, []);

  const releaseChord = useCallback(() => {
    clearReleaseTimer();
    for (const voiceId of activeVoiceIds.current) {
      onNoteOff(voiceId);
    }
    activeVoiceIds.current = [];
    setSoundingIndex(null);
  }, [clearReleaseTimer, onNoteOff]);

  const stopChord = useCallback(() => {
    clearReleaseTimer();
    activeVoiceIds.current = [];
    setSoundingIndex(null);
    onStopAll();
  }, [clearReleaseTimer, onStopAll]);

  useEffect(() => stopChord, [stopChord]);

  const changeKey = (nextKey: CommonChordKey) => {
    if (nextKey === chordKey) {
      return;
    }
    stopChord();
    setChordKey(nextKey);
    setSelectedIndex(0);
  };

  const changeVoicing = (nextVoicing: CommonChordVoicing) => {
    if (nextVoicing === voicing) {
      return;
    }
    stopChord();
    setVoicing(nextVoicing);
    setSelectedIndex(0);
  };

  const playChord = (preset: CommonChordPreset, nextIndex: number) => {
    stopChord();
    setSelectedIndex(nextIndex);
    setSoundingIndex(nextIndex);

    const nextChord = buildChord(preset.root, preset.typeId);
    const sequence = playSequence.current + 1;
    playSequence.current = sequence;
    activeVoiceIds.current = nextChord.notes.map((note) => {
      const voiceId = `chord-option-${sequence}-${note.midi}`;
      onNoteOn(voiceId, note.midi);
      return voiceId;
    });
    if (activeVoiceIds.current.length > 0) {
      releaseTimer.current = window.setTimeout(releaseChord, 1100);
    }
  };

  return (
    <section
      className="instrument-view chord-view"
      role="tabpanel"
      aria-label="和弦演奏"
    >
      <aside className="chord-controls">
        <div className="key-selector">
          <span>选择调性</span>
          <div role="group" aria-label="和弦调性">
            {(["C", "G"] as const).map((key) => (
              <button
                key={key}
                type="button"
                aria-pressed={chordKey === key}
                onClick={() => changeKey(key)}
              >
                <strong>{key}</strong>
                <small>{key} 大调</small>
              </button>
            ))}
          </div>
        </div>

        <div className="voicing-selector">
          <span>和弦类型</span>
          <div role="group" aria-label="和弦类型">
            <button
              type="button"
              aria-pressed={voicing === "triad"}
              onClick={() => changeVoicing("triad")}
            >
              三和弦
            </button>
            <button
              type="button"
              aria-pressed={voicing === "seventh"}
              onClick={() => changeVoicing("seventh")}
            >
              七和弦
            </button>
          </div>
        </div>

        <div className="common-chord-selector">
          <div className="common-chord-selector__header">
            <span>常用和弦</span>
            <small>
              {chordKey} Major · {voicing === "triad" ? "Triads" : "7ths"}
            </small>
          </div>
          <div className="common-chord-selector__grid">
            {commonChords.map((preset, index) => {
              const presetChord = buildChord(preset.root, preset.typeId);
              return (
                <button
                  key={`${chordKey}-${preset.degree}`}
                  type="button"
                  aria-pressed={selectedIndex === index}
                  aria-label={`演奏 ${presetChord.symbol} 和弦`}
                  data-sounding={soundingIndex === index ? "true" : undefined}
                  onClick={() => playChord(preset, index)}
                >
                  <strong>{presetChord.symbol}</strong>
                  <span>{preset.degree} 级</span>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      <div className="chord-stage">
        <div className="chord-summary">
          <div className="chord-summary__name">
            <span aria-hidden="true">
              <Music2 size={19} />
            </span>
            <div>
              <small>
                {chordKey} 调 · {selectedPreset.degree} 级 · {chord.type.label}
              </small>
              <strong>{chord.symbol}</strong>
            </div>
          </div>
          <div className="chord-tones" aria-label="和弦组成音">
            {chord.notes.map((note) => (
              <span key={note.midi}>{note.name}</span>
            ))}
          </div>
        </div>

        <ChordKeyboardPreview
          chordNotes={chord.notes}
          activeNotes={activeNotes}
        />
      </div>
    </section>
  );
}
