"use client";

import { useEffect, useState } from "react";
import "@/styles/navbar.scss";

type WindowTab = {
  id: number;
  title: string;
  active: boolean;
};

type Props = {
  windows: WindowTab[];
  onSelect: (id: number) => void;
  onClose: (id: number) => void;
};

export default function Navbar({ windows, onSelect, onClose }: Props) {
  const [clock, setClock] = useState("--:--");

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      setClock(`${hours}:${minutes}`);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="navbar">
      <div className="tabs">
        {windows.map((win) => (
      <div
        key={win.id}
        className={`tab ${win.active ? "active" : ""}`}
        onClick={() => onSelect(win.id)}
      >
  <span className="title">{win.title}</span>
  <button
    className="close"
    onClick={(e) => {
      e.stopPropagation();
      onClose(win.id);
    }}
  >
    ✕
  </button>
</div>
        ))}
      </div>
      <div className="clock">
        {new Date().toLocaleDateString("nb-NO")} {clock}
      </div>
    </div>
  );
}
