"use client";

import { useEffect, useRef, useState } from "react";
import BaseWindow from "@/components/BaseWindow";
import useFileSystem from "@/hooks/useFileSystem";
import styles from "@/styles/TerminalWindow.module.scss";

type Props = {
  onClose: () => void;
  onFocus?: () => void;
  zIndex: number;
};

type OutputLine = {
  id: string;
  text: string;
  isCommand?: boolean;
};

const OUTPUT_KEY = "terminal_output";
const HISTORY_KEY = "terminal_history";

export default function TerminalWindow({ onClose, onFocus, zIndex }: Props) {
  const fs = useFileSystem();
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  const [command, setCommand] = useState("");
  const [cursorIndex, setCursorIndex] = useState(0);

  const [output, setOutput] = useState<OutputLine[]>(() => {
    const saved = localStorage.getItem(OUTPUT_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [history, setHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);

  const appendOutput = (text: string, isCommand = false) => {
    setOutput((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, text, isCommand },
    ]);
  };

  const handleCommand = (cmd: string) => {
    if (cmd.trim()) {
      setHistory((prev) => [...prev, cmd]);
      setHistoryIndex(null);
    }

    appendOutput(`user@host:${fs.pwd()}$ ${cmd}`, true);

    const [base, ...args] = cmd.trim().split(" ");
    let response = "";

    switch (base) {
      case "help":
        response = [
          "Available commands:",
          "  ls               - list files and folders",
          "  cd <dir>         - change directory",
          "  mkdir <name>     - create new folder",
          "  touch <name>     - create new file",
          "  rm <file>        - remove a file",
          "  rmdir <folder>   - remove empty folder",
          "  cat <file>       - show file content",
          "  write <file> <text> - write content to file",
          "  pwd              - show current path",
          "  clear            - clear the terminal",
          "  help             - show this help message"
        ].join("\n");
        break;
      case "ls":
        response = fs.ls().join("  ");
        break;
      case "cd":
        response = fs.cd(args.join(" "));
        break;
      case "mkdir":
        response = fs.mkdir(args[0] || "");
        break;
      case "touch":
        response = fs.touch(args[0] || "");
        break;
      case "pwd":
        response = fs.pwd();
        break;
      case "cat":
        response = fs.cat(args.join(" "));
        break;
      case "rm":
        response = fs.rm(args.join(" "));
        break;
      case "rmdir":
        response = fs.rmdir(args.join(" "));
        break;
      case "write":
        const fileName = args[0];
        const content = args.slice(1).join(" ");
        if (fileName) {
          response = fs.writeToFile(fileName, content);
        } else {
          response = "usage: write <file> <content>";
        }
        break;
      case "clear":
        setOutput([]);
        localStorage.removeItem(OUTPUT_KEY);
        return;
      case "":
        response = "";
        break;
      default:
        response = `command not found: ${base}`;
    }

    if (response) appendOutput(response);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCommand(command);
    setCommand("");
    setCursorIndex(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowLeft") {
      setCursorIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "ArrowRight") {
      setCursorIndex((i) => Math.min(i + 1, command.length));
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      setHistoryIndex((prev) => {
        const newIndex = prev === null ? history.length - 1 : Math.max(0, prev - 1);
        const cmd = history[newIndex];
        setCommand(cmd);
        setCursorIndex(cmd.length);
        return newIndex;
      });
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (history.length === 0) return;
      setHistoryIndex((prev) => {
        if (prev === null) return null;
        const newIndex = prev + 1;
        if (newIndex >= history.length) {
          setCommand("");
          setCursorIndex(0);
          return null;
        }
        const cmd = history[newIndex];
        setCommand(cmd);
        setCursorIndex(cmd.length);
        return newIndex;
      });
    }

    if (e.key === "Tab") {
      e.preventDefault();
      const [base, ...rest] = command.trim().split(" ");
      const partial = rest.join(" ");
      if (!partial) return;

      const matches = fs.ls().filter((entry) => entry.startsWith(partial));
      if (matches.length === 1) {
        setCommand(`${base} ${matches[0]}`);
        setCursorIndex((`${base} ${matches[0]}`).length);
      } else if (matches.length > 1) {
        appendOutput(matches.join("  "));
      }
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "auto" });
  }, [output]);

  useEffect(() => {
    localStorage.setItem(OUTPUT_KEY, JSON.stringify(output));
  }, [output]);

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  return (
    <BaseWindow
      title="Terminal"
      onClose={onClose}
      onFocus={onFocus}
      zIndex={zIndex}
    >
      <div className={styles.terminal} onClick={() => inputRef.current?.focus()}>
        <div className={styles.output} ref={outputRef}>
          {output.map((line) => (
            <div
              key={line.id}
              className={line.isCommand ? styles.command : styles.response}
            >
              {line.text}
            </div>
          ))}
          <div ref={scrollAnchorRef} />
        </div>

        <form onSubmit={handleSubmit} className={styles.line}>
          <span className={styles.prompt}>user@host:</span>
          <span className={styles.path}>{fs.pwd()}$</span>
          <span>
            {command.slice(0, cursorIndex)}
            <span className={styles.cursor}></span>
            {command.slice(cursorIndex)}
          </span>
          <input
            ref={inputRef}
            value={command}
            onChange={(e) => {
              setCommand(e.target.value);
              setCursorIndex(e.target.selectionStart || 0);
            }}
            onKeyDown={handleKeyDown}
            className={styles.hiddenInput}
            autoComplete="off"
            spellCheck={false}
          />
        </form>
      </div>
    </BaseWindow>
  );
}
