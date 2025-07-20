"use client";

import React, { useEffect, useRef, useState } from "react";
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
  const backgroundRef = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (backgroundRef.current) {
      setBounds(backgroundRef.current.getBoundingClientRect());
    }

    const handleResize = () => {
      if (backgroundRef.current) {
        setBounds(backgroundRef.current.getBoundingClientRect());
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const enhancedChildren = bounds
    ? React.Children.map(children, (child) => {
        if (typeof child === "object" && child !== null && "props" in child) {
          return React.cloneElement(child as React.ReactElement<any>, {
            bounds,
          });
        }
        return child;
      })
    : children;

  return (
    
    <div className={styles.screen}>
      <div
        className={styles.background}
        ref={backgroundRef}
        style={{ backgroundImage: `url(${imageUrl})` }}
        onClick={onClick}
      >
        
        <div className={styles.overlay} />
        <div className={styles.content}>{enhancedChildren}</div>
      </div>
      <Navbar windows={windows} onSelect={onSelect} onClose={onClose} />
    </div>

  );
}
