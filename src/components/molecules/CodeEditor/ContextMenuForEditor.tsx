import { FileNode } from "@/types";
import { FC, SetStateAction } from "react";
import { FiEdit3, FiTrash2, FiFilePlus, FiFolderPlus } from "react-icons/fi";

type FileType = "file" | "folder";

interface Context {
  x: number;
  y: number;
  nodeId: string;
  type: FileType;
}

interface IsCreating {
  parentId: string;
  type: FileType;
}

interface ContextMenuForEditorProps {
  contextMenu: Context;
  setContextMenu: (value: SetStateAction<Context | null>) => void;
  setIsRenaming: (value: SetStateAction<string | null>) => void;
  findFileById: (id: string, nodes?: FileNode[]) => FileNode | null;
  setRenameValue: (value: SetStateAction<string>) => void;
  deleteItem: (id: string) => void;
  setIsCreating: (value: SetStateAction<IsCreating | null>) => void;
}

const ContextMenuForEditor: FC<ContextMenuForEditorProps> = ({
  contextMenu,
  setContextMenu,
  setIsRenaming,
  setRenameValue,
  deleteItem,
  setIsCreating,
  findFileById,
}) => {
  return (
    <div>
      {" "}
      <div
        className="fixed bg-emerald-950 border border-gray-600 rounded-lg shadow-xl py-2 z-50 min-w-48"
        style={{ left: contextMenu.x, top: contextMenu.y }}
        onBlur={() => setContextMenu(null)}
      >
        <button
          type="button"
          className="w-full px-4 py-2 text-left text-sm hover:bg-emerald-900 transition-colors flex items-center text-gray-200"
          onClick={() => {
            setIsRenaming(contextMenu.nodeId);
            const node = findFileById(contextMenu.nodeId);
            if (node) setRenameValue(node.name);
            setContextMenu(null);
          }}
        >
          <FiEdit3 size={16} className="mr-3 text-emerald-500" />
          Rename
        </button>
        <button
          type="button"
          className="w-full px-4 py-2 text-left text-sm hover:bg-emerald-900 transition-colors flex items-center text-gray-200"
          onClick={() => {
            deleteItem(contextMenu.nodeId);
            setContextMenu(null);
          }}
        >
          <FiTrash2 size={16} className="mr-3 text-emerald-500" />
          Delete
        </button>
        {contextMenu.type === "folder" && (
          <>
            <hr className="border-gray-600 my-2" />
            <button
              type="button"
              className="w-full px-4 py-2 text-left text-sm hover:bg-emerald-900 transition-colors flex items-center text-gray-200"
              onClick={() => {
                setIsCreating({ parentId: contextMenu.nodeId, type: "file" });
                setContextMenu(null);
              }}
            >
              <FiFilePlus size={16} className="mr-3 text-emerald-500" />
              New File
            </button>
            <button
              type="button"
              className="w-full px-4 py-2 text-left text-sm hover:bg-emerald-900 transition-colors flex items-center text-gray-200"
              onClick={() => {
                setIsCreating({
                  parentId: contextMenu.nodeId,
                  type: "folder",
                });
                setContextMenu(null);
              }}
            >
              <FiFolderPlus size={16} className="mr-3 text-emerald-500" />
              New Folder
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ContextMenuForEditor;
