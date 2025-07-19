"use client";

import { useDrag } from "react-dnd";
import Image from "next/image";
import { IconData } from "@/types/types";

type Props = {
  icon: IconData;
  from: number;
  isSelected: boolean;
  onClick: () => void;
};

export default function DraggableIcon({ icon, from, isSelected, onClick }: Props) {
  const [, dragRef] = useDrag(() => ({
    type: "ICON",
    item: { id: icon.id, from, image: icon.image, name: icon.name },
  }));

  return (
    <div
        ref={(node) => {
          if (node) dragRef(node);
        }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={{
        width: 80,
        height: 100,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        border: isSelected ? "2px solid #3399ff" : "2px solid transparent",
        borderRadius: 4,
        backgroundColor: isSelected ? "rgba(255,255,255,0.1)" : "transparent",
        cursor: "move",
      }}
    >
      <Image src={icon.image} alt={icon.name} width={64} height={64} />
      <span style={{ color: "white", fontSize: 12, marginTop: 4 }}>{icon.name}</span>
    </div>
  );
}
