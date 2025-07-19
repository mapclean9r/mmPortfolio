"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/styles/BaseWindow.module.scss";

export type BaseWindowProps = {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  minHeight?: string;
  onFocus?: () => void;
  zIndex: number;
};

export default function BaseWindow({
  title,
  onClose,
  children,
  minHeight,
  onFocus,
  zIndex,
}: BaseWindowProps) {
  const windowRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 200, y: 100 });
  const [size, setSize] = useState({ width: 600, height: 400 });

  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const bringToFront = () => {
    onFocus?.();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    bringToFront();
    setDragging(true);
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  useEffect(() => {
    const body = document.body;
    if (dragging || resizing) {
      body.classList.add("noselect");
    } else {
      body.classList.remove("noselect");
    }

    return () => {
      body.classList.remove("noselect");
    };
  }, [dragging, resizing]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragging) {
        const newX = e.clientX - offset.x;
        const newY = e.clientY - offset.y;
        const win = windowRef.current;
        if (!win) return;

        const maxX = window.innerWidth - win.offsetWidth;
        const maxY = window.innerHeight - win.offsetHeight;

        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY)),
        });
      } else if (resizing) {
        const newWidth = e.clientX - position.x;
        const newHeight = e.clientY - position.y;

        setSize({
          width: Math.max(300, newWidth),
          height: Math.max(200, newHeight),
        });
      }
    };

    const stopActions = () => {
      setDragging(false);
      setResizing(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopActions);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopActions);
    };
  }, [dragging, resizing, offset, position]);

  return (
    <div
      ref={windowRef}
      className={`${styles.window} ${dragging || resizing ? "noselect" : ""}`}
      style={{
        left: position.x,
        top: position.y,
        zIndex,
        width: size.width,
        height: size.height,
        minHeight: minHeight ?? "300px",
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        bringToFront();
      }}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      <div
        className={styles.header}
        onMouseDown={handleMouseDown}
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
      >
        <span>{title}</span>
        <button onClick={onClose} className={styles.closeButton}>
          ✕
        </button>
      </div>
      <div className={styles.body}>{children}</div>
      <div
        className={styles.resizeHandle}
        onMouseDown={(e) => {
          e.stopPropagation();
          setResizing(true);
        }}
      />
    </div>
  );
}
