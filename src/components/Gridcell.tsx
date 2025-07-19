import { useDrop } from "react-dnd";
import DraggableIcon from "./DragableIcon";
import { IconData } from "@/types/types";
import styles from "@/styles/DesktopGrid.module.scss";

type Props = {
  index: number;
  icon: IconData | null;
  onMoveIcon: (from: number, to: number) => void;
  isSelected: boolean;
  onSelect: () => void;
};

export default function GridCell({ index, icon, onMoveIcon, isSelected, onSelect }: Props) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "ICON",
    drop: (item: { from: number }) => {
      if (item.from !== index) {
        onMoveIcon(item.from, index);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={(node) => {
        if (node) {
            drop(node);
        }
    }}
      className={`${styles.cell} ${isOver ? styles.over : ""}`}
      onClick={onSelect}
    >
      {icon && (
        <DraggableIcon
          icon={icon}
          from={index}
          isSelected={isSelected}
          onClick={onSelect}
        />
      )}
    </div>
  );
}
