"use client";

import { useState } from "react";
import BaseWindow from "./BaseWindow";
import styles from "@/styles/GitWindow.module.scss";
import { useGithubRepos } from "@/hooks/useGithubRepos";
import { useGithubRepoContents } from "@/hooks/useGithubRepoContents";

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
  zIndex: number;
};

export default function GitWindow({ onClose, onFocus, zIndex }: Props) {
  const githubUser = "mapclean9r";

  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string[]>([]);

  const { repos, error: repoError, repoDates } = useGithubRepos(githubUser);
  const { entries, error: contentError } = useGithubRepoContents(
    githubUser,
    selectedRepo,
    currentPath
  );

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
          {(repoError || contentError) && (
            <div className={styles.error}>Feil: {repoError || contentError}</div>
          )}

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
                onClick={() => {
                  setSelectedRepo(repo.name);
                  setCurrentPath([]);
                }}
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
