import { getFileIcon } from "@/data";
import { OpenFile } from "@/types";
import { FC, SetStateAction } from "react";
import { FiX } from "react-icons/fi";

interface TabsForEditorProps {
  openFiles: OpenFile[];
  activeFileId: string | null;
  setActiveFileId: (value: SetStateAction<string | null>) => void;
  closeFile: (id: string) => void;
}

const TabsForEditor: FC<TabsForEditorProps> = ({
  openFiles,
  activeFileId,
  setActiveFileId,
  closeFile,
}) => {
  return (
    <div>
      {openFiles.length > 0 && (
        <div className="flex bg-emerald-900/50 border-b border-gray-700 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          {openFiles.map((file) => (
            <div
              key={file.id}
              className={`flex items-center px-4 py-3 border-r border-emerald-900 cursor-pointer min-w-0 transition-colors duration-150 ${
                activeFileId === file.id
                  ? "bg-emerald-900/50 border-t-4 border-t-emerald-500"
                  : "bg-emerald-900/20 hover:bg-gray-750"
              }`}
              onClick={() => setActiveFileId(file.id)}
            >
              {getFileIcon(file.name)}
              <span className="text-sm truncate mr-3 text-gray-200 font-medium">
                {file.name}
              </span>
              {file.isDirty && (
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  closeFile(file.id);
                }}
                className="p-1 hover:bg-emerald-800 rounded transition-colors duration-150"
              >
                <FiX size={14} className="text-gray-400" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TabsForEditor;
