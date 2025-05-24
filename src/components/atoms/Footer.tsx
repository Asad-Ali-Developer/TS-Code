import { Github, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full bg-emerald-950/30 text-zinc-300 px-4 py-4 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Brand */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-emerald-400 text-lg">
            CodeSync
          </span>
          <span className="text-xs text-zinc-500 hidden sm:inline">
            Realtime Collaborative Code Editor
          </span>
        </div>
        {/* Center: Links */}
        <div className="flex gap-4 text-sm">
          <a href="/about" className="hover:text-emerald-400 transition">
            About
          </a>
          <a href="/privacy" className="hover:text-emerald-400 transition">
            Privacy
          </a>
          <a href="/terms" className="hover:text-emerald-400 transition">
            Terms
          </a>
        </div>
        {/* Right: Socials */}
        <div className="flex gap-3">
          <a
            href="https://github.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
          >
            <Github className="h-5 w-5 hover:text-emerald-400 transition" />
          </a>
          <a
            href="https://twitter.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
          >
            <Twitter className="h-5 w-5 hover:text-emerald-400 transition" />
          </a>
          <a
            href="https://linkedin.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
          >
            <Linkedin className="h-5 w-5 hover:text-emerald-400 transition" />
          </a>
        </div>
      </div>
      <div className="mt-4 text-xs text-center text-zinc-500">
        &copy; {new Date().getFullYear()} CodeSync. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
