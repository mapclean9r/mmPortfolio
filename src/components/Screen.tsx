"use client";

import styles from "@/styles/Screen.module.scss";
import Navbar from "@/components/Navbar";

type WindowTab = {
  id: number;
  title: string;
  active: boolean;
};

type Props = {
  imageUrl: string;
  windows: WindowTab[];
  onSelect: (id: number) => void;
  onClose: (id: number) => void;
  onClick?: () => void;
  children?: React.ReactNode;
};

export default function Screen({
  imageUrl,
  windows,
  onSelect,
  onClose,
  onClick,
  children,
}: Props) {
  return (
    <div className={styles.screen}>
      <div
        className={styles.background}
        style={{ backgroundImage: `url(${imageUrl})` }}
        onClick={onClick}
      >
        <div className={styles.overlay} />
        <div className={styles.content}>{children}</div>
      </div>
      <Navbar windows={windows} onSelect={onSelect} onClose={onClose} />
    </div>
  );
}
