import { Dispatch, FC, RefObject, SetStateAction } from "react";
import { FiTerminal, FiMinimize2, FiMaximize2, FiX } from "react-icons/fi";

interface TerminalForEditorProps {
  terminalActive: boolean;
  setTerminalActive: Dispatch<SetStateAction<boolean>>;
  terminalMaximized: boolean;
  setTerminalMaximized: Dispatch<SetStateAction<boolean>>;
  currentDirectory: string;
  isLoading: boolean;
  terminalRef: RefObject<HTMLDivElement | null>;
}

const TerminalForEditor: FC<TerminalForEditorProps> = ({
  terminalActive,
  setTerminalActive,
  terminalMaximized,
  setTerminalMaximized,
  currentDirectory,
  isLoading,
  terminalRef,
}) => {
  return (
    <div>
      <div
        className={`absolute bottom-0 left-0 right-0 bg-emerald-900 border-t border-gray-700 z-10 transition-all duration-300 shadow-2xl ${
          terminalActive ? (terminalMaximized ? "h-full" : "h-1/2") : "h-0"
        }`}
      >
        <div className="flex items-center justify-between p-3 bg-emerald-950/50 border-b border-gray-700">
          <h2 className="text-sm font-bold text-gray-200 flex items-center">
            <FiTerminal className="mr-2 text-emerald-500" />
            TERMINAL
            {isLoading && (
              <div className="ml-2 w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            )}
          </h2>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-200">{currentDirectory}</span>
            <button
              type="button"
              onClick={() => setTerminalMaximized(!terminalMaximized)}
              className="p-1.5 hover:bg-emerald-700 rounded transition-colors duration-150"
              title={terminalMaximized ? "Restore" : "Maximize"}
            >
              {terminalMaximized ? (
                <FiMinimize2 size={14} className="text-gray-200" />
              ) : (
                <FiMaximize2 size={14} className="text-gray-200" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setTerminalActive(!terminalActive)}
              className="p-1.5 hover:bg-emerald-700 rounded transition-colors duration-150"
              title="Close Terminal"
            >
              <FiX size={14} className="text-gray-200" />
            </button>
          </div>
        </div>
        <div
          ref={terminalRef}
          className={`h-full ${terminalActive ? "block" : "hidden"}`}
          style={{ height: "calc(100% - 48px)" }}
        />
      </div>
    </div>
  );
};

export default TerminalForEditor;
