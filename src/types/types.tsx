export type IconData = {
  id: number;
  name: string;
  image: string;
};

export type Entry = {
  name: string;
  path: string;
  type: "file" | "dir";
  size?: number;
  download_url?: string;
};

export type Repo = {
  name: string;
  created_at: string;
};