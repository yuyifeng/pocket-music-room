import { useState } from "react";
import { LoaderCircle, RefreshCw, Volume2 } from "lucide-react";
import { AppHeader } from "./components/AppHeader";
import { ChordView } from "./components/ChordView";
import { ModeTabs, type AppMode } from "./components/ModeTabs";
import { OrientationGate } from "./components/OrientationGate";
import { PianoView } from "./components/PianoView";
import { usePianoEngine } from "./hooks/usePianoEngine";

export default function App() {
  const [mode, setMode] = useState<AppMode>("piano");
  const engine = usePianoEngine();

  const changeMode = (nextMode: AppMode) => {
    if (nextMode === mode) {
      return;
    }
    engine.stopAll();
    setMode(nextMode);
  };

  return (
    <div
      className={`app-shell ${
        engine.status === "ready" ? "" : "app-shell--launch"
      }`}
    >
      <OrientationGate />
      <AppHeader status={engine.status} />

      {engine.status === "ready" ? (
        <>
          <div className="mode-bar">
            <ModeTabs mode={mode} onChange={changeMode} />
            <span className="mode-bar__range">
              {mode === "piano"
                ? "C3 - B5 · 36 键"
                : "C / G 调 · 三和弦与七和弦"}
            </span>
          </div>
          <main className="workspace">
            {mode === "piano" ? (
              <PianoView
                activeNotes={engine.activeNotes}
                onNoteOn={engine.noteOn}
                onNoteOff={engine.noteOff}
              />
            ) : (
              <ChordView
                activeNotes={engine.activeNotes}
                onNoteOn={engine.noteOn}
                onNoteOff={engine.noteOff}
                onStopAll={engine.stopAll}
              />
            )}
          </main>
        </>
      ) : (
        <main className="audio-start">
          <div className="audio-start__icon" aria-hidden="true">
            <Volume2 size={34} strokeWidth={1.8} />
          </div>
          <div className="audio-start__copy">
            <p>真实钢琴采样</p>
            <h2>先启用声音，再开始演奏</h2>
            <span>首次加载约 2.5 MB，本次打开后即可流畅弹奏。</span>
          </div>
          <button
            type="button"
            className="primary-button"
            disabled={engine.status === "loading"}
            onClick={() => void engine.initialize()}
          >
            {engine.status === "loading" ? (
              <>
                <LoaderCircle className="spin" size={19} />
                加载钢琴采样
              </>
            ) : engine.status === "error" ? (
              <>
                <RefreshCw size={19} />
                重新加载
              </>
            ) : (
              <>
                <Volume2 size={19} />
                点击启用声音
              </>
            )}
          </button>
          {engine.error && (
            <p className="audio-start__error" role="alert">
              {engine.error}
            </p>
          )}
        </main>
      )}

      <footer className="app-footer">
        Piano samples: Alexander Holm,{" "}
        <a
          href="https://creativecommons.org/licenses/by/3.0/"
          target="_blank"
          rel="noreferrer"
        >
          CC BY 3.0
        </a>
      </footer>
    </div>
  );
}
