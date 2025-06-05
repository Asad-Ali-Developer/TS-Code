"use client";
import {
  ContextMenuForEditor,
  EditorSpaceForEditor,
  OpenTerminalButtonForEditor,
  SidebarForEditor,
  TabsForEditor,
  TerminalForEditor,
} from "@/components/molecules";
import {
  getFileIcon,
  highlightStyle,
  initialFileSystem,
  terminalGradients,
  vsCodeDarkTheme,
} from "@/data";
import { FileSystemService } from "@/services";
import { FileNode, OpenFile } from "@/types";
import { getLanguageExtension, handleCommand } from "@/utils";
import { syntaxHighlighting } from "@codemirror/language";
import { EditorState } from "@codemirror/state";
import { EditorView, basicSetup } from "codemirror";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FiChevronDown,
  FiChevronRight,
  FiFile,
  FiFolder,
} from "react-icons/fi";
import type { Terminal } from "xterm";
import type { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";

const CodeEditorPage = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalInstanceRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  const [fileSystem, setFileSystem] = useState<FileNode[]>([]);
  const [openFiles, setOpenFiles] = useState<OpenFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    nodeId: string;
    type: "file" | "folder";
  } | null>(null);
  const [isCreating, setIsCreating] = useState<{
    parentId: string;
    type: "file" | "folder";
  } | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [isRenaming, setIsRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [terminalActive, setTerminalActive] = useState(false);
  const [terminalMaximized, setTerminalMaximized] = useState(false);
  const [currentDirectory, setCurrentDirectory] = useState("/");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentCommand, setCurrentCommand] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  console.log("Current Command:", currentCommand);

  const fileSystemService = new FileSystemService(fileSystem, setFileSystem);

  // Initialize terminal with dynamic imports
  useEffect(() => {
    if (
      !terminalRef.current ||
      terminalInstanceRef.current ||
      typeof window === "undefined"
    )
      return;

    const initializeTerminal = async () => {
      try {
        if (!terminalRef.current) return;

        const { Terminal } = await import("xterm");
        const { FitAddon } = await import("xterm-addon-fit");

        await new Promise((resolve) => setTimeout(resolve, 100));

        if (!terminalRef.current) return;

        const terminal = new Terminal(terminalGradients);

        const fitAddon = new FitAddon();
        terminal.loadAddon(fitAddon);

        terminal.open(terminalRef.current);

        await new Promise((resolve) => setTimeout(resolve, 50));

        try {
          fitAddon.fit();
        } catch (error) {
          console.warn("Could not fit terminal initially:", error);
        }

        terminal.writeln("🚀 \x1b[1;35mAdvanced Web Terminal\x1b[0m");
        terminal.writeln("📦 Real project creation with GitHub templates!");
        terminal.writeln("💡 Type 'help' for available commands");
        terminal.writeln("🌐 Fetches real data from the internet");
        terminal.write("\r\n\x1b[1;36m$\x1b[0m ");

        let currentInput = "";

        terminal.onKey((e) => {
          const { key, domEvent } = e;
          const printable =
            !domEvent.ctrlKey && !domEvent.altKey && !domEvent.metaKey;

          if (domEvent.keyCode === 13) {
            if (currentInput.trim()) {
              handleCommand(
                currentInput.trim(),
                terminal,
                setIsLoading,
                fileSystem,
                setFileSystem,
                createNewItem,
                setCurrentDirectory,
                currentDirectory
              );
              setCommandHistory((prev) => [...prev, currentInput.trim()]);
              setHistoryIndex(-1);
            } else {
              terminal.write("\r\n\x1b[1;36m$\x1b[0m ");
            }
            currentInput = "";
            setCurrentCommand("");
          } else if (domEvent.keyCode === 8) {
            if (currentInput.length > 0) {
              currentInput = currentInput.slice(0, -1);
              terminal.write("\b \b");
              setCurrentCommand(currentInput);
            }
          } else if (domEvent.keyCode === 38) {
            if (commandHistory.length > 0) {
              const newIndex = Math.min(
                historyIndex + 1,
                commandHistory.length - 1
              );
              if (newIndex >= 0) {
                setHistoryIndex(newIndex);
                const command =
                  commandHistory[commandHistory.length - 1 - newIndex];
                terminal.write("\r\x1b[K\x1b[1;36m$\x1b[0m " + command);
                currentInput = command;
                setCurrentCommand(command);
              }
            }
          } else if (domEvent.keyCode === 40) {
            if (historyIndex > 0) {
              const newIndex = historyIndex - 1;
              setHistoryIndex(newIndex);
              const command =
                commandHistory[commandHistory.length - 1 - newIndex];
              terminal.write("\r\x1b[K\x1b[1;36m$\x1b[0m " + command);
              currentInput = command;
              setCurrentCommand(command);
            } else if (historyIndex === 0) {
              setHistoryIndex(-1);
              terminal.write("\r\x1b[K\x1b[1;36m$\x1b[0m ");
              currentInput = "";
              setCurrentCommand("");
            }
          } else if (printable) {
            currentInput += key;
            terminal.write(key);
            setCurrentCommand(currentInput);
          }
        });

        terminalInstanceRef.current = terminal;
        fitAddonRef.current = fitAddon;
      } catch (error) {
        console.error("Failed to initialize terminal:", error);
      }
    };

    initializeTerminal();

    return () => {
      if (terminalInstanceRef.current) {
        terminalInstanceRef.current.dispose();
        terminalInstanceRef.current = null;
        fitAddonRef.current = null;
      }
    };
  }, [commandHistory, historyIndex, fileSystem]);

  // Resize terminal when needed
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      fitAddonRef.current &&
      terminalActive &&
      terminalInstanceRef.current
    ) {
      const resizeTimeout = setTimeout(() => {
        try {
          fitAddonRef.current?.fit();
        } catch (error) {
          console.warn("Could not resize terminal:", error);
        }
      }, 150);

      return () => clearTimeout(resizeTimeout);
    }
  }, [terminalActive, terminalMaximized]);

  // Load initial file system
  useEffect(() => {
    const savedFileSystem = localStorage.getItem("vscode-filesystem");
    if (savedFileSystem) {
      setFileSystem(JSON.parse(savedFileSystem));
    } else {
      setFileSystem(initialFileSystem);
    }
  }, []);

  // Save file system to localStorage
  useEffect(() => {
    localStorage.setItem("vscode-filesystem", JSON.stringify(fileSystem));
  }, [fileSystem]);

  // Find file by ID
  const findFileById = useCallback(
    (id: string, nodes: FileNode[] = fileSystem): FileNode | null => {
      for (const node of nodes) {
        if (node.id === id) return node;
        if (node.children) {
          const found = findFileById(id, node.children);
          if (found) return found;
        }
      }
      return null;
    },
    [fileSystem]
  );

  // Get file path
  const getFilePath = useCallback(
    (id: string): string => {
      const buildPath = (
        nodeId: string,
        nodes: FileNode[] = fileSystem,
        currentPath = ""
      ): string => {
        for (const node of nodes) {
          const newPath = currentPath
            ? `${currentPath}/${node.name}`
            : node.name;
          if (node.id === nodeId) return newPath;
          if (node.children) {
            const found = buildPath(nodeId, node.children, newPath);
            if (found) return found;
          }
        }
        return "";
      };
      return buildPath(id);
    },
    [fileSystem]
  );

  // Update file content
  const updateFileContent = useCallback((id: string, content: string) => {
    const updateNodeRecursively = (node: FileNode): FileNode => {
      if (node.id === id && node.type === "file") {
        return { ...node, content };
      }
      if (node.children) {
        return {
          ...node,
          children: node.children.map(updateNodeRecursively),
        };
      }
      return node;
    };
    setFileSystem((prev) => prev.map(updateNodeRecursively));
  }, []);

  // Open file
  const openFile = useCallback(
    (node: FileNode) => {
      if (node.type !== "file") return;
      const existingFile = openFiles.find((f) => f.id === node.id);
      if (existingFile) {
        setActiveFileId(node.id);
        return;
      }
      const newFile: OpenFile = {
        id: node.id,
        name: node.name,
        content: node.content || "",
        isDirty: false,
        path: getFilePath(node.id),
      };
      setOpenFiles((prev) => [...prev, newFile]);
      setActiveFileId(node.id);
    },
    [openFiles, getFilePath]
  );

  // Close file
  const closeFile = useCallback((id: string) => {
    setOpenFiles((prev) => {
      const updated = prev.filter((f) => f.id !== id);
      if (updated.length > 0) {
        setActiveFileId(updated[updated.length - 1].id);
      } else {
        setActiveFileId(null);
      }
      return updated;
    });
  }, []);

  // Toggle folder
  const toggleFolder = useCallback((id: string) => {
    setFileSystem((prev) =>
      prev.map((node) => {
        function traverse(node: FileNode): FileNode {
          if (node.id === id && node.type === "folder") {
            return { ...node, isOpen: !node.isOpen };
          }
          if (node.children) {
            return { ...node, children: node.children.map(traverse) };
          }
          return node;
        }
        return traverse(node);
      })
    );
  }, []);

  // Create new item
  const createNewItem = useCallback(
    (parentId: string, type: "file" | "folder", name: string) => {
      const newId = Date.now().toString();
      const newNode: FileNode = {
        id: newId,
        name,
        type,
        parentId,
        content: type === "file" ? "" : undefined,
        children: type === "folder" ? [] : undefined,
        isOpen: false,
      };

      if (parentId === "root") {
        setFileSystem((prev) => [...prev, newNode]);
        if (type === "file") openFile(newNode);
        return;
      }

      setFileSystem((prev) =>
        prev.map((node) => {
          function traverse(node: FileNode): FileNode {
            if (node.id === parentId && node.type === "folder") {
              return {
                ...node,
                children: [...(node.children || []), newNode],
                isOpen: true,
              };
            }
            if (node.children) {
              return { ...node, children: node.children.map(traverse) };
            }
            return node;
          }
          return traverse(node);
        })
      );
      if (type === "file") openFile(newNode);
    },
    [openFile]
  );

  // Delete item
  const deleteItem = useCallback(
    (id: string) => {
      function removeNode(nodes: FileNode[]): FileNode[] {
        return nodes.filter((node) => {
          if (node.id === id) return false;
          if (node.children) {
            node.children = removeNode(node.children);
          }
          return true;
        });
      }
      setFileSystem(removeNode(fileSystem));
      closeFile(id);
    },
    [fileSystem, closeFile]
  );

  // Rename item
  const renameItem = useCallback((id: string, newName: string) => {
    setFileSystem((prev) =>
      prev.map((node) => {
        function traverse(node: FileNode): FileNode {
          if (node.id === id) {
            return { ...node, name: newName };
          }
          if (node.children) {
            return { ...node, children: node.children.map(traverse) };
          }
          return node;
        }
        return traverse(node);
      })
    );
    setOpenFiles((prev) =>
      prev.map((file) => (file.id === id ? { ...file, name: newName } : file))
    );
  }, []);

  // Initialize CodeMirror Editor
  useEffect(() => {
    if (!editorRef.current || !activeFileId) return;

    const activeFile = openFiles.find((f) => f.id === activeFileId);
    if (!activeFile) return;

    if (editorViewRef.current) {
      editorViewRef.current.destroy();
    }
    editorRef.current.innerHTML = "";

    const language = getLanguageExtension(activeFile.name);

    const state = EditorState.create({
      doc: activeFile.content,
      extensions: [
        basicSetup,
        language,
        vsCodeDarkTheme,
        syntaxHighlighting(highlightStyle),
        EditorView.lineWrapping,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const newContent = update.state.doc.toString();
            updateFileContent(activeFileId, newContent);
          }
        }),
      ],
    });

    editorViewRef.current = new EditorView({
      state,
      parent: editorRef.current,
    });

    return () => {
      editorViewRef.current?.destroy();
    };
  }, [activeFileId, openFiles, updateFileContent]);

  // Render file tree
  const renderFileTree = (nodes: FileNode[], level = 0) => {
    return nodes.map((node) => (
      <div key={node.id}>
        <div
          className={`flex items-center py-1.5 px-2 hover:bg-emerald-800 cursor-pointer select-none transition-colors duration-150 ${
            level > 0 ? `ml-${level * 4}` : ""
          }`}
          style={{
            paddingLeft: `${level * 16 + 8}px`,
            backgroundColor:
              activeFileId === node.id ? "#073c2e" : "transparent",
          }}
          onClick={() => {
            if (node.type === "folder") {
              toggleFolder(node.id);
            } else {
              openFile(node);
            }
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            setContextMenu({
              x: e.clientX,
              y: e.clientY,
              nodeId: node.id,
              type: node.type,
            });
          }}
        >
          {node.type === "folder" && (
            <span className="mr-1">
              {node.isOpen ? (
                <FiChevronDown size={12} className="text-gray-400" />
              ) : (
                <FiChevronRight size={12} className="text-gray-400" />
              )}
            </span>
          )}
          {node.type === "folder" ? (
            <FiFolder
              className="mr-2 text-emerald-500 flex-shrink-0"
              size={16}
            />
          ) : (
            getFileIcon(node.name)
          )}
          {isRenaming === node.id ? (
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={() => {
                if (renameValue.trim()) {
                  renameItem(node.id, renameValue.trim());
                }
                setIsRenaming(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (renameValue.trim()) {
                    renameItem(node.id, renameValue.trim());
                  }
                  setIsRenaming(null);
                } else if (e.key === "Escape") {
                  setIsRenaming(null);
                }
              }}
              className="bg-emerald-700 text-white px-2 py-1 rounded text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              autoFocus
            />
          ) : (
            <span className="text-sm text-gray-200 truncate font-medium">
              {node.name}
            </span>
          )}
        </div>
        {node.type === "folder" && node.isOpen && node.children && (
          <div>{renderFileTree(node.children, level + 1)}</div>
        )}
        {isCreating?.parentId === node.id && (
          <div
            className="flex items-center py-1.5 px-2"
            style={{ paddingLeft: `${(level + 1) * 16 + 8}px` }}
          >
            {isCreating.type === "folder" ? (
              <FiFolder
                className="mr-2 text-emerald-400 flex-shrink-0"
                size={16}
              />
            ) : (
              <FiFile className="mr-2 text-gray-400 flex-shrink-0" size={16} />
            )}
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onBlur={() => {
                if (newItemName.trim()) {
                  createNewItem(
                    isCreating.parentId,
                    isCreating.type,
                    newItemName.trim()
                  );
                }
                setIsCreating(null);
                setNewItemName("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (newItemName.trim()) {
                    createNewItem(
                      isCreating.parentId,
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
              className="bg-emerald-700 text-white px-2 py-1 rounded text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder={`New ${isCreating.type}...`}
              autoFocus
            />
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="flex h-screen bg-[#091814] text-gray-100 overflow-hidden">
      {/* Sidebar */}
      <SidebarForEditor
        setIsCreating={setIsCreating}
        renderFileTree={renderFileTree}
        isCreating={isCreating}
        fileSystem={fileSystem}
        setNewItemName={setNewItemName}
        newItemName={newItemName}
        createNewItem={createNewItem}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Tabs */}
        <TabsForEditor
          openFiles={openFiles}
          activeFileId={activeFileId}
          setActiveFileId={setActiveFileId}
          closeFile={closeFile}
        />

        {/* Editor */}
        <div className="flex-1 relative">
          <EditorSpaceForEditor
            activeFileId={activeFileId}
            editorRef={editorRef}
          />
        </div>
      </div>

      {/* Terminal */}
      <TerminalForEditor
        terminalActive={terminalActive}
        setTerminalActive={setTerminalActive}
        terminalRef={terminalRef}
        currentDirectory={currentDirectory}
        isLoading={isLoading}
        terminalMaximized={terminalMaximized}
        setTerminalMaximized={setTerminalMaximized}
      />

      {/* Floating terminal button */}
      {!terminalActive && (
        <OpenTerminalButtonForEditor setTerminalActive={setTerminalActive} />
      )}

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenuForEditor
          contextMenu={contextMenu}
          setContextMenu={setContextMenu}
          deleteItem={deleteItem}
          findFileById={findFileById}
          setIsCreating={setIsCreating}
          setIsRenaming={setIsRenaming}
          setRenameValue={setRenameValue}
        />
      )}

      {contextMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};

export default CodeEditorPage;
