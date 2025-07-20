import { useEffect, useState } from "react";

const MUSIC_KEY = "musicPlaying";
const VOLUME_KEY = "musicVolume";

let sharedAudio: HTMLAudioElement | null = null;

export default function useMusicSettings() {
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [volume, setVolume] = useState(100);
  const [canPlay, setCanPlay] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!sharedAudio) {
      sharedAudio = new Audio("/song.mp3");
      sharedAudio.loop = true;
    }
  }, []);

  useEffect(() => {
    const handleInteraction = () => {
      setCanPlay(true);
      window.removeEventListener("click", handleInteraction);
    };
    window.addEventListener("click", handleInteraction);
    return () => window.removeEventListener("click", handleInteraction);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedMusic = localStorage.getItem(MUSIC_KEY);
    const storedVolume = localStorage.getItem(VOLUME_KEY);

    if (storedMusic !== null) setMusicPlaying(storedMusic === "1");
    if (storedVolume !== null) setVolume(Number(storedVolume));
  }, []);

  useEffect(() => {
    if (sharedAudio) {
      sharedAudio.volume = volume / 100;
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(VOLUME_KEY, volume.toString());
    }
  }, [volume]);

  useEffect(() => {
    if (!sharedAudio) return;

    if (typeof window !== "undefined") {
      localStorage.setItem(MUSIC_KEY, musicPlaying ? "1" : "0");
    }

    if (musicPlaying && canPlay) {
      if (sharedAudio.paused) {
        sharedAudio
          .play()
          .catch((e) => console.warn("Audio playback failed:", e));
      }
    } else {
      sharedAudio.pause();
    }
  }, [musicPlaying, canPlay]);

  return {
    musicPlaying,
    setMusicPlaying,
    volume,
    setVolume,
  };
}
