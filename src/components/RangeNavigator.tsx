import {
  useRef,
  type PointerEvent as ReactPointerEvent,
} from "react";

interface RangeNavigatorProps {
  value: number;
  visibleRatio: number;
  onChange: (value: number) => void;
}

const MINI_KEYS = Array.from({ length: 21 }, (_, index) => index);

export function RangeNavigator({
  value,
  visibleRatio,
  onChange,
}: RangeNavigatorProps) {
  const normalizedRatio = Math.min(1, Math.max(0, visibleRatio));
  const windowWidth = normalizedRatio * 100;
  const windowLeft = (1 - normalizedRatio) * value;
  const trackRef = useRef<HTMLDivElement>(null);
  const activePointer = useRef<number | null>(null);
  const grabOffset = useRef(0);

  const startDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track || normalizedRatio >= 1) {
      return;
    }

    const bounds = track.getBoundingClientRect();
    const windowWidthPx = bounds.width * normalizedRatio;
    const windowLeftPx =
      bounds.width * (windowLeft / 100);
    const pointerX = event.clientX - bounds.left;
    if (
      pointerX < windowLeftPx ||
      pointerX > windowLeftPx + windowWidthPx
    ) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    activePointer.current = event.pointerId;
    grabOffset.current = pointerX - windowLeftPx;
  };

  const moveDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track || activePointer.current !== event.pointerId) {
      return;
    }

    event.preventDefault();
    const bounds = track.getBoundingClientRect();
    const windowWidthPx = bounds.width * normalizedRatio;
    const travel = bounds.width - windowWidthPx;
    if (travel <= 0) {
      return;
    }

    const pointerX = event.clientX - bounds.left;
    const nextLeft = Math.min(
      travel,
      Math.max(0, pointerX - grabOffset.current),
    );
    onChange((nextLeft / travel) * 100);
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (activePointer.current === event.pointerId) {
      activePointer.current = null;
    }
  };

  return (
    <div className="range-navigator">
      <div
        ref={trackRef}
        className="range-track"
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onLostPointerCapture={endDrag}
      >
        <div className="range-track__keys" aria-hidden="true">
          {MINI_KEYS.map((key) => (
            <span key={key} />
          ))}
        </div>
        <span
          className="range-track__window"
          style={{
            left: `${windowLeft}%`,
            width: `${windowWidth}%`,
          }}
          aria-hidden="true"
        />
        <input
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={value}
          onInput={(event) => onChange(Number(event.currentTarget.value))}
          aria-label="移动可见钢琴音域"
        />
      </div>
    </div>
  );
}
