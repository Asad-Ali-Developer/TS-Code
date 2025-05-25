export interface GitHubFile {
  name: string;
  path: string;
  type: string;
  download_url?: string;
  url?: string;
}

export interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  content?: string;
  children?: FileNode[];
  isOpen?: boolean;
  parentId?: string | null;
}

export interface OpenFile {
  id: string;
  name: string;
  content: string;
  isDirty: boolean;
  path: string;
}

export interface PackageInfo {
  name: string;
  version: string;
  description: string;
  author?: string;
  license?: string;
  homepage?: string;
}