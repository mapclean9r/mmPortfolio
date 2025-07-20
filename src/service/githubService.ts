import { Entry, Repo } from "@/types/types";

const BASE_URL = "https://api.github.com";

export async function fetchGithubRepos(username: string): Promise<Repo[]> {
  const res = await fetch(`${BASE_URL}/users/${username}/repos`);
  if (!res.ok) throw new Error("Kunne ikke hente repos");
  return res.json();
}

export async function fetchRepoContents(
  username: string,
  repo: string,
  path: string
): Promise<Entry[]> {
  const url = `${BASE_URL}/repos/${username}/${repo}/contents/${path}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`404: ${url}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}
