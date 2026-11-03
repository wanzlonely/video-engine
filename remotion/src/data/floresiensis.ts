export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

export const meta = {
  judul: "Homo floresiensis — Manusia Setinggi Satu Meter",
  durasiTotal: 62,
  fps: FPS,
  width: WIDTH,
  height: HEIGHT,
};

export const scenes = [
  { id: "hook", type: "ancientNight", start: 0, duration: 7, gradient: ["#0a0e18", "#121820", "#1a1e28"] },
  { id: "island", type: "island", start: 6.5, duration: 8, gradient: ["#1a2830", "#243840", "#2a4038"] },
  { id: "small-human", type: "silhouette", start: 14, duration: 7, gradient: ["#1c2018", "#28281c", "#1a1c14"] },
  { id: "name", type: "title", start: 20.5, duration: 6, gradient: ["#121820", "#1a2028", "#14181e"] },
  { id: "cave", type: "cave", start: 26, duration: 7, gradient: ["#0e1218", "#1a1814", "#141210"] },
  { id: "tools", type: "tools", start: 32.5, duration: 8, gradient: ["#1a2218", "#24281c", "#1c2014"] },
  { id: "dwarfism", type: "dwarfism", start: 40, duration: 10, gradient: ["#182028", "#202830", "#1a2228"] },
  { id: "closing", type: "closing", start: 49.5, duration: 12.5, gradient: ["#0c1018", "#141820", "#101418"] },
] as const;

export const TOTAL_FRAMES = Math.round(meta.durasiTotal * FPS);
