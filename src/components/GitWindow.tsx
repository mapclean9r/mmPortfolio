"use client";

import { useEffect, useState } from "react";
import BaseWindow from "./BaseWindow";
import styles from "@/styles/GitWindow.module.scss";

type Entry = {
  name: string;
  path: string;
  type: "file" | "dir";
  size?: number;
  download_url?: string;
};

type Repo = {
  name: string;
  created_at: string;
};

type Props = {
  onClose: () => void;
  onFocus?: () => void;
  zIndex: number; // 👈 NYTT
};

export default function GitWindow({ onClose, onFocus, zIndex }: Props) {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [repoDates, setRepoDates] = useState<Record<string, string>>({});

  const githubUser = "mapclean9r";

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const res = await fetch(`https://api.github.com/users/${githubUser}/repos`);
        if (!res.ok) throw new Error("Kunne ikke hente repos");
        const data = await res.json();
        setRepos(data);
        const dates: Record<string, string> = {};
        data.forEach((r: any) => (dates[r.name] = r.created_at));
        setRepoDates(dates);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        setRepos([]);
      }
    };

    fetchRepos();
  }, [githubUser]);

  useEffect(() => {
    const loadDirectory = async () => {
      if (!selectedRepo) return;
      const path = currentPath.join("/");
      const url = `https://api.github.com/repos/${githubUser}/${selectedRepo}/contents/${path}`;
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`404: ${url}`);
        const data = await res.json();
        setEntries(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        setEntries([]);
      }
    };
    loadDirectory();
  }, [selectedRepo, currentPath, githubUser]);

  const formatSize = (bytes?: number) => {
    if (!bytes) return "<dir>";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("nb-NO");
  };

  return (
    <BaseWindow
      title={
        selectedRepo
          ? `/repo/${selectedRepo}/${currentPath.join("/")}`
          : "GitHub file viewer"
      }
      onClose={onClose}
      onFocus={onFocus}
      zIndex={zIndex}
    >
      <div className={`git-window ${styles["git-window"]}`}>
        <div className={styles.urlBar}>
          {!selectedRepo && (
            <span className={styles.prefix}>https://github.com/{githubUser}</span>
          )}

          {selectedRepo && repoDates[selectedRepo] && (
            <span className={styles.created}>
              Created: {formatDate(repoDates[selectedRepo])}
            </span>
          )}
        </div>

        <div className={styles.header}>
          <span>Name</span>
          <span>Size</span>
          <span>Date</span>
        </div>

        <div className={styles.list}>
          {error && <div className={styles.error}>Feil: {error}</div>}

          {selectedRepo && (
            <div
              onClick={() => {
                if (currentPath.length > 0) {
                  setCurrentPath(currentPath.slice(0, -1));
                } else {
                  setSelectedRepo(null);
                }
              }}
              className={styles.row}
            >
              <span>↩ ..</span>
              <span>{currentPath.length > 0 ? "<dir>" : "<repo>"}</span>
              <span>-</span>
            </div>
          )}

          {!selectedRepo &&
            repos.map((repo, index) => (
              <div
                key={index}
                onClick={() => setSelectedRepo(repo.name)}
                className={styles.row}
              >
                <span>📁 {repo.name}</span>
                <span>&lt;repo&gt;</span>
                <span>{formatDate(repo.created_at)}</span>
              </div>
            ))}

          {selectedRepo &&
            entries.map((entry, index) => (
              <div
                key={index}
                onClick={() => {
                  if (entry.type === "dir") {
                    setCurrentPath([...currentPath, entry.name]);
                  }
                }}
                className={styles.row}
              >
                <span>
                  {entry.type === "dir" ? "📁" : "📄"} {entry.name}
                </span>
                <span>{formatSize(entry.size)}</span>
                <span>-</span>
              </div>
            ))}
        </div>

        <div className={styles.footer}>
          <span>
            {selectedRepo
              ? `${entries.length} entries`
              : `${repos.length} repos`}
          </span>
          <span>GitHub: {githubUser}</span>
        </div>
      </div>
    </BaseWindow>
  );
}
