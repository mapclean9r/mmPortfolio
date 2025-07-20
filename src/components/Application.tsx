"use client";

import Screen from "@/components/Screen";
import Icon from "@/components/Icon";
import Image from "next/image";
import { useState } from "react";
import TerminalWindow from "@/components/TerminalWindow";
import GitWindow from "@/components/GitWindow";

let windowIdCounter = 1;
let globalZIndex = 100;

type WindowInstance = {
  id: number;
  type: "terminal" | "git";
  title: string;
  active: boolean;
  z: number;
};

export default function Application() {
  const [windows, setWindows] = useState<WindowInstance[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedIconId, setSelectedIconId] = useState<number | null>(null);

  const openWindow = (type: "terminal" | "git") => {
    const newId = windowIdCounter++;
    const title = type === "terminal" ? "README.md" : "GitHub";

    setWindows((prev) => [
      ...prev.map((w) => ({ ...w, active: false })),
      { id: newId, type, title, active: true, z: globalZIndex++ },
    ]);
    setSelectedId(newId);
  };

  const closeWindow = (id: number) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const selectWindow = (id: number) => {
    setWindows((prev) =>
      prev.map((w) =>
        w.id === id
          ? { ...w, active: true, z: globalZIndex++ }
          : { ...w, active: false }
      )
    );
    setSelectedId(id);
  };

  return (
    <Screen
      imageUrl="/mmBackground.webp"
      windows={windows.map(({ id, title, active }) => ({ id, title, active }))}
      onSelect={selectWindow}
      onClose={closeWindow}
      onClick={() => {
        setSelectedId(null);
        setSelectedIconId(null);
      }}
    >
      <Icon
        id={1}
        initialX={100}
        initialY={100}
        gridSize={140}
        isSelected={selectedIconId === 1}
        onClick={() => setSelectedIconId(1)}
        onDoubleClick={() => openWindow("git")}
        icon={
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Image src="/root.png" alt="Root" width={64} height={64} />
            <span style={{ color: "white", fontSize: "0.75rem", marginTop: "4px", textAlign: "center" }}>
              git™ Root
            </span>
          </div>
        }
      />

      <Icon
        id={2}
        initialX={200}
        initialY={100}
        gridSize={140}
        isSelected={selectedIconId === 2}
        onClick={() => setSelectedIconId(2)}
        onDoubleClick={() => openWindow("terminal")}
        icon={
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Image src="/readme.png" alt="Readme" width={64} height={64} />
            <span style={{ color: "white", fontSize: "0.75rem", marginTop: "4px", textAlign: "center" }}>
              README.md
            </span>
          </div>
        }
      />

      {[...windows].map((w) =>
        w.type === "git" ? (
          <GitWindow
            key={w.id}
            onClose={() => closeWindow(w.id)}
            onFocus={() => selectWindow(w.id)}
            zIndex={w.z}
          />
        ) : (
          <TerminalWindow
            key={w.id}
            onClose={() => closeWindow(w.id)}
            onFocus={() => selectWindow(w.id)}
            zIndex={w.z}
          />
        )
      )}
    </Screen>
  );
}
