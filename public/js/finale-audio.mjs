import { MUSIC_LEAD_MS } from "./finale.mjs";

export function createFinaleAudio(audio) {
  let prepared = false;
  let played = false;

  function prepare() {
    if (prepared) return;
    audio ??= new Audio();
    audio.preload = "auto";
    audio.loop = false;
    audio.src = "/assets/finale_music.mp3";
    audio.load?.();
    prepared = true;
  }

  return {
    prepare,
    update(distanceMs) {
      if (distanceMs > 0 && distanceMs <= 60000) prepare();
      if (played || distanceMs <= 0 || distanceMs > MUSIC_LEAD_MS) return;
      // Claim playback before awaiting it: subsequent ticks must never restart it.
      played = true;
      audio.play().catch((error) => {
        if (error.name !== "AbortError") {
          console.warn("Finale music could not play:", error.message);
        }
      });
    },
    reset() {
      if (!audio) return;
      audio.pause();
      audio.currentTime = 0;
      played = false;
    },
  };
}
