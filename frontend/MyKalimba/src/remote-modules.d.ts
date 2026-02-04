declare module "https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js";
declare module "https://cdn.jsdelivr.net/npm/soundfont-player@0.12.0/dist/soundfont-player.min.js";

declare global {
  // Legacy scripts loaded via <script> tags.
  // We keep them as `any` to avoid pulling in full jQuery typings.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const $: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jQuery: any;

  // Soundfont data scripts write into this namespace (e.g. public/soundfonts/**.js).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const MIDI: any;

  // soundfont-player (UMD build) commonly exposes `Soundfont` as a global.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Soundfont: any;

  interface Window {
    Soundfont?: {
      instrument?: (
        audioContext: AudioContext,
        instrument: string,
      ) => Promise<{
        play: (
          note: string,
          when?: number,
          options?: { gain?: number },
        ) => void;
      }>;
    };
    webkitAudioContext?: typeof AudioContext;
  }
}

export {};
