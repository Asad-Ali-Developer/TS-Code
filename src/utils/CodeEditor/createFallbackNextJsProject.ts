import { FileNode } from "@/types";
import { SetStateAction } from "react";
import getProjectStructure from "./getProjectStructure";

const createFallbackNextJsProject = async (
  projectName: string,
  terminal: any,
  setFileSystem: (value: SetStateAction<FileNode[]>) => void
) => {
  const projectId = `${Date.now()}-project`;

  const projectStructure = await getProjectStructure(projectId, projectName);

  setFileSystem((prev) => [...prev, projectStructure]);
  terminal.writeln(
    `\x1b[32m✓\x1b[0m Created ${projectName} with fallback template`
  );
};

export default createFallbackNextJsProject;
