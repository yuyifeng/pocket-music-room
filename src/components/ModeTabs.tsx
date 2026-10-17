import { LayoutGrid, Piano } from "lucide-react";

export type AppMode = "piano" | "chords";

interface ModeTabsProps {
  mode: AppMode;
  onChange: (mode: AppMode) => void;
}

const MODES = [
  { id: "piano", label: "钢琴", icon: Piano },
  { id: "chords", label: "和弦", icon: LayoutGrid },
] as const;

export function ModeTabs({ mode, onChange }: ModeTabsProps) {
  return (
    <div className="mode-tabs" role="tablist" aria-label="演奏模式">
      {MODES.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          className="mode-tab"
          type="button"
          role="tab"
          aria-selected={mode === id}
          onClick={() => onChange(id)}
        >
          <Icon size={17} aria-hidden="true" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
