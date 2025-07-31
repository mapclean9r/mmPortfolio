export type FileEntry = {
  name: string;
  type: "dir" | "file";
  children?: FileEntry[];
  parent?: FileEntry | null;
};

export class FileSystem {
  root: FileEntry;
  current: FileEntry;

  constructor() {
    this.root = { name: "/", type: "dir", children: [], parent: null };
    this.current = this.root;
  }

  ls(): string[] {
    return this.current.children?.map((entry) => entry.name) || [];
  }

  mkdir(name: string): string {
    if (this.current.children?.some((e) => e.name === name)) {
      return `mkdir: cannot create directory ‘${name}’: File exists`;
    }
    const newDir: FileEntry = {
      name,
      type: "dir",
      children: [],
      parent: this.current,
    };
    this.current.children?.push(newDir);
    return "";
  }

  touch(name: string): string {
    if (this.current.children?.some((e) => e.name === name)) {
      return `touch: cannot create file ‘${name}’: File exists`;
    }
    const newFile: FileEntry = {
      name,
      type: "file",
      parent: this.current,
    };
    this.current.children?.push(newFile);
    return "";
  }

  cd(name: string): string {
    if (name === "..") {
      if (this.current.parent) {
        this.current = this.current.parent;
      }
      return "";
    }

    const target = this.current.children?.find(
      (e) => e.name === name && e.type === "dir"
    );

    if (!target) {
      return `cd: no such file or directory: ${name}`;
    }

    this.current = target;
    return "";
  }

  pwd(): string {
    const parts: string[] = [];
    let node: FileEntry | null = this.current;
    while (node && node.parent) {
      parts.unshift(node.name);
      node = node.parent;
    }
    return "/" + parts.join("/");
  }

  clear(): string {
    return "__CLEAR__";
  }
}
