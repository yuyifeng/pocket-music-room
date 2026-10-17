import { useEffect, useRef, useState } from "react";
import { PianoKeyboard } from "./PianoKeyboard";
import { RangeNavigator } from "./RangeNavigator";

interface PianoViewProps {
  activeNotes: ReadonlySet<number>;
  onNoteOn: (voiceId: string, midi: number) => void;
  onNoteOff: (voiceId: string) => void;
}

export function PianoView({
  activeNotes,
  onNoteOn,
  onNoteOff,
}: PianoViewProps) {
  const [range, setRange] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);

  const applyRange = (value: number) => {
    setRange(value);
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }
    const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    viewport.scrollLeft = maxScroll * (value / 100);
  };

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const observer = new ResizeObserver(() => {
      const maxScroll = Math.max(
        0,
        viewport.scrollWidth - viewport.clientWidth,
      );
      viewport.scrollLeft = maxScroll * (range / 100);
    });
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [range]);

  return (
    <section
      className="instrument-view piano-view"
      role="tabpanel"
      aria-label="钢琴演奏"
    >
      <RangeNavigator value={range} onChange={applyRange} />
      <div ref={viewportRef} className="piano-viewport">
        <PianoKeyboard
          activeNotes={activeNotes}
          onNoteOn={onNoteOn}
          onNoteOff={onNoteOff}
        />
      </div>
    </section>
  );
}
