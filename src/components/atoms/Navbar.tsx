"use client";

import { useAuth } from "@/providers";
import { Code, GitBranch, Menu, Save, Settings, Share2 } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { userDetails } = useAuth();

  const isLoggedIn = userDetails?.uid ? true : false;

  return (
    <header className="flex h-20 items-center justify-between bg-transparent px-4 md:px-8 lg:px-28">
      {/* Left Side */}
      <div className="flex items-center gap-2">
        {/* Mobile Menu Button */}
        <button
          type="button"
          className="p-1 text-zinc-300 hover:text-zinc-100 focus:outline-none md:hidden"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => {
            router.push("/");
            setMobileMenuOpen(false);
          }}
        >
          <Code className="h-5 w-5 text-emerald-500" />
          <span className="text-lg font-semibold tracking-tight">CodeSync</span>
        </div>
      </div>

      {/* Desktop Right Side */}
      {isLoggedIn ? (
        <div className="hidden md:flex items-center gap-2">
          {/* Branch Button */}
          <div className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-zinc-300 hover:bg-emerald-800/60 hover:text-zinc-100">
            <GitBranch className="h-4 w-4" />
            <span>main</span>
          </div>

          {/* Save Button */}
          <button className="p-1 text-zinc-300 hover:text-zinc-100 focus:outline-none">
            <Save className="h-5 w-5" />
          </button>

          {/* Dropdown Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="p-1 text-zinc-400 hover:text-zinc-100 focus:outline-none"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-zinc-900 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(false)}
                    className="block w-full px-4 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
                  >
                    Editor Settings
                  </button>
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(false)}
                    className="block w-full px-4 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
                  >
                    User Preferences
                  </button>
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(false)}
                    className="block w-full px-4 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
                  >
                    Keyboard Shortcuts
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Share Button */}
          <button className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700 focus:outline-none">
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/signin")}
            className="block w-full px-4 py-2 text-left text-sm text-emerald-400 hover:text-emerald-500 font-semibold"
          >
            Signin
          </button>
          <button
            type="button"
            onClick={() => router.push("/signup")}
            className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700 focus:outline-none transition-colors"
          >
            SignUp
          </button>
        </div>
      )}

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-40"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Drawer */}
          <div className="relative ml-auto w-64 max-w-full bg-zinc-900 shadow-lg h-full flex flex-col p-4 gap-4">
            <div className="flex items-center justify-between mb-4">
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => {
                  router.push("/");
                  setMobileMenuOpen(false);
                }}
              >
                <Code className="h-5 w-5 text-emerald-500" />
                <span className="text-lg font-semibold tracking-tight">
                  CodeSync
                </span>
              </div>
              <button
                className="p-1 text-zinc-300 hover:text-zinc-100"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <Menu className="h-5 w-5 rotate-90" />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {isLoggedIn ? (
                <>
                  {/* Branch Button */}
                  <div className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-zinc-300 hover:bg-emerald-800/60 hover:text-zinc-100">
                    <GitBranch className="h-4 w-4" />
                    <span>main</span>
                  </div>
                  {/* Save Button */}
                  <button className="flex items-center gap-2 p-1 text-zinc-300 hover:text-zinc-100 focus:outline-none">
                    <Save className="h-5 w-5" />
                    <span>Save</span>
                  </button>
                  {/* Settings Dropdown (as list) */}
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-zinc-500 px-2">Settings</span>
                    <button
                      type="button"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full px-4 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    >
                      Editor Settings
                    </button>
                    <button
                      type="button"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full px-4 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    >
                      User Preferences
                    </button>
                    <button
                      type="button"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full px-4 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    >
                      Keyboard Shortcuts
                    </button>
                  </div>
                  {/* Share Button */}
                  <button className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700 focus:outline-none mt-2">
                    <Share2 className="h-4 w-4" />
                    <span>Share</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      router.push("/signin");
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full px-4 py-2 text-left text-sm text-emerald-400 hover:text-emerald-500 font-semibold"
                  >
                    Signin
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      router.push("/signup");
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700 focus:outline-none transition-colors"
                  >
                    SignUp
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
