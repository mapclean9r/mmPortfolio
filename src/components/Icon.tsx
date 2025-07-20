"use client";

import { useEffect, useState } from "react";

export type DraggableIconProps = {
  icon: React.ReactNode;
  initialX?: number;
  initialY?: number;
  gridSize?: number;
  id: number;
  isSelected: boolean;
  onClick: () => void;
  onDoubleClick?: () => void;
  bounds?: DOMRect;
};

export default function Icon({
  icon,
  initialX = 100,
  initialY = 100,
  gridSize = 40,
  id,
  isSelected,
  onClick,
  onDoubleClick,
  bounds,
}: DraggableIconProps) {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [ghostPosition, setGhostPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const iconWidth = 80;
  const iconHeight = 100;

  const clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(value, max));

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsMouseDown(true);
    const offsetX = e.clientX - position.x;
    const offsetY = e.clientY - position.y;
    setOffset({ x: offsetX, y: offsetY });
    setGhostPosition({ x: e.clientX - offsetX, y: e.clientY - offsetY });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isMouseDown) return;

    const newX = e.clientX - offset.x;
    const newY = e.clientY - offset.y;

    setGhostPosition({ x: newX, y: newY });

    const deltaX = e.clientX - position.x - offset.x;
    const deltaY = e.clientY - position.y - offset.y;
    const movedEnough = Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3;

    if (!dragging && movedEnough) {
      setDragging(true);
    }
  };

  const handleMouseUp = () => {
    if (dragging) {
      const snappedX = Math.round(ghostPosition.x / gridSize) * gridSize;
      const snappedY = Math.round(ghostPosition.y / gridSize) * gridSize;

      let newX = snappedX;
      let newY = snappedY;

      if (bounds) {
        const minX = bounds.left;
        const maxX = bounds.right - iconWidth;
        const minY = bounds.top;
        const maxY = bounds.bottom - iconHeight;

        newX = clamp(newX, minX, maxX);
        newY = clamp(newY, minY, maxY);
      }

      setPosition({ x: newX, y: newY });
    }

    setDragging(false);
    setIsMouseDown(false);
  };

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, ghostPosition, isMouseDown, offset, bounds]);

  return (
    <>
      <div
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          onDoubleClick?.();
        }}
        onMouseDown={handleMouseDown}
        style={{
          position: "absolute",
          left: position.x,
          top: position.y,
          width: iconWidth,
          height: iconHeight,
          opacity: 1,
          cursor: "pointer",
          userSelect: "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          border: isSelected ? "2px solid #3399ff" : "2px solid transparent",
          borderRadius: 4,
          backgroundColor: isSelected ? "rgba(255,255,255,0.1)" : "transparent",
          boxSizing: "border-box",
        }}
      >
        {icon}
      </div>

      {dragging && (
        <div
          style={{
            position: "fixed",
            left: ghostPosition.x,
            top: ghostPosition.y,
            width: iconWidth,
            height: iconHeight,
            opacity: 0.5,
            transform: "translate(-10%, -10%)",
            pointerEvents: "none",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>
      )}
    </>
  );
}
