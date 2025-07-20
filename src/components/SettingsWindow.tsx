"use client";

import styles from "@/styles/SettingsWindow.module.scss";
import BaseWindow from "./BaseWindow";

type Props = {
  onClose: () => void;
  onFocus?: () => void;
  zIndex: number;
  musicPlaying: boolean;
  setMusicPlaying: (v: boolean) => void;
  volume: number;
  setVolume: (v: number) => void;
};

export default function SettingsWindow({
  onClose,
  onFocus,
  zIndex,
  musicPlaying,
  setMusicPlaying,
  volume,
  setVolume,
}: Props) {
  return (
    <BaseWindow
      title="Settings"
      onClose={onClose}
      onFocus={onFocus}
      zIndex={zIndex}
    >
      <div className={styles.settings}>
        <pre>{`{\n `}</pre>
        <div className={styles.setting}>
          <span className={styles.key}>"music"</span>
          <span>: </span>
          <input
            type="number"
            min={0}
            max={1}
            value={musicPlaying ? 1 : 0}
            onChange={(e) =>
              setMusicPlaying(e.target.value === "1" ? true : false)
            }
          />
        </div>

        <div className={styles.setting}>
          <span className={styles.key}>"volume"</span>
          <span>: </span>
          <input
            type="number"
            min={0}
            max={100}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
          />
        </div>
        <pre>{`\n}`}</pre>
      </div>
    </BaseWindow>
  );
}
