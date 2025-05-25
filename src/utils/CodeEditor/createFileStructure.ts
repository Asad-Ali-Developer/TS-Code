import { FileNode, GitHubFile } from "@/types";
import fetchGitHubRepo from "./fetchGithubRepo";
import fetchFileContent from "./fileFileContent";
import type { Terminal as XTermTerminal } from "xterm";

const createFileStructure = async (
  files: GitHubFile[],
  parentId: string,
  owner: string,
  repo: string,
  basePath = "",
  terminal: XTermTerminal
): Promise<FileNode[]> => {
  const nodes: FileNode[] = [];

  console.log("Base Path:", basePath);
  
  for (const file of files) {
    const nodeId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    if (file.type === "dir") {
      terminal.writeln(`📁 Creating directory: ${file.name}`);

      // Fetch subdirectory contents
      const subFiles = await fetchGitHubRepo(owner, repo, file.path);
      const children = await createFileStructure(
        subFiles,
        nodeId,
        owner,
        repo,
        file.path,
        terminal
      );

      nodes.push({
        id: nodeId,
        name: file.name,
        type: "folder",
        parentId,
        children,
        isOpen: false,
      });
    } else {
      terminal.writeln(`📄 Creating file: ${file.name}`);

      // Fetch file content
      let content = "";
      if (file.download_url) {
        content = await fetchFileContent(file.download_url);
      }

      nodes.push({
        id: nodeId,
        name: file.name,
        type: "file",
        parentId,
        content,
      });
    }
  }

  return nodes;
};

export default createFileStructure;
