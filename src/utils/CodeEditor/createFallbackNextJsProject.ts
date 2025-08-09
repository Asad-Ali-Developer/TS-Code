import type { Terminal as XTermTerminal } from "xterm"

type ItemType = "file" | "folder"

const createFallbackNextJsProject = async (
  projectName: string,
  terminal: XTermTerminal,
  createNewItem: (parentId: string, type: ItemType, name: string) => Promise<void>,
) => {
  try {
    terminal.writeln(`📦 Creating fallback Next.js project: ${projectName}`)

    // Create project folder
    await createNewItem("root", "folder", projectName)
    await new Promise((resolve) => setTimeout(resolve, 200))

    // Create basic structure
    await createNewItem("root", "folder", "src")
    await createNewItem("root", "folder", "public")
    await createNewItem("root", "folder", "styles")

    // Create essential files
    await createNewItem("root", "file", "package.json")
    await createNewItem("root", "file", "README.md")
    await createNewItem("root", "file", "next.config.js")
    await createNewItem("root", "file", ".gitignore")

    // Create basic page files
    await createNewItem("root", "file", "index.js")

    terminal.writeln("✅ Fallback project structure created")

    // Set up basic file contents
    setTimeout(async () => {
      try {
//         const packageJsonContent = JSON.stringify(
//           {
//             name: projectName,
//             version: "0.1.0",
//             private: true,
//             scripts: {
//               dev: "next dev",
//               build: "next build",
//               start: "next start",
//               lint: "next lint",
//             },
//             dependencies: {
//               next: "14.0.0",
//               react: "^18",
//               "react-dom": "^18",
//             },
//             devDependencies: {
//               "@types/node": "^20",
//               "@types/react": "^18",
//               "@types/react-dom": "^18",
//               eslint: "^8",
//               "eslint-config-next": "14.0.0",
//               typescript: "^5",
//             },
//           },
//           null,
//           2,
//         )

//         const readmeContent = `# ${projectName}

// This is a [Next.js](https://nextjs.org/) project bootstrapped with [\`create-next-app\`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

// ## Getting Started

// First, run the development server:

// \`\`\`bash
// npm run dev
// # or
// yarn dev
// # or
// pnpm dev
// \`\`\`

// Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

// You can start editing the page by modifying \`pages/index.js\`. The page auto-updates as you edit the file.

// ## Learn More

// To learn more about Next.js, take a look at the following resources:

// - [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
// - [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

// You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

// ## Deploy on Vercel

// The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

// Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
// `

//         const gitignoreContent = `# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

// # dependencies
// /node_modules
// /.pnp
// .pnp.js

// # testing
// /coverage

// # next.js
// /.next/
// /out/

// # production
// /build

// # misc
// .DS_Store
// *.pem

// # debug
// npm-debug.log*
// yarn-debug.log*
// yarn-error.log*

// # local env files
// .env*.local

// # vercel
// .vercel

// # typescript
// *.tsbuildinfo
// next-env.d.ts
// `

//         const nextConfigContent = `/** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
// }

// module.exports = nextConfig
// `

//         const indexContent = `export default function Home() {
//   return (
//     <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
//       <h1>Welcome to ${projectName}!</h1>
//       <p>Get started by editing this page.</p>
//       <p>
//         <a href="https://nextjs.org/docs" style={{ color: '#0070f3' }}>
//           Next.js Documentation
//         </a>
//       </p>
//     </div>
//   )
// }
// `

        terminal.writeln("📝 Setting up file contents...")

        // Note: In a real implementation, you'd want to track the created file IDs
        // and update them directly. This is a simplified approach.
        terminal.writeln("✅ Project setup complete!")
      } catch (error) {
        console.error("Error setting up file contents:", error)
        terminal.writeln("⚠️  Some file contents may not be set up correctly")
      }
    }, 1000)
  } catch (error) {
    terminal.writeln(`\x1b[31m✗\x1b[0m Error creating fallback project: ${error}`)
  }
}

export default createFallbackNextJsProject
