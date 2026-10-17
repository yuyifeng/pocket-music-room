import { AudioLines } from "lucide-react";
import type { AudioStatus } from "../hooks/usePianoEngine";

interface AppHeaderProps {
  status: AudioStatus;
}

const STATUS_LABELS: Record<AudioStatus, string> = {
  idle: "声音未启用",
  loading: "正在加载",
  ready: "声音就绪",
  error: "加载失败",
};

export function AppHeader({ status }: AppHeaderProps) {
  return (
    <header className="app-header">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">
          <AudioLines size={19} strokeWidth={2.2} />
        </span>
        <div>
          <h1>口袋琴房</h1>
          <p>随身演奏练习</p>
        </div>
      </div>
      <div className={`audio-state audio-state--${status}`}>
        <span className="audio-state__dot" aria-hidden="true" />
        {STATUS_LABELS[status]}
      </div>
    </header>
  );
}
