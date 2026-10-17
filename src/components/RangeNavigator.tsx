interface RangeNavigatorProps {
  value: number;
  onChange: (value: number) => void;
}

const OCTAVES = ["C3", "C4", "C5"] as const;
const MINI_KEYS = Array.from({ length: 21 }, (_, index) => index);

export function RangeNavigator({ value, onChange }: RangeNavigatorProps) {
  return (
    <div className="range-navigator">
      <div className="range-navigator__meta">
        <span>音域</span>
        <div aria-hidden="true">
          {OCTAVES.map((octave) => (
            <span key={octave}>{octave}</span>
          ))}
        </div>
      </div>
      <div className="range-track">
        <div className="range-track__keys" aria-hidden="true">
          {MINI_KEYS.map((key) => (
            <span key={key} />
          ))}
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={value}
          onChange={(event) => onChange(Number(event.currentTarget.value))}
          aria-label="移动可见钢琴音域"
        />
      </div>
    </div>
  );
}
