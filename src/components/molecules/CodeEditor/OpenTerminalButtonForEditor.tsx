import { FC } from "react";
import { FiTerminal } from "react-icons/fi";

interface OpenTerminalButtonForEditorProps {
  setTerminalActive: (active: boolean) => void;
}

const OpenTerminalButtonForEditor: FC<OpenTerminalButtonForEditorProps> = ({
  setTerminalActive,
}) => {
  return (
    <div>
      <button
        type="button"
        onClick={() => setTerminalActive(true)}
        className="fixed bottom-6 right-6 p-4 bg-emerald-800 hover:bg-emerald-900 rounded-full shadow-lg transition-all duration-200 z-20 group"
        aria-label="Show terminal"
      >
        <FiTerminal size={24} className="text-white" />
        <span className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-emerald-900 text-white px-3 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          Open Terminal
        </span>
      </button>
    </div>
  );
};

export default OpenTerminalButtonForEditor;
