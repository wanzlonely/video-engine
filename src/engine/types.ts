export type SceneType =
  | "sky"
  | "fire"
  | "building"
  | "text"
  | "character"
  | "particles";

export interface SubtitleWord {
  text: string;
  start: number;
  end: number;
}

export interface SceneCharacter {
  id: string;
  asset: string;
  x: number;
  y: number;
  scale: number;
  animation?: string;
}

export type TransitionType = "fade" | "slide-left" | "slide-right" | "wipe" | "none";

export interface SceneTransition {
  type: TransitionType;
  /** overlap duration in seconds, shared between the outgoing and incoming scene */
  duration: number;
}

export interface Scene {
  id: string;
  type: SceneType;
  start: number;
  duration: number;
  background?: {
    color?: string;
    gradient?: [string, string];
    image?: string;
  };
  characters?: SceneCharacter[];
  text?: {
    content: string;
    x: number;
    y: number;
    size: number;
    color: string;
  };
  params?: Record<string, unknown>;
  audio?: {
    src: string;
    volume?: number;
  };
  /** transition used when entering this scene from the previous one */
  transitionIn?: SceneTransition;
}

/** A single row in the scene timeline, with absolute frame bounds resolved. */
export interface SceneMapEntry {
  scene: Scene;
  index: number;
  startFrame: number;
  durationFrames: number;
  endFrame: number;
  transitionInFrames: number;
}

export interface NaskahMeta {
  judul: string;
  durasiTotal: number;
  fps: number;
  width: number;
  height: number;
}

export interface Naskah {
  meta: NaskahMeta;
  subtitles: SubtitleWord[];
  scenes: Scene[];
  /** teks narasi penuh (bukan dipecah per-kata) — sumber untuk TTS, lihat tts.js */
  narasiText?: string;
  /** path/URL audio hasil TTS, dipasang otomatis oleh tts.js setelah generate */
  narasiAudio?: string;
}
