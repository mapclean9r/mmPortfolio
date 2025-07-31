"use client";

import { useEffect, useState } from "react";

type FileNode = {
  type: "file";
  name: string;
  content: string;
};

type DirNode = {
  type: "dir";
  name: string;
  children: Record<string, FileNode | DirNode>;
};

type Node = FileNode | DirNode;

const STORAGE_KEY = "filesystem_state";

const createRoot = (): DirNode => ({
  type: "dir",
  name: "/",
  children: {},
});

export default function useFileSystem() {
  const [root, setRoot] = useState<DirNode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved).root;
      } catch {
        return createRoot();
      }
    }
    return createRoot();
  });

  const [path, setPath] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved).path || [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ root, path }));
  };

  useEffect(() => {
    save();
  }, [root, path]);

  const getCurrentDir = (): DirNode => {
    let current: Node = root;
    for (const segment of path) {
      if (current.type === "dir" && current.children[segment]) {
        current = current.children[segment];
      }
    }
    return current as DirNode;
  };

  const resolvePath = (
    input: string
  ): { node: Node | null; parent: DirNode | null; name: string } => {
    const isAbsolute = input.startsWith("/");
    const parts = input.split("/").filter(Boolean);
    let current: Node = isAbsolute ? root : getCurrentDir();
    let parent: DirNode | null = null;

    for (let i = 0; i < parts.length; i++) {
      if (current.type !== "dir") return { node: null, parent, name: parts[i] };

      if (parts[i] === "..") {
        if (path.length > 0) {
          current = root;
          for (let j = 0; j < path.length - 1; j++) {
            current = (current as DirNode).children[path[j]];
          }
          parent = current as DirNode;
        }
      } else {
        parent = current;
        current = current.children[parts[i]];
        if (!current) return { node: null, parent, name: parts[i] };
      }
    }

    return { node: current, parent, name: parts[parts.length - 1] };
  };

  const ls = (): string[] => {
    return Object.keys(getCurrentDir().children);
  };

  const cd = (targetPath: string): string => {
    if (targetPath === "..") {
      if (path.length > 0) setPath((prev) => prev.slice(0, -1));
      return "";
    }

    const resolved = resolvePath(targetPath);
    if (resolved.node && resolved.node.type === "dir") {
      const parts = targetPath.startsWith("/")
        ? targetPath.split("/").filter(Boolean)
        : [...path, ...targetPath.split("/").filter(Boolean)];

      setPath(parts);
      return "";
    }

    return `cd: no such directory: ${targetPath}`;
  };

  const mkdir = (name: string): string => {
    const dir = getCurrentDir();
    if (dir.children[name]) return `${name} already exists`;
    dir.children[name] = { type: "dir", name, children: {} };
    setRoot({ ...root });
    return "";
  };

  const touch = (name: string): string => {
    const dir = getCurrentDir();
    if (dir.children[name]) return `${name} already exists`;
    dir.children[name] = { type: "file", name, content: "" };
    setRoot({ ...root });
    return "";
  };

  const cat = (targetPath: string): string => {
    const resolved = resolvePath(targetPath);
    if (!resolved.node) return `cat: ${targetPath}: No such file`;
    if (resolved.node.type !== "file") return `cat: ${targetPath}: Is a directory`;
    return resolved.node.content;
  };

  const writeToFile = (targetPath: string, content: string): string => {
    const resolved = resolvePath(targetPath);
    if (resolved.node && resolved.node.type === "file") {
      resolved.node.content = content;
      setRoot({ ...root });
      return "";
    }

    if (resolved.parent && !resolved.node) {
      resolved.parent.children[resolved.name] = {
        type: "file",
        name: resolved.name,
        content,
      };
      setRoot({ ...root });
      return "";
    }

    return `write: cannot write to ${targetPath}`;
  };

  const rm = (path: string): string => {
  const { parent, node, name } = resolvePath(path);
  if (!node || node.type !== "file") return `rm: cannot remove '${path}': No such file`;
  if (!parent) return `rm: permission denied`;
  delete parent.children[name];
  setRoot({ ...root });
  return "";
};

const rmdir = (path: string): string => {
  const { parent, node, name } = resolvePath(path);
  if (!node || node.type !== "dir") return `rmdir: '${path}' is not a directory`;
  if (Object.keys((node as DirNode).children).length > 0)
    return `rmdir: failed to remove '${path}': Directory not empty`;
  if (!parent) return `rmdir: permission denied`;
  delete parent.children[name];
  setRoot({ ...root });
  return "";
};

  const pwd = (): string => "/" + path.join("/");

  return { ls, cd, mkdir, touch, cat, writeToFile, pwd, rm, rmdir };
}
