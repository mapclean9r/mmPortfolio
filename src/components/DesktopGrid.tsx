"use client";

import GridCell from "./GridCell";
import styles from "@/styles/DesktopGrid.module.scss";
import { useState } from "react";
import { IconData } from "@/types/types";

const initialIcons: (IconData | null)[] = Array(20).fill(null);
initialIcons[0] = { id: 1, name: "git™ Root", image: "/root.png" };
initialIcons[1] = { id: 2, name: "README.md", image: "/readme.png" };

export default function DesktopGrid() {
  const [cells, setCells] = useState<(IconData | null)[]>(initialIcons);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const moveIcon = (from: number, to: number) => {
    if (cells[to]) return;

    const updated = [...cells];
    updated[to] = updated[from];
    updated[from] = null;
    setCells(updated);
  };

  return (
    <div className={styles.grid}>
      {cells.map((icon, index) => (
        <GridCell
          key={index}
          index={index}
          icon={icon}
          isSelected={icon?.id === selectedId}
          onMoveIcon={moveIcon}
          onSelect={() => setSelectedId(icon?.id ?? null)}
        />
      ))}
    </div>
  );
}
