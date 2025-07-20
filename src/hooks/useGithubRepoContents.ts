import { useEffect, useState } from "react";
import { fetchRepoContents } from "@/service/githubService";
import { Entry } from "@/types/types";

export function useGithubRepoContents(
  username: string,
  selectedRepo: string | null,
  currentPath: string[]
) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!selectedRepo) return;
      const path = currentPath.join("/");
      try {
        const data = await fetchRepoContents(username, selectedRepo, path);
        setEntries(data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        setEntries([]);
      }
    };

    load();
  }, [username, selectedRepo, currentPath]);

  return { entries, error };
}
