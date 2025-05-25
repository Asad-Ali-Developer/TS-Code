import { GitHubFile } from "@/types";

const fetchGitHubRepo = async (
  owner: string,
  repo: string,
  path = ""
): Promise<GitHubFile[]> => {
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching GitHub repo:", error);
    return [];
  }
};

export default fetchGitHubRepo;