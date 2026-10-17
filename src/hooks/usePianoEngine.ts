import { useCallback, useEffect, useRef, useState } from "react";
import { pianoSampler } from "../audio/pianoSampler";

export type AudioStatus = "idle" | "loading" | "ready" | "error";

export interface PianoEngineController {
  status: AudioStatus;
  error: string | null;
  activeNotes: ReadonlySet<number>;
  initialize: () => Promise<void>;
  noteOn: (voiceId: string, midi: number) => void;
  noteOff: (voiceId: string) => void;
  stopAll: () => void;
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "声音加载失败，请重试";
}

export function usePianoEngine(): PianoEngineController {
  const [status, setStatus] = useState<AudioStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [activeNotes, setActiveNotes] = useState<ReadonlySet<number>>(
    () => new Set(),
  );
  const activeVoices = useRef(new Map<string, number>());

  const syncActiveNotes = useCallback(() => {
    setActiveNotes(new Set(activeVoices.current.values()));
  }, []);

  const stopAll = useCallback(() => {
    pianoSampler.stopAll();
    activeVoices.current.clear();
    syncActiveNotes();
  }, [syncActiveNotes]);

  const initialize = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      await pianoSampler.preload();
      setStatus("ready");
    } catch (loadError) {
      setError(toErrorMessage(loadError));
      setStatus("error");
    }
  }, []);

  const noteOn = useCallback(
    (voiceId: string, midi: number) => {
      if (pianoSampler.noteOn(voiceId, midi)) {
        activeVoices.current.set(voiceId, midi);
        syncActiveNotes();
      }
    },
    [syncActiveNotes],
  );

  const noteOff = useCallback(
    (voiceId: string) => {
      pianoSampler.noteOff(voiceId);
      activeVoices.current.delete(voiceId);
      syncActiveNotes();
    },
    [syncActiveNotes],
  );

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopAll();
      }
    };

    window.addEventListener("blur", stopAll);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("blur", stopAll);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      stopAll();
    };
  }, [stopAll]);

  return {
    status,
    error,
    activeNotes,
    initialize,
    noteOn,
    noteOff,
    stopAll,
  };
}
