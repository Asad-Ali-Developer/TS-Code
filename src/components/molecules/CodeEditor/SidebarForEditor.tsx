import { FileNode } from "@/types";
import React, { FC, JSX, SetStateAction } from "react";
import {
  FiFolder,
  FiFilePlus,
  FiFolderPlus,
  FiRefreshCw,
  FiFile,
} from "react-icons/fi";

type FileType = "file" | "folder";

interface SidebarForEditorProps {
  setIsCreating: (
    value: SetStateAction<{
      parentId: string;
      type: FileType;
    } | null>
  ) => void;
  renderFileTree: (nodes: FileNode[], level?: number) => JSX.Element[];
  isCreating: {
    parentId: string;
    type: FileType;
  } | null;
  setNewItemName: (value: SetStateAction<string>) => void;
  newItemName: string;
  createNewItem: (parentId: string, type: FileType, name: string) => void;
  fileSystem: FileNode[];
}

const SidebarForEditor: FC<SidebarForEditorProps> = ({
  setIsCreating,
  renderFileTree,
  isCreating,
  setNewItemName,
  newItemName,
  createNewItem,
  fileSystem,
}) => {
  return (
    <div>
      <div className="w-80 bg-emerald-950/90 border-r border-gray-700 flex flex-col shadow-xl h-screen">
        <div className="p-4 border-b border-emerald-950 bg-gradient-to-r from-emerald-950 to-emerald-950">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-200 flex items-center">
              <FiFolder className="mr-2 text-emerald-500" />
              EXPLORER
            </h2>
            <div className="flex space-x-1">
              <button
                type="button"
                onClick={() =>
                  setIsCreating({ parentId: "root", type: "file" })
                }
                className="p-2 hover:bg-emerald-900 rounded-lg transition-colors duration-150"
                title="New File"
              >
                <FiFilePlus
                  size={16}
                  className="text-gray-400"
                />
              </button>
              <button
                type="button"
                onClick={() =>
                  setIsCreating({ parentId: "root", type: "folder" })
                }
                className="p-2 hover:bg-emerald-900 rounded-lg transition-colors duration-150"
                title="New Folder"
              >
                <FiFolderPlus
                  size={16}
                  className="text-gray-400"
                />
              </button>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem("vscode-filesystem");
                  window.location.reload();
                }}
                className="p-2 hover:bg-emerald-900 rounded-lg transition-colors duration-150"
                title="Refresh"
              >
                <FiRefreshCw
                  size={16}
                  className="text-gray-400"
                />
              </button>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          {renderFileTree(fileSystem)}
          {isCreating?.parentId === "root" && (
            <div className="flex items-center py-1.5 px-2">
              {isCreating.type === "folder" ? (
                <FiFolder className="mr-2 text-emerald-500" size={16} />
              ) : (
                <FiFile className="mr-2 text-emerald-500" size={16} />
              )}
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
                      createNewItem(
                        "root",
                        isCreating.type,
                        newItemName.trim()
                      );
                    }
                    setIsCreating(null);
                    setNewItemName("");
                  } else if (e.key === "Escape") {
                    setIsCreating(null);
                    setNewItemName("");
                  }
                }}
                className="bg-emerald-900 text-white px-2 py-1 rounded text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder={`New ${isCreating.type}...`}
                autoFocus
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SidebarForEditor;
