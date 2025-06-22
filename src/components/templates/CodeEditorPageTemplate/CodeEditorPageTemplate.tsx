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
  terminalGradients,
  vsCodeDarkTheme,
} from "@/data";
import type { FileNode, OpenFile } from "@/types";
import { getLanguageExtension } from "@/utils";
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

import { FirebaseFileSystemService } from "@/services";
import { handleCommand } from "@/utils";
import { useJoinedRoomId, useAuth } from "@/providers";
import { CodeService } from "@/services";

const CodeEditorPage = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalInstanceRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const firebaseService = useRef<FirebaseFileSystemService>(
    FirebaseFileSystemService.getInstance()
  );
  const codeService = useRef<CodeService>(new CodeService());

  // Get room context and user details
  const {
    newJoinedRoomId,
    roomDetails,
    setRoomDetails,
    roomMembers,
    setRoomMembers,
  } = useJoinedRoomId();
  const { userDetails } = useAuth();

  // Real-time collaboration refs
  const isUpdatingFromFirebaseRef = useRef<boolean>(false);
  const lastUpdateByRef = useRef<string | null>(null);
  const fileContentListenersRef = useRef<Map<string, () => void>>(new Map());

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
  const [isInitialized, setIsInitialized] = useState(false);

  console.log("Current Command:", currentCommand);
  console.log("Current Room ID:", newJoinedRoomId);
  console.log("File System Length:", fileSystem.length);
  console.log("Active File ID:", activeFileId);

  // Initialize room-specific file system and listen to room members
  useEffect(() => {
    let fileSystemUnsubscribe: (() => void) | null = null;
    let membersUnsubscribe: (() => void) | null = null;

    const initializeRoomFileSystem = async () => {
      if (!newJoinedRoomId) {
        console.log("❌ No room joined, showing empty state");
        // No room joined, show empty state or default
        setFileSystem([]);
        setIsInitialized(true);
        return;
      }

      try {
        console.log(
          `🚀 Initializing room file system for room: ${newJoinedRoomId}`
        );

        // Set the current room for the file system service
        firebaseService.current.setCurrentRoom(newJoinedRoomId);

        // Get room details
        console.log(`📋 Getting room details for: ${newJoinedRoomId}`);
        const details = await codeService.current.getRoomDetails(
          newJoinedRoomId
        );
        setRoomDetails(details);
        console.log(`📋 Room details:`, details);

        // Listen to room members
        membersUnsubscribe = codeService.current.listenToRoomMembers(
          newJoinedRoomId,
          (members) => {
            console.log(`👥 Room members updated:`, members);
            setRoomMembers(members);
          }
        );

        // DON'T initialize room file system here for joining users
        // Just subscribe to existing files
        console.log(
          `📡 Subscribing to file system for room: ${newJoinedRoomId}`
        );

        // Subscribe to real-time file system updates for this room
        fileSystemUnsubscribe = firebaseService.current.subscribeToFileSystem(
          (updatedFileSystem) => {
            console.log(
              `📁 File system updated, received ${updatedFileSystem.length} root nodes`
            );
            setFileSystem(updatedFileSystem);
            setIsInitialized(true);
          }
        );

        // Add a small delay to ensure subscription is established
        setTimeout(() => {
          console.log(
            `✅ Room file system initialization complete for: ${newJoinedRoomId}`
          );
        }, 1000);
      } catch (error) {
        console.error("Error initializing room file system:", error);
        // Fallback to empty state
        setFileSystem([]);
        setIsInitialized(true);
      }
    };

    initializeRoomFileSystem();

    return () => {
      if (fileSystemUnsubscribe) {
        console.log(
          `🔌 Unsubscribing from file system for room: ${newJoinedRoomId}`
        );
        fileSystemUnsubscribe();
      }
      if (membersUnsubscribe) {
        console.log(
          `🔌 Unsubscribing from room members for room: ${newJoinedRoomId}`
        );
        membersUnsubscribe();
      }
    };
  }, [newJoinedRoomId, setRoomDetails, setRoomMembers]);

  // Real-time file content synchronization
  useEffect(() => {
    if (!activeFileId || !newJoinedRoomId) return;

    console.log(
      `🔄 Setting up real-time content sync for file: ${activeFileId}`
    );

    // Subscribe to real-time content changes for the active file
    const unsubscribe = firebaseService.current.subscribeToFileContent(
      activeFileId,
      (content, updatedBy) => {
        // Don't update if the change was made by the current user
        if (updatedBy === userDetails?.uid) {
          console.log(`⏭️ Skipping update from self for file: ${activeFileId}`);
          return;
        }

        console.log(
          `📝 Received real-time content update for file: ${activeFileId}`
        );
        isUpdatingFromFirebaseRef.current = true;
        lastUpdateByRef.current = updatedBy || null;

        // Update the open file content
        setOpenFiles((prev) =>
          prev.map((file) =>
            file.id === activeFileId
              ? { ...file, content, isDirty: false }
              : file
          )
        );

        // Update the editor content if this is the active file
        if (editorViewRef.current) {
          const currentContent = editorViewRef.current.state.doc.toString();
          if (currentContent !== content) {
            const transaction = editorViewRef.current.state.update({
              changes: {
                from: 0,
                to: editorViewRef.current.state.doc.length,
                insert: content,
              },
            });
            editorViewRef.current.dispatch(transaction);
          }
        }

        setTimeout(() => {
          isUpdatingFromFirebaseRef.current = false;
        }, 100);
      }
    );

    // Store the unsubscribe function
    fileContentListenersRef.current.set(activeFileId, unsubscribe);

    return () => {
      // Clean up the listener when active file changes
      if (fileContentListenersRef.current.has(activeFileId)) {
        const unsubscribe = fileContentListenersRef.current.get(activeFileId);
        if (unsubscribe) {
          unsubscribe();
          fileContentListenersRef.current.delete(activeFileId);
          console.log(
            `🔌 Unsubscribed from content changes for file: ${activeFileId}`
          );
        }
      }
    };
  }, [activeFileId, newJoinedRoomId, userDetails?.uid]);

  // Cleanup Firebase listeners and pending saves on unmount
  useEffect(() => {
    return () => {
      // Clean up all file content listeners
      fileContentListenersRef.current.forEach((unsubscribe) => unsubscribe());
      fileContentListenersRef.current.clear();

      firebaseService.current.cleanup();
    };
  }, []);

  // Instant content update function for real-time collaboration
  const updateFileContentInstant = useCallback(
    async (id: string, content: string) => {
      // Prevent infinite loops from Firebase updates
      if (isUpdatingFromFirebaseRef.current) return;

      console.log(`⚡ Instant content update for file: ${id}`);

      // Update local state immediately for responsive UI
      setOpenFiles((prev) =>
        prev.map((file) =>
          file.id === id ? { ...file, content, isDirty: true } : file
        )
      );

      // Update Firebase instantly (no debouncing for real-time collaboration)
      try {
        await firebaseService.current.updateFileContentInstant(
          id,
          content,
          userDetails?.uid
        );
      } catch (error) {
        console.error("Error updating file content instantly:", error);
      }
    },
    [userDetails?.uid]
  );

  // Debounced update function for Firebase
  // const debouncedFirebaseUpdate = useCallback(
  //   (fileId: string, content: string) => {
  //     // Store the pending update
  //     // Clear existing timeout
  //     // Set new timeout to save after user stops typing
  //   },
  //   []
  // );

  // Function to save all pending updates to Firebase
  // const savePendingUpdates = useCallback(async () => {
  //   // Save all pending updates in parallel
  //   // Clear pending updates after successful save
  //   // Update isDirty status for saved files
  // }, []);

  // Add this function before the terminal initialization
  const createBulkItems = useCallback(
    async (
      items: Array<{
        name: string;
        type: "file" | "folder";
        parentId: string;
        content?: string;
        children?: any[];
      }>
    ) => {
      try {
        for (const item of items) {
          const newItem: Omit<FileNode, "id"> = {
            name: item.name,
            type: item.type,
            parentId: item.parentId,
            content: item.content || (item.type === "file" ? "" : undefined),
            isOpen: false,
          };

          const newId = await firebaseService.current.createItem(newItem);

          // If it has children (for folders), create them recursively
          if (item.children && item.children.length > 0) {
            const childItems = item.children.map((child: any) => ({
              ...child,
              parentId: newId,
            }));
            await createBulkItems(childItems);
          }
        }
      } catch (error) {
        console.error("Error creating bulk items:", error);
      }
    },
    []
  );

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

        const terminal = new Terminal({
          ...terminalGradients,
          // Add these options to prevent resize issues
          allowProposedApi: true,
          allowTransparency: true,
        });

        const fitAddon = new FitAddon();
        terminal.loadAddon(fitAddon);

        // Open terminal first
        terminal.open(terminalRef.current);

        // Wait a bit longer before fitting
        await new Promise((resolve) => setTimeout(resolve, 200));

        // Safely fit the terminal with error handling
        try {
          if (terminal.element && terminal.element.offsetParent !== null) {
            fitAddon.fit();
          }
        } catch (error) {
          console.warn("Could not fit terminal initially:", error);
          // Retry fitting after a delay
          setTimeout(() => {
            try {
              if (terminal.element && terminal.element.offsetParent !== null) {
                fitAddon.fit();
              }
            } catch (retryError) {
              console.warn("Could not fit terminal on retry:", retryError);
            }
          }, 500);
        }

        terminal.writeln("🚀 \x1b[1;35mCodeSync Collaborative Terminal\x1b[0m");
        if (newJoinedRoomId) {
          terminal.writeln(
            `🏠 Connected to room: \x1b[1;36m${newJoinedRoomId}\x1b[0m`
          );
          terminal.writeln(
            `👥 Room members: \x1b[1;33m${roomMembers.length}\x1b[0m`
          );
        }
        terminal.writeln("📦 Real project creation with GitHub templates!");
        terminal.writeln("💡 Type 'help' for available commands");
        terminal.writeln("🌐 Fetches real data from the internet");
        terminal.writeln("🔥 Now with Firebase real-time sync!");
        terminal.writeln(
          "⚡ INSTANT collaboration - changes appear immediately!"
        );
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
                currentDirectory,
                firebaseService.current
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
              terminal.write("\r\n\x1b[K\x1b[1;36m$\x1b[0m " + command);
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
      // Improved cleanup
      if (terminalInstanceRef.current) {
        try {
          // Clear any pending operations
          terminalInstanceRef.current.clear();
          // Dispose of the terminal
          terminalInstanceRef.current.dispose();
        } catch (error) {
          console.warn("Error during terminal cleanup:", error);
        }
        terminalInstanceRef.current = null;
      }
      if (fitAddonRef.current) {
        fitAddonRef.current = null;
      }
    };
  }, [commandHistory, historyIndex, fileSystem, newJoinedRoomId, roomMembers]);

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
          // Check if terminal is still valid and visible
          if (
            terminalInstanceRef.current &&
            terminalInstanceRef.current.element &&
            terminalInstanceRef.current.element.offsetParent !== null &&
            fitAddonRef.current
          ) {
            fitAddonRef.current.fit();
          }
        } catch (error) {
          console.warn("Could not resize terminal:", error);
        }
      }, 150);

      return () => clearTimeout(resizeTimeout);
    }
  }, [terminalActive, terminalMaximized]);

  // Window resize handler
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleWindowResize = () => {
      if (
        terminalActive &&
        terminalInstanceRef.current &&
        fitAddonRef.current &&
        terminalInstanceRef.current.element &&
        terminalInstanceRef.current.element.offsetParent !== null
      ) {
        try {
          setTimeout(() => {
            if (fitAddonRef.current && terminalInstanceRef.current) {
              fitAddonRef.current.fit();
            }
          }, 100);
        } catch (error) {
          console.warn("Error during window resize:", error);
        }
      }
    };

    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, [terminalActive]);

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

  // Update file content with debouncing for Firebase
  // const updateFileContent = useCallback((id: string, content: string) => {
  //   // Prevent infinite loops from Firebase updates
  //   // Update local state immediately for responsive UI
  //   // Debounce Firebase update
  // }, []);

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
    // Clean up file content listener
    if (fileContentListenersRef.current.has(id)) {
      const unsubscribe = fileContentListenersRef.current.get(id);
      if (unsubscribe) {
        unsubscribe();
        fileContentListenersRef.current.delete(id);
      }
    }

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

  // Toggle folder in Firebase
  const toggleFolder = useCallback(
    async (id: string) => {
      try {
        const node = findFileById(id);
        if (node && node.type === "folder") {
          await firebaseService.current.updateItem(
            id,
            { isOpen: !node.isOpen },
            userDetails?.uid
          );
        }
      } catch (error) {
        console.error("Error toggling folder:", error);
      }
    },
    [findFileById, userDetails?.uid]
  );

  // Create new item in Firebase
  const createNewItem = useCallback(
    async (
      parentId: string,
      type: "file" | "folder",
      name: string
    ): Promise<void> => {
      if (!newJoinedRoomId) {
        console.error("Cannot create item: No room joined");
        return;
      }

      try {
        const newItem: Omit<FileNode, "id"> = {
          name,
          type,
          parentId: parentId === "root" ? "root" : parentId,
          content: type === "file" ? "" : undefined,
          isOpen: false,
        };

        const newId = await firebaseService.current.createItem(newItem);

        // If it's a file, open it
        if (type === "file") {
          const newFile: OpenFile = {
            id: newId,
            name,
            content: "",
            isDirty: false,
            path: name,
          };
          setOpenFiles((prev) => [...prev, newFile]);
          setActiveFileId(newId);
        }

        // If parent is a folder, make sure it's open
        if (parentId !== "root") {
          const parent = findFileById(parentId);
          if (parent && parent.type === "folder" && !parent.isOpen) {
            await firebaseService.current.updateItem(
              parentId,
              { isOpen: true },
              userDetails?.uid
            );
          }
        }
      } catch (error) {
        console.error("Error creating new item:", error);
        throw error;
      }
    },
    [findFileById, newJoinedRoomId, userDetails?.uid]
  );

  // Delete item from Firebase
  const deleteItem = useCallback(
    async (id: string) => {
      try {
        await firebaseService.current.deleteItem(id);
        closeFile(id);
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    },
    [closeFile]
  );

  // Rename item in Firebase
  const renameItem = useCallback(
    async (id: string, newName: string) => {
      try {
        await firebaseService.current.updateItem(
          id,
          { name: newName },
          userDetails?.uid
        );

        // Update open files state
        setOpenFiles((prev) =>
          prev.map((file) =>
            file.id === id ? { ...file, name: newName } : file
          )
        );
      } catch (error) {
        console.error("Error renaming item:", error);
      }
    },
    [userDetails?.uid]
  );

  // Initialize CodeMirror Editor - ONLY when switching files or initializing
  useEffect(() => {
    if (!editorRef.current || !activeFileId || !isInitialized) return;

    const activeFile = openFiles.find((f) => f.id === activeFileId);
    if (!activeFile) return;

    // Clean up previous editor
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
          if (update.docChanged && !isUpdatingFromFirebaseRef.current) {
            const newContent = update.state.doc.toString();
            updateFileContentInstant(activeFileId, newContent);
          }
        }),
      ],
    });

    editorViewRef.current = new EditorView({
      state,
      parent: editorRef.current,
    });

    return () => {
      if (editorViewRef.current) {
        editorViewRef.current.destroy();
      }
    };
  }, [activeFileId, isInitialized, updateFileContentInstant]);

  // Update editor content when file content changes from Firebase (without recreating editor)
  useEffect(() => {}, []);

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
              {/* Show dot indicator for unsaved changes */}
              {openFiles.find((f) => f.id === node.id)?.isDirty && (
                <span className="ml-1 text-orange-400">●</span>
              )}
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

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="flex h-screen bg-[#091814] text-gray-100 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-emerald-400">🔥 Connecting to Firebase...</p>
          {newJoinedRoomId && (
            <p className="text-gray-400 mt-2">Room: {newJoinedRoomId}</p>
          )}
        </div>
      </div>
    );
  }

  // Show room selection state if no room is joined
  if (!newJoinedRoomId) {
    return (
      <div className="flex h-screen bg-[#091814] text-gray-100 items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏠</div>
          <h2 className="text-2xl font-bold text-emerald-400 mb-4">
            Welcome to CodeSync
          </h2>
          <p className="text-gray-400 mb-8">
            Create or join a room to start collaborative coding
          </p>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Use the navbar above to create or join a room
            </p>
          </div>
        </div>
      </div>
    );
  }

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
        roomInfo={{
          roomId: newJoinedRoomId,
          roomName: roomDetails?.roomName || "Unknown Room",
          memberCount: roomMembers.length,
        }}
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
