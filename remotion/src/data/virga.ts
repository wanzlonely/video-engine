/** Naskah Virga — hujan yang menguap sebelum sampai tanah */
export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

export const meta = {
  judul: "Virga — Hujan yang Tak Pernah Menyentuh Tanah",
  durasiTotal: 68,
  fps: FPS,
  width: WIDTH,
  height: HEIGHT,
};

export const scenes = [
  { id: "hook", type: "skyRain", start: 0, duration: 8, gradient: ["#1a2744", "#0d1528", "#070b14"] },
  { id: "name", type: "title", start: 7.5, duration: 5, gradient: ["#152238", "#0a1220", "#060a12"] },
  { id: "normal-rain", type: "rainGround", start: 12, duration: 7, gradient: ["#1c2a40", "#101a2c", "#0a1018"] },
  { id: "dry-layer", type: "dryAir", start: 18.5, duration: 8, gradient: ["#2a2218", "#1a140e", "#0e0a08"] },
  { id: "evaporate", type: "evaporate", start: 26, duration: 8, gradient: ["#243048", "#141c2c", "#0a1018"] },
  { id: "appearance", type: "virgaCloud", start: 33.5, duration: 8, gradient: ["#1e2a3c", "#121a28", "#0a1018"] },
  { id: "weather-effect", type: "wind", start: 41, duration: 7, gradient: ["#2c2418", "#1a140e", "#0c0a08"] },
  { id: "desert", type: "desert", start: 47.5, duration: 7, gradient: ["#3a2a18", "#24180e", "#120c08"] },
  { id: "closing", type: "skyRain", start: 54, duration: 14, gradient: ["#141e30", "#0c1420", "#060a12"] },
] as const;

export const subtitles = [
  { text: "Pernah membayangkan melihat hujan turun", start: 0.4, end: 3.2 },
  { text: "tetapi tidak ada satu tetes pun yang menyentuh tanah?", start: 3.2, end: 7.0 },
  { text: "Fenomena ini dikenal sebagai virga", start: 7.8, end: 11.2 },
  { text: "Biasanya hujan jatuh hingga mencapai Bumi", start: 12.2, end: 15.6 },
  { text: "Namun kadang tetesan menghilang sebelum sampai tanah", start: 15.6, end: 19.2 },
  { text: "Ini terjadi saat hujan melewati udara yang sangat kering", start: 19.6, end: 23.8 },
  { text: "Tetesan air berubah menjadi uap — penguapan", start: 24.0, end: 27.8 },
  { text: "Semakin mengecil hingga akhirnya menghilang di udara", start: 27.8, end: 31.8 },
  { text: "Dari kejauhan tampak seperti awan ber-ekor panjang", start: 32.2, end: 36.4 },
  { text: "Seolah menurunkan hujan yang tak pernah sampai Bumi", start: 36.4, end: 40.4 },
  { text: "Virga juga memengaruhi cuaca di sekitarnya", start: 41.0, end: 44.4 },
  { text: "Udara jadi lebih dingin dan menciptakan angin kencang", start: 44.4, end: 48.4 },
  { text: "Bahkan bisa terjadi di wilayah panas seperti gurun", start: 48.8, end: 52.8 },
  { text: "Jika melihat garis hujan menggantung di langit…", start: 53.4, end: 57.2 },
  { text: "bisa jadi kamu sedang menyaksikan virga", start: 57.2, end: 60.6 },
  { text: "Tidak semua hujan dari langit berhasil mencapai Bumi", start: 61.2, end: 66.5 },
];

export const TOTAL_FRAMES = Math.round(meta.durasiTotal * FPS);
