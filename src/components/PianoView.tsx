import { useCallback, useEffect, useRef, useState } from "react";
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
  const [visibleRatio, setVisibleRatio] = useState(1);
  const viewportRef = useRef<HTMLDivElement>(null);
  const rangeRef = useRef(0);
  const scrollFrameRef = useRef<number | null>(null);

  const updateViewport = useCallback((value: number) => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const keyboard = viewport.querySelector<HTMLElement>(".piano-keyboard");
    if (!keyboard) {
      return;
    }

    const viewportStyle = window.getComputedStyle(viewport);
    const horizontalPadding =
      Number.parseFloat(viewportStyle.paddingLeft) +
      Number.parseFloat(viewportStyle.paddingRight);
    const visibleWidth = Math.max(
      0,
      viewport.clientWidth - horizontalPadding,
    );
    const keyboardWidth = keyboard.getBoundingClientRect().width;
    const nextVisibleRatio =
      keyboardWidth > 0 ? Math.min(1, visibleWidth / keyboardWidth) : 1;

    setVisibleRatio((currentRatio) =>
      Math.abs(currentRatio - nextVisibleRatio) < 0.001
        ? currentRatio
        : nextVisibleRatio,
    );
    const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    viewport.scrollLeft = maxScroll * (value / 100);
  }, []);

  const applyRange = (value: number) => {
    rangeRef.current = value;
    setRange(value);

    if (scrollFrameRef.current !== null) {
      window.cancelAnimationFrame(scrollFrameRef.current);
    }
    scrollFrameRef.current = window.requestAnimationFrame(() => {
      updateViewport(value);
      scrollFrameRef.current = null;
    });
  };

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const keyboard = viewport.querySelector<HTMLElement>(".piano-keyboard");
    const observer = new ResizeObserver(() =>
      updateViewport(rangeRef.current),
    );
    observer.observe(viewport);
    if (keyboard) {
      observer.observe(keyboard);
    }
    updateViewport(rangeRef.current);

    return () => {
      observer.disconnect();
      if (scrollFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollFrameRef.current);
      }
    };
  }, [updateViewport]);

  return (
    <section
      className="instrument-view piano-view"
      role="tabpanel"
      aria-label="钢琴演奏"
    >
      <RangeNavigator
        value={range}
        visibleRatio={visibleRatio}
        onChange={applyRange}
      />
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
