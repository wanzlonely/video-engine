/** Data naskah Zanzibar — sumber tunggal untuk composition Remotion */
export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

export const meta = {
  judul: "Perang Terpendek dalam Sejarah",
  durasiTotal: 92,
  fps: FPS,
  width: WIDTH,
  height: HEIGHT,
};

export const scenes = [
  { id: "hook", type: "sky", start: 0, duration: 8, gradient: ["#070b16", "#04060c", "#020308"] },
  { id: "title", type: "text", start: 7.2, duration: 5.5, gradient: ["#10162a", "#080b14", "#04060c"] },
  { id: "year", type: "text", start: 12, duration: 4.5, gradient: ["#0c101c", "#06080e"] },
  { id: "setting", type: "building", start: 16, duration: 8, gradient: ["#1a2840", "#0c1524", "#060a12"] },
  { id: "sultan-dies", type: "character", start: 23.5, duration: 8, gradient: ["#1a1220", "#0c0810", "#060408"] },
  { id: "britain-rejects", type: "britain", start: 31, duration: 8, gradient: ["#14101c", "#0a0810", "#050408"] },
  { id: "ultimatum", type: "ultimatum", start: 38.5, duration: 9, gradient: ["#241810", "#100a08", "#080504"] },
  { id: "bombardment", type: "fire", start: 47, duration: 12, gradient: ["#1a0a06", "#2a1008", "#0c0604"] },
  { id: "thirty-eight", type: "thirtyEight", start: 58.5, duration: 8, gradient: ["#0e121c", "#06080c"] },
  { id: "cost", type: "cost", start: 66, duration: 9, gradient: ["#12151c", "#080a0e"] },
  { id: "closing", type: "sky", start: 74.5, duration: 17.5, gradient: ["#080c16", "#04060c", "#020308"] },
] as const;

export const subtitles = [
  { text: "Pernah membayangkan sebuah perang", start: 0.5, end: 3.4 },
  { text: "yang bahkan tidak berlangsung selama satu jam?", start: 3.4, end: 7.0 },
  { text: "Pada tahun 1896", start: 7.5, end: 9.6 },
  { text: "sebuah konflik terjadi di Zanzibar", start: 9.6, end: 12.8 },
  { text: "Wilayah di pesisir Afrika Timur", start: 13.2, end: 16.0 },
  { text: "yang sekarang menjadi bagian dari Tanzania", start: 16.0, end: 19.5 },
  { text: "Semuanya bermula ketika Sultan meninggal dunia", start: 20.0, end: 23.6 },
  { text: "Khalid bin Barghash mengambil alih takhta", start: 23.6, end: 27.2 },
  { text: "Namun ada satu masalah besar", start: 27.6, end: 30.2 },
  { text: "Inggris tidak menyetujui pengangkatannya", start: 30.6, end: 34.0 },
  { text: "Mereka ingin penguasa yang lebih mudah dikendalikan", start: 34.0, end: 38.0 },
  { text: "Khalid menolak menyerahkan kekuasaannya", start: 38.4, end: 41.8 },
  { text: "Pagi 27 Agustus 1896, Inggris mengirim ultimatum", start: 42.2, end: 46.2 },
  { text: "Keluar dari istana sebelum pukul sembilan", start: 46.2, end: 49.6 },
  { text: "Khalid memilih bertahan", start: 50.0, end: 52.4 },
  { text: "Kapal perang Inggris siap di pelabuhan", start: 52.4, end: 55.8 },
  { text: "Tepat pukul sembilan… meriam menyala", start: 56.2, end: 59.6 },
  { text: "Dalam hitungan menit, istana rusak parah", start: 59.6, end: 63.2 },
  { text: "Khalid melarikan diri ke konsulat Jerman", start: 63.6, end: 67.2 },
  { text: "38 menit setelah perang dimulai", start: 67.6, end: 70.6 },
  { text: "Tembakan berhenti. Bendera diturunkan", start: 70.6, end: 74.0 },
  { text: "Sekitar 500 korban di pihak Zanzibar", start: 74.4, end: 77.6 },
  { text: "Hanya satu pelaut Inggris yang terluka", start: 77.6, end: 80.8 },
  { text: "Perang Inggris–Zanzibar", start: 81.2, end: 83.6 },
  { text: "Perang terpendek dalam sejarah", start: 83.6, end: 86.6 },
  { text: "Sebuah perang yang mengubah sejarah", start: 87.0, end: 90.0 },
  { text: "berakhir sebelum banyak orang menyadarinya", start: 90.0, end: 91.8 },
];

export const TOTAL_FRAMES = Math.round(meta.durasiTotal * FPS);
