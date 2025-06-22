import type { Terminal } from "xterm";
import type { FileNode } from "@/types";
import type { FirebaseFileSystemService } from "@/services";

export interface TerminalFileItem {
  name: string;
  type: "file" | "folder";
  parentId: string;
  content?: string;
  children?: TerminalFileItem[];
}

export const handleCommandWithFirebase = async (
  command: string,
  terminal: Terminal,
  setIsLoading: (loading: boolean) => void,
  fileSystem: FileNode[],
  createNewItem: (
    parentId: string,
    type: "file" | "folder",
    name: string
  ) => Promise<void>,
  setCurrentDirectory: (dir: string) => void,
  currentDirectory: string,
  firebaseService: FirebaseFileSystemService
) => {
  const args = command.split(" ");
  const cmd = args[0].toLowerCase();

  setIsLoading(true);

  try {
    switch (cmd) {
      case "npx":
        if (args[1] === "create-next-app" || args[1] === "create-react-app") {
          await handleProjectCreation(args, terminal, firebaseService);
        }
        break;

      case "mkdir":
        if (args[1]) {
          await createNewItem("root", "folder", args[1]);
          terminal.writeln(`\r\n📁 Created directory: ${args[1]}`);
        }
        break;

      case "touch":
        if (args[1]) {
          await createNewItem("root", "file", args[1]);
          terminal.writeln(`\r\n📄 Created file: ${args[1]}`);
        }
        break;

      case "git":
        await handleGitCommand(args, terminal, firebaseService);
        break;

      case "npm":
      case "yarn":
      case "pnpm":
        await handlePackageManager(args, terminal);
        break;

      case "ls":
      case "dir":
        listDirectory(fileSystem, terminal, currentDirectory);
        break;

      case "cd":
        if (args[1]) {
          setCurrentDirectory(args[1]);
          terminal.writeln(`\r\n📂 Changed directory to: ${args[1]}`);
        }
        break;

      case "clear":
      case "cls":
        terminal.clear();
        break;

      case "help":
        showHelp(terminal);
        break;

      default:
        terminal.writeln(`\r\n❌ Command not found: ${cmd}`);
        terminal.writeln("💡 Type 'help' for available commands");
    }
  } catch (error) {
    console.error("Terminal command error:", error);
    terminal.writeln(`\r\n❌ Error executing command: ${error}`);
  } finally {
    setIsLoading(false);
    terminal.write("\r\n\x1b[1;36m$\x1b[0m ");
  }
};

async function handleProjectCreation(
  args: string[],
  terminal: Terminal,
  firebaseService: FirebaseFileSystemService
) {
  const projectName = args[2] || "my-app";

  terminal.writeln(`\r\n🚀 Creating ${args[1]} project: ${projectName}`);
  terminal.writeln("📦 Downloading template...");

  // Simulate download progress
  for (let i = 0; i <= 100; i += 10) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    terminal.write(`\r⏳ Progress: ${i}%`);
  }

  terminal.writeln(`\r\n✅ Downloaded template`);
  terminal.writeln("📁 Creating project structure...");

  // Create project structure based on type
  let projectStructure: TerminalFileItem[];

  if (args[1] === "create-next-app") {
    projectStructure = createNextAppStructure(projectName);
  } else {
    projectStructure = createReactAppStructure(projectName);
  }

  // Create all files and folders in Firebase
  await createProjectStructure(projectStructure, firebaseService);

  terminal.writeln("✅ Project created successfully!");
  terminal.writeln(`📂 Project saved to Firebase: ${projectName}`);
  terminal.writeln(`\r\n🎉 Happy coding!`);
}

async function createProjectStructure(
  items: TerminalFileItem[],
  firebaseService: FirebaseFileSystemService
) {
  for (const item of items) {
    try {
      const newItem: Omit<FileNode, "id"> = {
        name: item.name,
        type: item.type,
        parentId: item.parentId,
        content: item.content || (item.type === "file" ? "" : undefined),
        isOpen: false,
      };

      const newId = await firebaseService.createItem(newItem);

      // If it has children, create them recursively
      if (item.children && item.children.length > 0) {
        const childItems = item.children.map((child) => ({
          ...child,
          parentId: newId,
        }));
        await createProjectStructure(childItems, firebaseService);
      }
    } catch (error) {
      console.error(`Error creating ${item.name}:`, error);
    }
  }
}

function createNextAppStructure(projectName: string): TerminalFileItem[] {
  return [
    {
      name: projectName,
      type: "folder",
      parentId: "root",
      children: [
        {
          name: "app",
          type: "folder",
          parentId: "",
          children: [
            {
              name: "globals.css",
              type: "file",
              parentId: "",
              content: `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n:root {\n  --foreground-rgb: 0, 0, 0;\n  --background-start-rgb: 214, 219, 220;\n  --background-end-rgb: 255, 255, 255;\n}\n\n@media (prefers-color-scheme: dark) {\n  :root {\n    --foreground-rgb: 255, 255, 255;\n    --background-start-rgb: 0, 0, 0;\n    --background-end-rgb: 0, 0, 0;\n  }\n}\n\nbody {\n  color: rgb(var(--foreground-rgb));\n  background: linear-gradient(\n      to bottom,\n      transparent,\n      rgb(var(--background-end-rgb))\n    )\n    rgb(var(--background-start-rgb));\n}`,
            },
            {
              name: "layout.tsx",
              type: "file",
              parentId: "",
              content: `import type { Metadata } from "next"\nimport { Inter } from 'next/font/google'\nimport "./globals.css"\n\nconst inter = Inter({ subsets: ["latin"] })\n\nexport const metadata: Metadata = {\n  title: "Create Next App",\n  description: "Generated by create next app",\n}\n\nexport default function RootLayout({\n  children,\n}: {\n  children: React.ReactNode\n}) {\n  return (\n    <html lang="en">\n      <body className={inter.className}>{children}</body>\n    </html>\n  )\n}`,
            },
            {
              name: "page.tsx",
              type: "file",
              parentId: "",
              content: `import Image from "next/image"\n\nexport default function Home() {\n  return (\n    <main className="flex min-h-screen flex-col items-center justify-between p-24">\n      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">\n        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">\n          Get started by editing&nbsp;\n          <code className="font-mono font-bold">app/page.tsx</code>\n        </p>\n      </div>\n\n      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-full sm:before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full sm:after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1]">\n        <Image\n          className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"\n          src="/next.svg"\n          alt="Next.js Logo"\n          width={180}\n          height={37}\n          priority\n        />\n      </div>\n    </main>\n  )\n}`,
            },
          ],
        },
        {
          name: "public",
          type: "folder",
          parentId: "",
          children: [
            {
              name: "next.svg",
              type: "file",
              parentId: "",
              content: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 394 80"><path fill="#000" d="M262 0h68.5v12.7h-27.2v66.6h-13.6V12.7H262V0ZM149 0v12.7H94v20.4h44.3v12.6H94v21h55v12.6H80.5V0h68.7zm34.3 0h-17.8l63.8 79.4h17.9l-32-39.7 32-39.6h-17.9l-23 28.6-23-28.6zm18.3 56.7-9-11-27.1 33.7h17.8l18.3-22.7z"/><path fill="#000" d="M81 79.3 17 0H0v79.3h13.6V17l50.2 62.3H81Zm252.6-.4c-1 0-1.8-.4-2.5-1s-1.1-1.6-1.1-2.6.3-1.8 1-2.5 1.6-1 2.6-1 1.8.3 2.5 1a3.4 3.4 0 0 1 .6 4.3c-.7.7-1.5 1.1-2.6 1.1z"/></svg>`,
            },
            {
              name: "vercel.svg",
              type: "file",
              parentId: "",
              content: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 283 64"><path fill="black" d="M141 16c-11 0-19 7-19 18s9 18 20 18c7 0 13-3 16-7l-7-5c-2 3-6 4-9 4-5 0-9-3-10-7h28v-3c0-11-8-18-19-18zm-9 15c1-4 4-7 9-7s8 3 9 7h-18zm117-15c-11 0-19 7-19 18s9 18 20 18c6 0 12-3 16-7l-8-5c-2 3-5 4-8 4-5 0-9-3-11-7h28l1-3c0-11-8-18-19-18zm-10 15c2-4 5-7 10-7s8 3 9 7h-19zm-39 3c0 6 4 10 10 10 4 0 7-2 9-5l8 5c-3 5-9 8-17 8-11 0-19-7-19-18s8-18 19-18c8 0 14 3 17 8l-8 5c-2-3-5-5-9-5-6 0-10 4-10 10zm83-29v46h-9V5h9zM37 0l37 64H0L37 0zm92 5-27 48L74 5h10l18 30 17-30h10zm59 12v10l-3-1c-6 0-10 4-10 10v15h-9V17h9v9c0-5 6-9 13-9z"/></svg>`,
            },
          ],
        },
        {
          name: "package.json",
          type: "file",
          parentId: "",
          content: `{\n  "name": "${projectName}",\n  "version": "0.1.0",\n  "private": true,\n  "scripts": {\n    "dev": "next dev",\n    "build": "next build",\n    "start": "next start",\n    "lint": "next lint"\n  },\n  "dependencies": {\n    "react": "^18",\n    "react-dom": "^18",\n    "next": "14.0.4"\n  },\n  "devDependencies": {\n    "typescript": "^5",\n    "@types/node": "^20",\n    "@types/react": "^18",\n    "@types/react-dom": "^18",\n    "autoprefixer": "^10.0.1",\n    "postcss": "^8",\n    "tailwindcss": "^3.3.0",\n    "eslint": "^8",\n    "eslint-config-next": "14.0.4"\n  }\n}`,
        },
        {
          name: "README.md",
          type: "file",
          parentId: "",
          content: `# ${projectName}\n\nThis is a [Next.js](https://nextjs.org/) project bootstrapped with [\`create-next-app\`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).\n\n## Getting Started\n\nFirst, run the development server:\n\n\`\`\`bash\nnpm run dev\n# or\nyarn dev\n# or\npnpm dev\n# or\nbun dev\n\`\`\`\n\nOpen [http://localhost:3000](http://localhost:3000) with your browser to see the result.\n\nYou can start editing the page by modifying \`app/page.tsx\`. The page auto-updates as you edit the file.\n\nThis project uses [\`next/font\`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.\n\n## Learn More\n\nTo learn more about Next.js, take a look at the following resources:\n\n- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.\n- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.\n\nYou can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!\n\n## Deploy on Vercel\n\nThe easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.\n\nCheck out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.`,
        },
        {
          name: "next.config.js",
          type: "file",
          parentId: "",
          content: `/** @type {import('next').NextConfig} */\nconst nextConfig = {}\n\nmodule.exports = nextConfig`,
        },
        {
          name: "tailwind.config.ts",
          type: "file",
          parentId: "",
          content: `import type { Config } from 'tailwindcss'\n\nconst config: Config = {\n  content: [\n    './pages/**/*.{js,ts,jsx,tsx,mdx}',\n    './components/**/*.{js,ts,jsx,tsx,mdx}',\n    './app/**/*.{js,ts,jsx,tsx,mdx}',\n  ],\n  theme: {\n    extend: {\n      backgroundImage: {\n        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',\n        'gradient-conic':\n          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',\n      },\n    },\n  },\n  plugins: [],\n}\nexport default config`,
        },
        {
          name: "tsconfig.json",
          type: "file",
          parentId: "",
          content: `{\n  "compilerOptions": {\n    "target": "es5",\n    "lib": ["dom", "dom.iterable", "es6"],\n    "allowJs": true,\n    "skipLibCheck": true,\n    "strict": true,\n    "noEmit": true,\n    "esModuleInterop": true,\n    "module": "esnext",\n    "moduleResolution": "bundler",\n    "resolveJsonModule": true,\n    "isolatedModules": true,\n    "jsx": "preserve",\n    "incremental": true,\n    "plugins": [\n      {\n        "name": "next"\n      }\n    ],\n    "paths": {\n      "@/*": ["./*"]\n    }\n  },\n  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],\n  "exclude": ["node_modules"]\n}`,
        },
      ],
    },
  ];
}

function createReactAppStructure(projectName: string): TerminalFileItem[] {
  return [
    {
      name: projectName,
      type: "folder",
      parentId: "root",
      children: [
        {
          name: "src",
          type: "folder",
          parentId: "",
          children: [
            {
              name: "App.tsx",
              type: "file",
              parentId: "",
              content: `import React from 'react';\nimport './App.css';\n\nfunction App() {\n  return (\n    <div className="App">\n      <header className="App-header">\n        <p>\n          Edit <code>src/App.tsx</code> and save to reload.\n        </p>\n        <a\n          className="App-link"\n          href="https://reactjs.org"\n          target="_blank"\n          rel="noopener noreferrer"\n        >\n          Learn React\n        </a>\n      </header>\n    </div>\n  );\n}\n\nexport default App;`,
            },
            {
              name: "App.css",
              type: "file",
              parentId: "",
              content: `.App {\n  text-align: center;\n}\n\n.App-header {\n  background-color: #282c34;\n  padding: 20px;\n  color: white;\n}\n\n.App-link {\n  color: #61dafb;\n}`,
            },
            {
              name: "index.tsx",
              type: "file",
              parentId: "",
              content: `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport './index.css';\nimport App from './App';\n\nconst root = ReactDOM.createRoot(\n  document.getElementById('root') as HTMLElement\n);\nroot.render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);`,
            },
            {
              name: "index.css",
              type: "file",
              parentId: "",
              content: `body {\n  margin: 0;\n  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',\n    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',\n    sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n}\n\ncode {\n  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',\n    monospace;\n}`,
            },
          ],
        },
        {
          name: "public",
          type: "folder",
          parentId: "",
          children: [
            {
              name: "index.html",
              type: "file",
              parentId: "",
              content: `<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="utf-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1" />\n    <meta name="theme-color" content="#000000" />\n    <meta name="description" content="Web site created using create-react-app" />\n    <title>React App</title>\n  </head>\n  <body>\n    <noscript>You need to enable JavaScript to run this app.</noscript>\n    <div id="root"></div>\n  </body>\n</html>`,
            },
          ],
        },
        {
          name: "package.json",
          type: "file",
          parentId: "",
          content: `{\n  "name": "${projectName}",\n  "version": "0.1.0",\n  "private": true,\n  "dependencies": {\n    "@testing-library/jest-dom": "^5.16.4",\n    "@testing-library/react": "^13.3.0",\n    "@testing-library/user-event": "^13.5.0",\n    "@types/jest": "^27.5.2",\n    "@types/node": "^16.11.56",\n    "@types/react": "^18.0.17",\n    "@types/react-dom": "^18.0.6",\n    "react": "^18.2.0",\n    "react-dom": "^18.2.0",\n    "react-scripts": "5.0.1",\n    "typescript": "^4.7.4",\n    "web-vitals": "^2.1.4"\n  },\n  "scripts": {\n    "start": "react-scripts start",\n    "build": "react-scripts build",\n    "test": "react-scripts test",\n    "eject": "react-scripts eject"\n  },\n  "eslintConfig": {\n    "extends": [\n      "react-app",\n      "react-app/jest"\n    ]\n  },\n  "browserslist": {\n    "production": [\n      ">0.2%",\n      "not dead",\n      "not op_mini all"\n    ],\n    "development": [\n      "last 1 chrome version",\n      "last 1 firefox version",\n      "last 1 safari version"\n    ]\n  }\n}`,
        },
      ],
    },
  ];
}

async function handleGitCommand(
  args: string[],
  terminal: Terminal,
  firebaseService: FirebaseFileSystemService
) {
  const subCommand = args[1];

  switch (subCommand) {
    case "init":
      terminal.writeln("\r\n🔧 Initializing git repository...");
      await firebaseService.createItem({
        name: ".git",
        type: "folder",
        parentId: "root",
        isOpen: false,
      });
      terminal.writeln("✅ Initialized empty Git repository");
      break;

    case "clone":
      if (args[2]) {
        const repoUrl = args[2];
        const repoName =
          repoUrl.split("/").pop()?.replace(".git", "") || "cloned-repo";
        terminal.writeln(`\r\n📥 Cloning ${repoUrl}...`);
        terminal.writeln("⏳ This might take a while...");

        // Simulate cloning progress
        for (let i = 0; i <= 100; i += 20) {
          await new Promise((resolve) => setTimeout(resolve, 200));
          terminal.write(`\r📊 Progress: ${i}%`);
        }

        // Create basic cloned repo structure
        await firebaseService.createItem({
          name: repoName,
          type: "folder",
          parentId: "root",
          isOpen: false,
        });

        terminal.writeln(`\r\n✅ Repository cloned: ${repoName}`);
      }
      break;

    default:
      terminal.writeln(`\r\n💡 Git command: ${args.join(" ")}`);
      terminal.writeln("📝 Note: This is a simulated git environment");
  }
}

async function handlePackageManager(args: string[], terminal: Terminal) {
  const manager = args[0];
  const command = args[1];

  terminal.writeln(`\r\n📦 Running ${manager} ${command}...`);

  switch (command) {
    case "install":
    case "i":
      terminal.writeln("⏳ Installing dependencies...");
      for (let i = 0; i <= 100; i += 25) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        terminal.write(`\r📊 Installing: ${i}%`);
      }
      terminal.writeln("\r\n✅ Dependencies installed successfully!");
      break;

    case "start":
    case "dev":
      terminal.writeln("🚀 Starting development server...");
      terminal.writeln("📱 Local: http://localhost:3000");
      terminal.writeln("🌐 Network: http://192.168.1.100:3000");
      break;

    case "build":
      terminal.writeln("🏗️  Building for production...");
      for (let i = 0; i <= 100; i += 20) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        terminal.write(`\r🔨 Building: ${i}%`);
      }
      terminal.writeln("\r\n✅ Build completed successfully!");
      break;

    default:
      terminal.writeln(`💡 ${manager} ${command} executed`);
  }
}

function listDirectory(
  fileSystem: FileNode[],
  terminal: Terminal,
  currentDirectory: string
) {
  terminal.writeln(`\r\n📁 Directory listing for ${currentDirectory}:`);

  if (fileSystem.length === 0) {
    terminal.writeln("📂 (empty directory)");
    return;
  }

  fileSystem.forEach((item) => {
    const icon = item.type === "folder" ? "📁" : "📄";
    terminal.writeln(`${icon} ${item.name}`);
  });
}

function showHelp(terminal: Terminal) {
  terminal.writeln("\r\n🔧 Available Commands:");
  terminal.writeln("📦 npx create-next-app <name> - Create Next.js project");
  terminal.writeln("📦 npx create-react-app <name> - Create React project");
  terminal.writeln("📁 mkdir <name> - Create directory");
  terminal.writeln("📄 touch <name> - Create file");
  terminal.writeln("📋 ls/dir - List directory contents");
  terminal.writeln("📂 cd <path> - Change directory");
  terminal.writeln("🔧 git init - Initialize git repository");
  terminal.writeln("📥 git clone <url> - Clone repository");
  terminal.writeln("📦 npm/yarn/pnpm install - Install dependencies");
  terminal.writeln("🚀 npm/yarn/pnpm start - Start development server");
  terminal.writeln("🏗️  npm/yarn/pnpm build - Build for production");
  terminal.writeln("🧹 clear/cls - Clear terminal");
  terminal.writeln("❓ help - Show this help message");
}
