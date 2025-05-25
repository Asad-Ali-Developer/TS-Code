import { FileNode } from "@/types";
import { Dispatch, SetStateAction } from "react";
import fetchNpmPackageInfo from "./fetchNPMPackInfo";
import findPackageJson from "./findPackagJson";
import createNextJsProject from "./createNextJsProject";

type ItemType = "file" | "folder";

const handleCommand = async (
  command: string,
  terminal: any,
  setIsLoading: Dispatch<SetStateAction<boolean>>,
  fileSystem: FileNode[],
  setFileSystem: Dispatch<SetStateAction<FileNode[]>>,
  createNewItem: (parentId: string, type: ItemType, name: string) => void,
  setCurrentDirectory: (value: SetStateAction<string>) => void,
  currentDirectory: string
) => {
  setIsLoading(true);
  terminal.write("\r\n");

  const args = command.split(" ");
  const cmd = args[0].toLowerCase();

  try {
    switch (cmd) {
      case "help":
        terminal.writeln("📚 \x1b[1;33mAvailable Commands:\x1b[0m");
        terminal.writeln(
          "  \x1b[36mnpx create-next-app <name>\x1b[0m - Create real Next.js app from GitHub"
        );
        terminal.writeln(
          "  \x1b[36mnpx create-react-app <name>\x1b[0m - Create React app"
        );
        terminal.writeln(
          "  \x1b[36mnpm install / npm i\x1b[0m       - Install all dependencies"
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
          "  \x1b[36mnpm search <query>\x1b[0m        - Search npm packages"
        );
        terminal.writeln(
          "  \x1b[36mnpm audit\x1b[0m                 - Check vulnerabilities"
        );
        terminal.writeln(
          "  \x1b[36mpip install <package>\x1b[0m     - Install Python package"
        );
        terminal.writeln(
          "  \x1b[36myarn install\x1b[0m              - Install with Yarn"
        );
        terminal.writeln(
          "  \x1b[36mls\x1b[0m / \x1b[36mdir\x1b[0m                - List directory contents"
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
        terminal.writeln("");
        terminal.writeln(
          "🌐 \x1b[1;32mThis terminal fetches real data from the internet!\x1b[0m"
        );
        break;

      case "npx":
        if (args[1] === "create-next-app") {
          const projectName = args[2] || "my-next-app";
          await createNextJsProject(projectName, terminal, setFileSystem);
        } else if (args[1] === "create-react-app") {
          const projectName = args[2] || "my-react-app";
          terminal.writeln(`🚀 Creating a new React app in ./${projectName}`);
          terminal.writeln(
            "📦 This would create a React app (Next.js template used for demo)"
          );
          await createNextJsProject(projectName, terminal, setFileSystem);
        } else {
          terminal.writeln(
            `\x1b[31m✗\x1b[0m npx: command '${args[1]}' not found`
          );
          terminal.writeln("Try: npx create-next-app <project-name>");
        }
        break;

      case "yarn":
        if (args[1] === "install" || args[1] === "add") {
          const packageName = args[2] || "dependencies";
          terminal.writeln(`🧶 Yarn install ${packageName}...`);
          await new Promise((resolve) => setTimeout(resolve, 1500));
          terminal.writeln(`\x1b[32m✓\x1b[0m Done in 2.34s.`);
        } else {
          terminal.writeln("Usage: yarn install | yarn add <package>");
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

              setFileSystem((prev) => {
                const newFileSystem = [...prev];
                const packageJsonIndex = newFileSystem.findIndex(
                  (node) => node.name === "package.json"
                );

                if (packageJsonIndex !== -1) {
                  try {
                    const packageJson = JSON.parse(
                      newFileSystem[packageJsonIndex].content || "{}"
                    );
                    packageJson.dependencies = packageJson.dependencies || {};
                    packageJson.dependencies[
                      packageName
                    ] = `^${packageInfo.version}`;

                    newFileSystem[packageJsonIndex] = {
                      ...newFileSystem[packageJsonIndex],
                      content: JSON.stringify(packageJson, null, 2),
                    };
                  } catch (error) {
                    console.error("Error updating package.json:", error);
                  }
                }
                return newFileSystem;
              });
            } else {
              terminal.writeln(
                `\x1b[31m✗\x1b[0m Package '${packageName}' not found`
              );
            }
          } else {
            // Install all dependencies from package.json
            terminal.writeln("📦 Installing dependencies from package.json...");

            // Find package.json in current directory or any project folder
            let packageJsonNode = null;

            packageJsonNode = findPackageJson(fileSystem);

            if (!packageJsonNode || !packageJsonNode.content) {
              terminal.writeln(
                "\x1b[31m✗\x1b[0m No package.json found in current directory"
              );
              terminal.writeln(
                "Run \x1b[36mnpm init\x1b[0m to create a package.json file"
              );
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
                terminal.writeln(
                  "\x1b[32m✓\x1b[0m up to date, audited 0 packages in 0.5s"
                );
                break;
              }

              terminal.writeln(`Found ${depCount} dependencies to install:`);

              // Show dependencies being installed
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

              // Simulate installation progress
              await new Promise((resolve) => setTimeout(resolve, 1000));
              terminal.writeln("🔧 Building fresh packages...");

              await new Promise((resolve) => setTimeout(resolve, 1500));
              terminal.writeln("📝 Writing lock file...");

              await new Promise((resolve) => setTimeout(resolve, 500));

              // Create node_modules folder and package-lock.json
              const projectNode = fileSystem.find((node) =>
                node.children?.some((child) => child.name === "package.json")
              );

              if (projectNode) {
                setFileSystem((prev) => {
                  return prev.map((node) => {
                    if (node.id === projectNode.id) {
                      const hasNodeModules = node.children?.some(
                        (child) => child.name === "node_modules"
                      );
                      const hasPackageLock = node.children?.some(
                        (child) => child.name === "package-lock.json"
                      );

                      const newChildren = [...(node.children || [])];

                      if (!hasNodeModules) {
                        newChildren.push({
                          id: `${Date.now()}-node-modules`,
                          name: "node_modules",
                          type: "folder",
                          parentId: node.id,
                          children: [],
                          isOpen: false,
                        });
                      }

                      if (!hasPackageLock) {
                        newChildren.push({
                          id: `${Date.now()}-package-lock`,
                          name: "package-lock.json",
                          type: "file",
                          parentId: node.id,
                          content: JSON.stringify(
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
                                  devDependencies:
                                    packageJson.devDependencies || {},
                                },
                              },
                            },
                            null,
                            2
                          ),
                        });
                      }

                      return { ...node, children: newChildren };
                    }
                    return node;
                  });
                });
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
              terminal.writeln("\x1b[31m✗\x1b[0m Error parsing package.json");
              terminal.writeln("Make sure package.json contains valid JSON");
            }
          }
        } else if (args[1] === "init") {
          terminal.writeln("📝 Creating package.json...");

          const projectName = "my-project";
          const packageJsonContent = JSON.stringify(
            {
              name: projectName,
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

          createNewItem("root", "file", "package.json");

          // Update the created package.json with content
          setTimeout(() => {
            setFileSystem((prev) => {
              return prev.map((node) => {
                if (node.name === "package.json" && node.type === "file") {
                  return { ...node, content: packageJsonContent };
                }
                return node;
              });
            });
          }, 100);

          terminal.writeln("\x1b[32m✓\x1b[0m Created package.json");
        } else if (args[1] === "run" && args[2]) {
          const script = args[2];
          terminal.writeln(`🚀 Running script: ${script}`);

          // Find package.json and check for scripts
          const packageJsonNode = fileSystem.find(
            (node) => node.name === "package.json"
          );
          if (packageJsonNode?.content) {
            try {
              const packageJson = JSON.parse(packageJsonNode.content);
              const scripts = packageJson.scripts || {};

              if (scripts[script]) {
                terminal.writeln(
                  `> ${packageJson.name || "project"}@${
                    packageJson.version || "1.0.0"
                  } ${script}`
                );
                terminal.writeln(`> ${scripts[script]}`);
                terminal.writeln("");

                // Simulate script execution
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
              terminal.writeln("\x1b[31m✗\x1b[0m Error reading package.json");
            }
          } else {
            terminal.writeln("\x1b[31m✗\x1b[0m No package.json found");
          }
        } else if (args[1] === "search" && args[2]) {
          const query = args.slice(2).join(" ");
          terminal.writeln(`🔍 Searching npm for '${query}'...`);

          try {
            const response = await fetch(
              `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(
                query
              )}&size=5`
            );
            const data = await response.json();

            if (data.objects && data.objects.length > 0) {
              terminal.writeln(
                `\x1b[33mFound ${data.objects.length} packages:\x1b[0m`
              );
              data.objects.forEach((pkg: any, index: number) => {
                terminal.writeln(
                  `  ${index + 1}. \x1b[36m${pkg.package.name}\x1b[0m@${
                    pkg.package.version
                  }`
                );
                terminal.writeln(
                  `     ${pkg.package.description || "No description"}`
                );
              });
            } else {
              terminal.writeln(
                `\x1b[31mNo packages found for '${query}'\x1b[0m`
              );
            }
          } catch (error) {
            terminal.writeln(`\x1b[31m✗\x1b[0m Error searching packages`);
          }
        } else if (args[1] === "fund") {
          terminal.writeln("💰 Funding information:");
          terminal.writeln("Some packages are looking for funding.");
          terminal.writeln(
            "Visit https://github.com/sponsors to support open source projects."
          );
        } else if (args[1] === "audit") {
          terminal.writeln("🔍 Auditing packages for vulnerabilities...");
          await new Promise((resolve) => setTimeout(resolve, 1500));
          terminal.writeln("✓ found 0 vulnerabilities");
          terminal.writeln("📊 Scanned 0 packages for known vulnerabilities");
        } else {
          terminal.writeln("Usage:");
          terminal.writeln("  npm install [package]  - Install package(s)");
          terminal.writeln("  npm i [package]        - Shorthand for install");
          terminal.writeln("  npm init               - Create package.json");
          terminal.writeln("  npm run <script>       - Run package script");
          terminal.writeln("  npm search <query>     - Search packages");
          terminal.writeln("  npm fund               - Show funding info");
          terminal.writeln(
            "  npm audit              - Check for vulnerabilities"
          );
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
          createNewItem("root", "file", fileName);
          terminal.writeln(`\x1b[32m✓\x1b[0m Created file '${fileName}'`);
        } else {
          terminal.writeln("Usage: touch <filename>");
        }
        break;

      case "mkdir":
        if (args[1]) {
          const dirName = args[1];
          createNewItem("root", "folder", dirName);
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
        terminal.writeln("🚀 \x1b[1;35mAdvanced Web Terminal\x1b[0m");
        terminal.writeln("📦 Real project creation with GitHub templates!");
        terminal.writeln("💡 Type 'help' for available commands");
        terminal.writeln("🌐 Fetches real data from the internet");
        break;

      case "node":
        if (args[1] === "-v" || args[1] === "--version") {
          terminal.writeln("v18.17.0");
        } else {
          terminal.writeln("Usage: node -v");
        }
        break;

      case "python":
        if (args[1] === "--version") {
          terminal.writeln("Python 3.11.0");
        } else {
          terminal.writeln("Usage: python --version");
        }
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

export default handleCommand;
