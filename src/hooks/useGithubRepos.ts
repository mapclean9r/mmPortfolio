import { useEffect, useState } from "react";
import { fetchGithubRepos } from "@/service/githubService";
import { Repo } from "@/types/types";

export function useGithubRepos(username: string) {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [repoDates, setRepoDates] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchGithubRepos(username);
        setRepos(data);
        const dates: Record<string, string> = {};
        data.forEach((r) => (dates[r.name] = r.created_at));
        setRepoDates(dates);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        setRepos([]);
      }
    };

    fetchData();
  }, [username]);

  return { repos, error, repoDates };
}
