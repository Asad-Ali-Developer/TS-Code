import type { FileNode } from "@/types";
import type { Dispatch, SetStateAction } from "react";
import createNextJsProject from "./createNextJsProject";
import fetchNpmPackageInfo from "./fetchNPMPackInfo";
import findPackageJson from "./findPackagJson";
import type { FirebaseFileSystemService } from "@/services";

type ItemType = "file" | "folder";

// Import Terminal type from xterm.js
import type { Terminal as XTermTerminal } from "xterm";

/**
 * Handles terminal commands like npm, git, ls, cd, etc.
 */
const handleCommand = async (
  command: string,
  terminal: XTermTerminal,
  setIsLoading: Dispatch<SetStateAction<boolean>>,
  fileSystem: FileNode[],
  setFileSystem: Dispatch<SetStateAction<FileNode[]>>,
  createNewItem: (
    parentId: string,
    type: ItemType,
    name: string
  ) => Promise<void>, // Updated to Promise<void>
  setCurrentDirectory: (value: SetStateAction<string>) => void,
  currentDirectory: string,
  firebaseService: FirebaseFileSystemService
) => {
  setIsLoading(true);
  terminal.write("\r\n");

  const args = command.trim().split(" ");
  const cmd = args[0].toLowerCase();

  try {
    switch (cmd) {
      case "help":
        terminal.writeln("📚 \x1b[1;33mAvailable Commands:\x1b[0m");
        terminal.writeln(
          "  \x1b[36mnpx create-next-app <name>\x1b[0m - Create Next.js app"
        );
        terminal.writeln(
          "  \x1b[36mnpx create-react-app <name>\x1b[0m - Create React app"
        );
        terminal.writeln(
          "  \x1b[36mnpm install / npm i\x1b[0m       - Install dependencies"
        );
        terminal.writeln(
          "  \x1b[36mnpm install <package>\x1b[0m     - Install specific package"
        );
        terminal.writeln(
          "  \x1b[36mnpm init\x1b[0m                  - Create package.json"
        );
        terminal.writeln(
          "  \x1b[36mnpm run <script>\x1b[0m          - Run package script"
        );
        terminal.writeln(
          "  \x1b[36mls / dir\x1b[0m                - List directory contents"
        );
        terminal.writeln(
          "  \x1b[36mcd <directory>\x1b[0m           - Change directory"
        );
        terminal.writeln(
          "  \x1b[36mtouch <filename>\x1b[0m         - Create new file"
        );
        terminal.writeln(
          "  \x1b[36mmkdir <dirname>\x1b[0m          - Create new directory"
        );
        terminal.writeln(
          "  \x1b[36mcat <filename>\x1b[0m           - Display file contents"
        );
        terminal.writeln(
          "  \x1b[36mclear\x1b[0m                    - Clear terminal"
        );
        terminal.writeln(
          "  \x1b[36mnode -v\x1b[0m                  - Show Node.js version"
        );
        terminal.writeln(
          "  \x1b[36mpython --version\x1b[0m         - Show Python version"
        );
        terminal.writeln(
          "  \x1b[36mgit status\x1b[0m               - Show git status"
        );
        break;

      case "npx":
        if (args[1] === "create-next-app") {
          const projectName = args[2] || "my-next-app";
          await createNextJsProject(
            projectName,
            terminal,
            createNewItem,
          );
        } else if (args[1] === "create-react-app") {
          const projectName = args[2] || "my-react-app";
          terminal.writeln(`🚀 Creating a new React app in ./${projectName}`);
          terminal.writeln(
            "📦 This would create a React app (Next.js template used for demo)"
          );
          await createNextJsProject(
            projectName,
            terminal,
            createNewItem,
          );
        } else {
          terminal.writeln(
            `\x1b[31m✗\x1b[0m npx: command '${args[1]}' not found`
          );
        }
        break;

      case "npm":
        if (args[1] === "install" || args[1] === "i") {
          if (args[2]) {
            // Install specific package
            const packageName = args[2];
            terminal.writeln(`📦 Installing ${packageName}...`);
            const packageInfo = await fetchNpmPackageInfo(packageName);
            if (packageInfo) {
              terminal.writeln(
                `\x1b[32m✓\x1b[0m Found ${packageInfo.name}@${packageInfo.version}`
              );
              terminal.writeln(
                `  ${packageInfo.description || "No description available"}`
              );
              await new Promise((resolve) => setTimeout(resolve, 1500));
              terminal.writeln(
                `\x1b[32m✓\x1b[0m Successfully installed ${packageName}@${packageInfo.version}`
              );
              await updatePackageJsonFirebase(
                firebaseService,
                fileSystem,
                packageName,
                packageInfo.version
              );
            } else {
              terminal.writeln(
                `\x1b[31m✗\x1b[0m Package '${packageName}' not found`
              );
            }
          } else {
            // Install all dependencies
            terminal.writeln("📦 Installing dependencies from package.json...");
            const packageJsonNode = findPackageJson(fileSystem);
            if (!packageJsonNode || !packageJsonNode.content) {
              terminal.writeln("\x1b[31m✗\x1b[0m No package.json found");
              break;
            }
            try {
              const packageJson = JSON.parse(packageJsonNode.content);
              const dependencies = {
                ...packageJson.dependencies,
                ...packageJson.devDependencies,
              };
              const depCount = Object.keys(dependencies).length;
              if (depCount === 0) {
                terminal.writeln(
                  "\x1b[33m⚠\x1b[0m No dependencies found in package.json"
                );
                terminal.writeln("\x1b[32m✓\x1b[0m up to date");
                break;
              }

              terminal.writeln(`Found ${depCount} dependencies to install:`);
              const depNames = Object.keys(dependencies);
              for (let i = 0; i < Math.min(depNames.length, 5); i++) {
                const dep = depNames[i];
                terminal.writeln(`  📦 ${dep}@${dependencies[dep]}`);
              }
              if (depNames.length > 5) {
                terminal.writeln(
                  `  ... and ${depNames.length - 5} more packages`
                );
              }

              terminal.writeln("");
              terminal.writeln("📥 Downloading packages...");
              await new Promise((resolve) => setTimeout(resolve, 1000));
              terminal.writeln("🔧 Building fresh packages...");
              await new Promise((resolve) => setTimeout(resolve, 1500));

              // Create node_modules and package-lock.json using Firebase
              const projectNode = fileSystem.find((node) =>
                node.children?.some((child) => child.name === "package.json")
              );
              if (projectNode) {
                const hasNodeModules = projectNode.children?.some(
                  (child) => child.name === "node_modules"
                );
                const hasPackageLock = projectNode.children?.some(
                  (child) => child.name === "package-lock.json"
                );

                if (!hasNodeModules) {
                  await createNewItem(projectNode.id, "folder", "node_modules");
                }
                if (!hasPackageLock) {
                  const packageLockContent = JSON.stringify(
                    {
                      name: packageJson.name || "project",
                      version: packageJson.version || "1.0.0",
                      lockfileVersion: 3,
                      requires: true,
                      packages: {
                        "": {
                          name: packageJson.name || "project",
                          version: packageJson.version || "1.0.0",
                          dependencies: packageJson.dependencies || {},
                          devDependencies: packageJson.devDependencies || {},
                        },
                      },
                    },
                    null,
                    2
                  );
                  await createNewItem(
                    projectNode.id,
                    "file",
                    "package-lock.json"
                  );
                  // Update the content after creation
                  setTimeout(async () => {
                    const lockFile = fileSystem.find(
                      (node) =>
                        node.name === "package-lock.json" &&
                        node.parentId === projectNode.id
                    );
                    if (lockFile) {
                      await firebaseService.updateItem(lockFile.id, {
                        content: packageLockContent,
                      });
                    }
                  }, 100);
                }
              }

              terminal.writeln("");
              terminal.writeln(
                `\x1b[32m✓\x1b[0m Installed ${depCount} packages in 3.2s`
              );
              terminal.writeln("");
              terminal.writeln(
                `📊 ${depCount} packages are looking for funding`
              );
              terminal.writeln("  run \x1b[36mnpm fund\x1b[0m for details");
              terminal.writeln("");
              terminal.writeln("🔍 found 0 vulnerabilities");
            } catch (error) {
              console.error("Error parsing package.json:", error);
              terminal.writeln("\x1b[31m✗\x1b[0m Error parsing package.json");
            }
          }
        } else if (args[1] === "init") {
          terminal.writeln("📝 Creating package.json...");
          const packageJsonContent = JSON.stringify(
            {
              name: "my-project",
              version: "1.0.0",
              description: "",
              main: "index.js",
              scripts: {
                test: 'echo "Error: no test specified" && exit 1',
              },
              keywords: [],
              author: "",
              license: "ISC",
            },
            null,
            2
          );
          await createNewItem("root", "file", "package.json");
          // Update content after creation
          setTimeout(async () => {
            const packageJsonFile = fileSystem.find(
              (node) => node.name === "package.json" && node.parentId === "root"
            );
            if (packageJsonFile) {
              await firebaseService.updateItem(packageJsonFile.id, {
                content: packageJsonContent,
              });
            }
          }, 100);
          terminal.writeln("\x1b[32m✓\x1b[0m Created package.json");
        } else if (args[1] === "run" && args[2]) {
          const script = args[2];
          terminal.writeln(`🚀 Running script: ${script}`);

          const packageJsonNode = fileSystem.find(
            (node) => node.name === "package.json"
          );
          if (packageJsonNode?.content) {
            try {
              const packageJson = JSON.parse(packageJsonNode.content);
              const scripts = packageJson.scripts || {};
              if (scripts[script]) {
                terminal.writeln(
                  `> ${packageJson.name || "project"}@1.0.0 ${script}`
                );
                terminal.writeln(`> ${scripts[script]}`);
                terminal.writeln("");

                if (script === "dev" || script === "start") {
                  terminal.writeln("🌐 Starting development server...");
                  await new Promise((resolve) => setTimeout(resolve, 1000));
                  terminal.writeln("✓ Ready on http://localhost:3000");
                  terminal.writeln("✓ Local:    http://localhost:3000");
                  terminal.writeln("✓ Network:  http://192.168.1.100:3000");
                } else if (script === "build") {
                  terminal.writeln("🏗️  Building application...");
                  await new Promise((resolve) => setTimeout(resolve, 2000));
                  terminal.writeln("✓ Build completed successfully");
                  terminal.writeln("📦 Output stored in 'dist' folder");
                } else {
                  await new Promise((resolve) => setTimeout(resolve, 1000));
                  terminal.writeln(
                    `✓ Script '${script}' completed successfully`
                  );
                }
              } else {
                terminal.writeln(
                  `\x1b[31m✗\x1b[0m Script '${script}' not found`
                );
                terminal.writeln("Available scripts:");
                Object.keys(scripts).forEach((scriptName) => {
                  terminal.writeln(`  ${scriptName}: ${scripts[scriptName]}`);
                });
              }
            } catch (error) {
              console.log("Error reading package.json:", error);
              terminal.writeln("\x1b[31m✗\x1b[0m Error reading package.json");
            }
          } else {
            terminal.writeln("\x1b[31m✗\x1b[0m No package.json found");
          }
        } else {
          terminal.writeln("Usage: npm install [package]");
        }
        break;

      case "ls":
      case "dir":
        terminal.writeln("📁 Directory contents:");
        fileSystem.forEach((node) => {
          const icon = node.type === "folder" ? "📁" : "📄";
          const color = node.type === "folder" ? "\x1b[34m" : "\x1b[37m";
          terminal.writeln(`  ${icon} ${color}${node.name}\x1b[0m`);
        });
        break;

      case "cd":
        if (args[1]) {
          const dirName = args[1];
          const dir = fileSystem.find(
            (node) => node.name === dirName && node.type === "folder"
          );
          if (dir) {
            setCurrentDirectory(`/${dirName}`);
            terminal.writeln(`📁 Changed directory to /${dirName}`);
          } else {
            terminal.writeln(
              `\x1b[31m✗\x1b[0m Directory '${dirName}' not found`
            );
          }
        } else {
          terminal.writeln("Usage: cd <directory>");
        }
        break;

      case "touch":
        if (args[1]) {
          const fileName = args[1];
          await createNewItem("root", "file", fileName);
          terminal.writeln(`\x1b[32m✓\x1b[0m Created file '${fileName}'`);
        } else {
          terminal.writeln("Usage: touch <filename>");
        }
        break;

      case "mkdir":
        if (args[1]) {
          const dirName = args[1];
          await createNewItem("root", "folder", dirName);
          terminal.writeln(`\x1b[32m✓\x1b[0m Created directory '${dirName}'`);
        } else {
          terminal.writeln("Usage: mkdir <dirname>");
        }
        break;

      case "cat":
        if (args[1]) {
          const fileName = args[1];
          const file = fileSystem.find(
            (node) => node.name === fileName && node.type === "file"
          );
          if (file && file.content) {
            terminal.writeln(`📄 Contents of ${fileName}:`);
            terminal.writeln(file.content);
          } else {
            terminal.writeln(
              `\x1b[31m✗\x1b[0m File '${fileName}' not found or empty`
            );
          }
        } else {
          terminal.writeln("Usage: cat <filename>");
        }
        break;

      case "clear":
      case "cls":
        terminal.clear();
        terminal.writeln("🚀 \x1b[1;35mCodeSync Collaborative Terminal\x1b[0m");
        terminal.writeln("💡 Type 'help' for available commands");
        terminal.writeln("🌐 Fetches real data from the internet");
        terminal.writeln("🔥 Real-time collaboration enabled");
        break;

      case "node":
        if (args[1] === "-v") terminal.writeln("v18.17.0");
        else terminal.writeln("Usage: node -v");
        break;

      case "python":
        if (args[1] === "--version") terminal.writeln("Python 3.11.0");
        else terminal.writeln("Usage: python --version");
        break;

      case "git":
        if (args[1] === "status") {
          terminal.writeln("🌿 On branch main");
          terminal.writeln("📝 Changes not staged for commit:");
          terminal.writeln("  \x1b[31mmodified:   src/App.tsx\x1b[0m");
          terminal.writeln("  \x1b[32mnew file:   README.md\x1b[0m");
        } else {
          terminal.writeln("Usage: git status");
        }
        break;

      case "pwd":
        terminal.writeln(currentDirectory);
        break;

      case "whoami":
        terminal.writeln("developer");
        break;

      case "date":
        terminal.writeln(new Date().toString());
        break;

      case "echo":
        const message = args.slice(1).join(" ");
        terminal.writeln(message);
        break;

      default:
        terminal.writeln(
          `\x1b[31m✗\x1b[0m Command '${cmd}' not found. Type 'help' for available commands.`
        );
    }
  } catch (error) {
    terminal.writeln(`\x1b[31m✗\x1b[0m Error executing command: ${error}`);
  }

  setIsLoading(false);
  terminal.write("\r\n\x1b[1;36m$\x1b[0m ");
};

// Helper function to update package.json after installing a package using Firebase
async function updatePackageJsonFirebase(
  firebaseService: FirebaseFileSystemService,
  fileSystem: FileNode[],
  packageName: string,
  version: string
) {
  const packageJsonNode = fileSystem.find(
    (node) => node.name === "package.json"
  );
  if (packageJsonNode) {
    try {
      const packageJson = JSON.parse(packageJsonNode.content || "{}");
      packageJson.dependencies = packageJson.dependencies || {};
      packageJson.dependencies[packageName] = `^${version}`;
      await firebaseService.updateItem(packageJsonNode.id, {
        content: JSON.stringify(packageJson, null, 2),
      });
    } catch (e) {
      console.error("Failed to update package.json:", e);
    }
  }
}

export default handleCommand;
