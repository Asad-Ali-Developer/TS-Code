import { FileNode } from "@/types";
import fetchGitHubRepo from "./fetchGithubRepo";
import createFileStructure from "./createFileStructure";
import generatePackageJson from "./generatePackageJson";
import generateReadme from "./generateReadme";
import { SetStateAction } from "react";
import createFallbackNextJsProject from "./createFallbackNextJsProject";

const createNextJsProject = async (
  projectName: string,
  terminal: any,
  setFileSystem: (value: SetStateAction<FileNode[]>) => void
) => {
  try {
    terminal.writeln(`🚀 Creating a new Next.js app in ./${projectName}`);
    terminal.writeln("");
    terminal.writeln("📦 Fetching Next.js template from GitHub...");

    // Fetch the official Next.js template
    const files = await fetchGitHubRepo(
      "vercel",
      "next.js",
      "examples/hello-world"
    );

    if (files.length === 0) {
      // Fallback to a simpler template
      terminal.writeln("⚠️  Using fallback template...");
      await createFallbackNextJsProject(projectName, terminal, setFileSystem);
      return;
    }

    terminal.writeln("📁 Building project structure...");

    // Create the project folder
    const projectId = `${Date.now()}-project`;
    const projectNode: FileNode = {
      id: projectId,
      name: projectName,
      type: "folder",
      parentId: null,
      children: [],
      isOpen: true,
    };

    // Create file structure from GitHub template
    const children = await createFileStructure(
      files,
      projectId,
      "vercel",
      "next.js",
      "examples/hello-world",
      terminal
    );
    projectNode.children = children;

    // Add additional essential files
    const packageJsonContent = await generatePackageJson(projectName);
    const readmeContent = await generateReadme(projectName);

    projectNode.children.push({
      id: `${Date.now()}-package`,
      name: "package.json",
      type: "file",
      parentId: projectId,
      content: packageJsonContent,
    });

    projectNode.children.push({
      id: `${Date.now()}-readme`,
      name: "README.md",
      type: "file",
      parentId: projectId,
      content: readmeContent,
    });

    // Add to file system
    setFileSystem((prev) => [...prev, projectNode]);

    terminal.writeln("");
    terminal.writeln(`\x1b[32m✓\x1b[0m Created ${projectName}`);
    terminal.writeln("");
    terminal.writeln(
      "🎉 Success! Created " + projectName + " at ./" + projectName
    );
    terminal.writeln("");
    terminal.writeln("Inside that directory, you can run several commands:");
    terminal.writeln("");
    terminal.writeln("  \x1b[36mnpm run dev\x1b[0m");
    terminal.writeln("    Starts the development server.");
    terminal.writeln("");
    terminal.writeln("  \x1b[36mnpm run build\x1b[0m");
    terminal.writeln("    Builds the app for production.");
    terminal.writeln("");
    terminal.writeln("We suggest that you begin by typing:");
    terminal.writeln("");
    terminal.writeln(`  \x1b[36mcd ${projectName}\x1b[0m`);
    terminal.writeln("  \x1b[36mnpm run dev\x1b[0m");
  } catch (error) {
    terminal.writeln(`\x1b[31m✗\x1b[0m Error creating project: ${error}`);
    terminal.writeln("⚠️  Creating fallback template...");
    await createFallbackNextJsProject(projectName, terminal, setFileSystem);
  }
};

export default createNextJsProject;
