import { SAMPLE_ANCHORS, getSampleMapping } from "../domain/music";

interface Voice {
  midi: number;
  source: AudioBufferSourceNode;
  gain: GainNode;
}

type AudioContextConstructor = new () => AudioContext;

const MASTER_GAIN = 1.15;
const VOICE_GAIN = 0.95;

function getAudioContextConstructor(): AudioContextConstructor {
  const AudioContextClass =
    window.AudioContext ??
    (
      window as typeof window & {
        webkitAudioContext?: AudioContextConstructor;
      }
    ).webkitAudioContext;

  if (!AudioContextClass) {
    throw new Error("当前浏览器不支持 Web Audio");
  }
  return AudioContextClass;
}

class PianoSampler {
  private context: AudioContext | null = null;
  private output: GainNode | null = null;
  private buffers = new Map<string, AudioBuffer>();
  private voices = new Map<string, Voice>();
  private loadPromise: Promise<void> | null = null;

  async unlock(): Promise<void> {
    if (!this.context) {
      const AudioContextClass = getAudioContextConstructor();
      const context = new AudioContextClass();
      const output = context.createGain();
      const compressor = context.createDynamicsCompressor();

      output.gain.value = MASTER_GAIN;
      compressor.threshold.value = -3;
      compressor.knee.value = 3;
      compressor.ratio.value = 12;
      compressor.attack.value = 0.002;
      compressor.release.value = 0.18;
      output.connect(compressor);
      compressor.connect(context.destination);

      this.context = context;
      this.output = output;
    }

    if (this.context.state === "suspended") {
      await this.context.resume();
    }
  }

  async preload(): Promise<void> {
    await this.unlock();
    if (this.buffers.size === SAMPLE_ANCHORS.length) {
      return;
    }
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = this.loadSamples().catch((error: unknown) => {
      this.buffers.clear();
      this.loadPromise = null;
      throw error;
    });
    return this.loadPromise;
  }

  noteOn(voiceId: string, midi: number): boolean {
    const context = this.context;
    const output = this.output;
    const mapping = getSampleMapping(midi);
    const buffer = this.buffers.get(mapping.anchor.fileName);
    if (!context || !output || !buffer) {
      return false;
    }

    this.noteOff(voiceId, 0.02);

    const source = context.createBufferSource();
    const gain = context.createGain();
    const now = context.currentTime;

    source.buffer = buffer;
    source.playbackRate.value = mapping.playbackRate;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(
      VOICE_GAIN,
      now + 0.012,
    );
    source.connect(gain);
    gain.connect(output);

    const voice: Voice = { midi, source, gain };
    this.voices.set(voiceId, voice);
    source.onended = () => {
      if (this.voices.get(voiceId) === voice) {
        this.voices.delete(voiceId);
      }
      source.disconnect();
      gain.disconnect();
    };
    source.start(now);
    return true;
  }

  noteOff(voiceId: string, releaseSeconds = 0.32): void {
    const voice = this.voices.get(voiceId);
    const context = this.context;
    if (!voice || !context) {
      return;
    }

    this.voices.delete(voiceId);
    const now = context.currentTime;
    voice.gain.gain.cancelScheduledValues(now);
    voice.gain.gain.setValueAtTime(
      Math.max(voice.gain.gain.value, 0.0001),
      now,
    );
    voice.gain.gain.exponentialRampToValueAtTime(
      0.0001,
      now + releaseSeconds,
    );
    voice.source.stop(now + releaseSeconds + 0.03);
  }

  stopAll(): void {
    for (const voiceId of [...this.voices.keys()]) {
      this.noteOff(voiceId, 0.06);
    }
  }

  async dispose(): Promise<void> {
    this.stopAll();
    const context = this.context;
    this.context = null;
    this.output = null;
    this.buffers.clear();
    this.loadPromise = null;
    if (context && context.state !== "closed") {
      await context.close();
    }
  }

  private async loadSamples(): Promise<void> {
    const context = this.context;
    if (!context) {
      throw new Error("音频引擎尚未初始化");
    }

    const loaded = await Promise.all(
      SAMPLE_ANCHORS.map(async (anchor) => {
        const baseUrl = import.meta.env.BASE_URL;
        const response = await fetch(
          `${baseUrl}audio/piano/${anchor.fileName}`,
        );
        if (!response.ok) {
          throw new Error(`无法加载钢琴采样：${anchor.name}`);
        }
        const audioData = await response.arrayBuffer();
        const buffer = await context.decodeAudioData(audioData);
        return [anchor.fileName, buffer] as const;
      }),
    );

    for (const [fileName, buffer] of loaded) {
      this.buffers.set(fileName, buffer);
    }
  }
}

export const pianoSampler = new PianoSampler();
