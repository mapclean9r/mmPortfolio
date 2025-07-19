"use client";

import BaseWindow from "@/components/BaseWindow";

type Props = {
  onClose: () => void;
  onFocus?: () => void;
  zIndex: number;
};

export default function TerminalWindow({ onClose, onFocus, zIndex }: Props) {
  return (
    <BaseWindow
      title="Terminal"
      onClose={onClose}
      onFocus={onFocus}
      zIndex={zIndex}
    >
      <div className="p-4">
        <p className="text-green-400">Welcome to terminal!</p>
        <p className="mt-2">$</p>
      </div>
    </BaseWindow>
  );
}
