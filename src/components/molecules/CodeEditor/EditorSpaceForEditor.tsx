import { FC, RefObject } from "react";
import { FiFile, FiFolder, FiSettings, FiTerminal } from "react-icons/fi";

interface EditorSpaceForEditorProps {
  activeFileId: string | null;
  editorRef: RefObject<HTMLDivElement | null>;
}

const EditorSpaceForEditor: FC<EditorSpaceForEditorProps> = ({
  activeFileId,
  editorRef,
}) => {
  return (
    <div>
      {" "}
      {activeFileId ? (
        <div ref={editorRef} className="h-full w-full" />
      ) : (
        <div className="flex items-center flex-col justify-center h-full b text-gray-500 bg-transparent">
          <div className="w-full bg-emerald-950 h-10 "></div>
          <div className="text-center py-24">
            <div className="mb-6">
              <FiFile size={64} className="mx-auto mb-4 opacity-50 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-300 mb-2">
              Welcome to Advanced Code Editor
            </h2>
            <p className="text-lg mb-6">
              Open a file to start editing or create a new project
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl">
              <div className="bg-emerald-950 p-6 rounded-lg border border-emerald-900">
                <FiFolder className="text-teal-400 mb-2" size={24} />
                <h3 className="font-semibold text-gray-200 mb-2 mt-3">
                  Real Project Creation
                </h3>
                <p className="text-gray-400 text-sm">
                  Create real projects from GitHub templates
                </p>
              </div>
              <div className="bg-emerald-950 p-6 rounded-lg border border-emerald-900">
                <FiSettings className="text-green-400 mb-2" size={24} />
                <h3 className="font-semibold text-gray-200 mb-2">
                  Live Package Management
                </h3>
                <p className="text-gray-400 text-sm">
                  Install real packages from npm and PyPI
                </p>
              </div>
              <div className="bg-emerald-950 p-6 rounded-lg border border-emerald-900">
                <FiTerminal className="text-purple-400 mb-2" size={24} />
                <h3 className="font-semibold text-gray-200 mb-2">
                  Internet-Connected Terminal
                </h3>
                <p className="text-gray-400 text-sm">
                  Fetch real data and create actual project structures
                </p>
              </div>
            </div>
          </div>
        </div>  
      )}
    </div>
  );
};

export default EditorSpaceForEditor;
