"use client";

import type React from "react";

import type { FileNode } from "@/types";
import { FiPlus, FiUsers } from "react-icons/fi";

interface SidebarForEditorProps {
  setIsCreating: (
    value: { parentId: string; type: "file" | "folder" } | null
  ) => void;
  renderFileTree: (nodes: FileNode[], level?: number) => React.ReactNode;
  isCreating: { parentId: string; type: "file" | "folder" } | null;
  fileSystem: FileNode[];
  setNewItemName: (name: string) => void;
  newItemName: string;
  createNewItem: (
    parentId: string,
    type: "file" | "folder",
    name: string
  ) => void;
  roomInfo?: {
    roomId: string;
    roomName: string;
    memberCount: number;
  };
}

export const SidebarForEditor = ({
  setIsCreating,
  renderFileTree,
  isCreating,
  fileSystem,
  setNewItemName,
  newItemName,
  createNewItem,
  roomInfo,
}: SidebarForEditorProps) => {
  return (
    <div className="w-80 bg-[#0a1f1a] border-r border-emerald-800 flex flex-col">
      {/* Room Info Header */}
      {roomInfo && (
        <div className="p-4 border-b border-emerald-800">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-emerald-400">
              Room: {roomInfo.roomName}
            </h3>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <FiUsers size={12} />
              <span>{roomInfo.memberCount}</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 font-mono">{roomInfo.roomId}</p>
        </div>
      )}

      {/* File Explorer Header */}
      <div className="flex items-center justify-between p-4 border-b border-emerald-800">
        <h3 className="text-sm font-semibold text-emerald-400">Explorer</h3>
        <div className="flex gap-1">
          <button
            onClick={() => setIsCreating({ parentId: "root", type: "file" })}
            className="p-1 hover:bg-emerald-800 rounded text-gray-400 hover:text-white transition-colors"
            title="New File"
          >
            <FiPlus size={14} />
          </button>
          <button
            onClick={() => setIsCreating({ parentId: "root", type: "folder" })}
            className="p-1 hover:bg-emerald-800 rounded text-gray-400 hover:text-white transition-colors"
            title="New Folder"
          >
            <FiPlus size={14} />
          </button>
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto">
        {fileSystem.length > 0 ? (
          renderFileTree(fileSystem)
        ) : (
          <div className="p-4 text-center text-gray-500">
            <p className="text-sm">No files yet</p>
            <p className="text-xs mt-1">Create your first file or folder</p>
          </div>
        )}

        {/* Root level creation */}
        {isCreating?.parentId === "root" && (
          <div className="flex items-center py-1.5 px-2 ml-2">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onBlur={() => {
                if (newItemName.trim()) {
                  createNewItem("root", isCreating.type, newItemName.trim());
                }
                setIsCreating(null);
                setNewItemName("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (newItemName.trim()) {
                    createNewItem("root", isCreating.type, newItemName.trim());
                  }
                  setIsCreating(null);
                  setNewItemName("");
                } else if (e.key === "Escape") {
                  setIsCreating(null);
                  setNewItemName("");
                }
              }}
              className="bg-emerald-700 text-white px-2 py-1 rounded text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder={`New ${isCreating.type}...`}
              autoFocus
            />
          </div>
        )}
      </div>
    </div>
  );
};
