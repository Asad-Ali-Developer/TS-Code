import {
  collection,
  doc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  addDoc,
  getDocs,
} from "firebase/firestore";
import { firebaseDB } from "./FirebaseService";
import type { FileNode } from "@/types";

export class FirebaseFileSystemService {
  private static instance: FirebaseFileSystemService;
  private listeners: (() => void)[] = [];
  private currentRoomId: string | null = null;
  private fileContentListeners: Map<string, () => void> = new Map();

  static getInstance(): FirebaseFileSystemService {
    if (!FirebaseFileSystemService.instance) {
      FirebaseFileSystemService.instance = new FirebaseFileSystemService();
    }
    return FirebaseFileSystemService.instance;
  }

  /**
   * Set the current room ID for all operations
   */
  setCurrentRoom(roomId: string | null): void {
    this.currentRoomId = roomId;
    console.log(`🏠 Set current room to: ${roomId}`);
  }

  /**
   * Get the collection reference for the current room's filesystem
   */
  private getRoomFileSystemCollection() {
    if (!this.currentRoomId) {
      throw new Error("No room ID set. Call setCurrentRoom() first.");
    }
    return collection(
      firebaseDB,
      "room_filesystems",
      this.currentRoomId,
      "files"
    );
  }

  // Subscribe to real-time file system changes for the current room
  subscribeToFileSystem(
    callback: (fileSystem: FileNode[]) => void
  ): () => void {
    if (!this.currentRoomId) {
      throw new Error("No room ID set. Call setCurrentRoom() first.");
    }

    console.log(
      `📡 Subscribing to file system for room: ${this.currentRoomId}`
    );

    const q = query(
      this.getRoomFileSystemCollection(),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log(
          `📁 Received ${snapshot.docs.length} files for room ${this.currentRoomId}`
        );

        const fileSystem: FileNode[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          fileSystem.push({
            id: doc.id,
            ...data,
          } as FileNode);
        });

        // Rebuild the tree structure
        const rebuiltFileSystem = this.rebuildFileSystemTree(fileSystem);
        console.log(
          `🌳 Rebuilt file tree with ${rebuiltFileSystem.length} root nodes`
        );
        callback(rebuiltFileSystem);
      },
      (error) => {
        console.error("Error listening to file system changes:", error);
        // Call callback with empty array on error
        callback([]);
      }
    );

    this.listeners.push(unsubscribe);
    return unsubscribe;
  }

  // Subscribe to real-time content changes for a specific file
  subscribeToFileContent(
    fileId: string,
    callback: (content: string, updatedBy?: string) => void
  ): () => void {
    if (!this.currentRoomId) {
      throw new Error("No room ID set. Call setCurrentRoom() first.");
    }

    console.log(`📄 Subscribing to content changes for file: ${fileId}`);

    const fileRef = doc(this.getRoomFileSystemCollection(), fileId);

    const unsubscribe = onSnapshot(
      fileRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          const content = data.content || "";
          const updatedBy = data.lastUpdatedBy;
          console.log(
            `📝 File content updated for ${fileId}, length: ${content.length}`
          );
          callback(content, updatedBy);
        }
      },
      (error) => {
        console.error(
          `Error listening to file content changes for ${fileId}:`,
          error
        );
      }
    );

    // Store the listener for cleanup
    this.fileContentListeners.set(fileId, unsubscribe);
    return unsubscribe;
  }

  // Unsubscribe from file content changes
  unsubscribeFromFileContent(fileId: string): void {
    const unsubscribe = this.fileContentListeners.get(fileId);
    if (unsubscribe) {
      unsubscribe();
      this.fileContentListeners.delete(fileId);
      console.log(`🔌 Unsubscribed from file content: ${fileId}`);
    }
  }

  // Rebuild the hierarchical file system structure
  private rebuildFileSystemTree(flatNodes: FileNode[]): FileNode[] {
    const nodeMap = new Map<string, FileNode>();
    const rootNodes: FileNode[] = [];

    // First pass: create all nodes
    flatNodes.forEach((node) => {
      nodeMap.set(node.id, {
        ...node,
        children: node.type === "folder" ? [] : undefined,
      });
    });

    // Second pass: build the tree
    flatNodes.forEach((node) => {
      const currentNode = nodeMap.get(node.id);
      if (!currentNode) return;

      if (node.parentId && node.parentId !== "root") {
        const parent = nodeMap.get(node.parentId);
        if (parent && parent.children) {
          parent.children.push(currentNode);
        }
      } else {
        rootNodes.push(currentNode);
      }
    });

    return rootNodes;
  }

  // Create a new file or folder in the current room
  async createItem(
    item: Omit<FileNode, "id"> & { createdAt?: any }
  ): Promise<string> {
    try {
      const itemData = {
        ...item,
        roomId: this.currentRoomId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Filter out undefined values as Firebase doesn't support them
      const cleanedData = Object.fromEntries(
        Object.entries(itemData).filter(([_, value]) => value !== undefined)
      );

      console.log(
        `📝 Creating ${item.type}: ${item.name} in room ${this.currentRoomId}`
      );
      const docRef = await addDoc(
        this.getRoomFileSystemCollection(),
        cleanedData
      );
      console.log(`✅ Created ${item.type} with ID: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      console.error("Error creating item:", error);
      throw error;
    }
  }

  // Update an existing file or folder in the current room (INSTANT UPDATE)
  async updateItem(
    id: string,
    updates: Partial<FileNode>,
    userId?: string
  ): Promise<void> {
    try {
      // Filter out undefined values
      const cleanedUpdates = Object.fromEntries(
        Object.entries({
          ...updates,
          updatedAt: new Date(),
          lastUpdatedBy: userId,
        }).filter(([_, value]) => value !== undefined)
      );

      const docRef = doc(this.getRoomFileSystemCollection(), id);
      await updateDoc(docRef, cleanedUpdates);
      console.log(`📝 Updated item ${id} instantly`);
    } catch (error) {
      console.error("Error updating item:", error);
      throw error;
    }
  }

  // Instant content update for real-time collaboration
  async updateFileContentInstant(
    fileId: string,
    content: string,
    userId?: string
  ): Promise<void> {
    try {
      const updates = {
        content,
        updatedAt: new Date(),
        lastUpdatedBy: userId,
      };

      const docRef = doc(this.getRoomFileSystemCollection(), fileId);
      await updateDoc(docRef, updates);
      console.log(`⚡ Instantly updated content for file ${fileId}`);
    } catch (error) {
      console.error("Error updating file content instantly:", error);
      throw error;
    }
  }

  // Delete a file or folder and all its children from the current room
  async deleteItem(id: string): Promise<void> {
    try {
      // First, get all items to find children
      const snapshot = await getDocs(this.getRoomFileSystemCollection());
      const allItems: (FileNode & { docId: string })[] = [];

      snapshot.forEach((doc) => {
        allItems.push({
          docId: doc.id,
          id: doc.id,
          ...doc.data(),
        } as FileNode & { docId: string });
      });

      // Find all children recursively
      const itemsToDelete = this.findAllChildren(id, allItems);
      itemsToDelete.push(id); // Include the item itself

      // Delete all items
      const deletePromises = itemsToDelete.map((itemId) =>
        deleteDoc(doc(this.getRoomFileSystemCollection(), itemId))
      );

      await Promise.all(deletePromises);
      console.log(`🗑️ Deleted ${itemsToDelete.length} items`);
    } catch (error) {
      console.error("Error deleting item:", error);
      throw error;
    }
  }

  // Find all children of a given item recursively
  private findAllChildren(
    parentId: string,
    allItems: (FileNode & { docId: string })[]
  ): string[] {
    const children: string[] = [];

    allItems.forEach((item) => {
      if (item.parentId === parentId) {
        children.push(item.id);
        // Recursively find children of this child
        children.push(...this.findAllChildren(item.id, allItems));
      }
    });

    return children;
  }

  // Initialize file system for a new room
  async initializeRoomFileSystem(roomId: string): Promise<void> {
    try {
      console.log(`🚀 Initializing file system for room: ${roomId}`);

      // Set the room context
      const previousRoomId = this.currentRoomId;
      this.setCurrentRoom(roomId);

      // Check if room already has files
      const snapshot = await getDocs(this.getRoomFileSystemCollection());
      console.log(
        `📊 Found ${snapshot.docs.length} existing files in room ${roomId}`
      );

      if (snapshot.empty) {
        console.log(
          `📁 Creating default file structure for new room ${roomId}`
        );
        // Create default file structure for new room
        const defaultFiles = [
          {
            name: "src",
            type: "folder" as const,
            parentId: "root",
            isOpen: true,
          },
          {
            name: "README.md",
            type: "file" as const,
            parentId: "root",
            content: `# Welcome to CodeSync Room\n\nThis is a collaborative coding environment.\nStart coding together!\n\nRoom ID: ${roomId}\n\n## Real-time Collaboration\n- All changes are synchronized instantly\n- Multiple users can edit simultaneously\n- File system changes are reflected in real-time\n`,
          },
          {
            name: "app.js",
            type: "file" as const,
            parentId: "root",
            content: `// Welcome to CodeSync!\n// This file demonstrates real-time collaboration\n\nconsole.log("Hello from CodeSync!");\n\n// Try editing this file with multiple users\n// and see the changes appear instantly!\n`,
          },
        ];

        const createPromises = defaultFiles.map(async (item) => {
          await this.createItem(item);
        });

        await Promise.all(createPromises);
        console.log(`✅ Created default file structure for room ${roomId}`);
      } else {
        console.log(
          `📁 Room ${roomId} already has files, skipping initialization`
        );
      }

      // Restore previous room context
      this.setCurrentRoom(previousRoomId);
    } catch (error) {
      console.error("Error initializing room file system:", error);
      throw error;
    }
  }

  // Initialize with default file system if empty (for backward compatibility)
  async initializeDefaultFileSystem(
    defaultFileSystem: FileNode[]
  ): Promise<void> {
    if (!this.currentRoomId) {
      console.warn("No room ID set for initializing default file system");
      return;
    }

    try {
      const snapshot = await getDocs(this.getRoomFileSystemCollection());

      if (snapshot.empty) {
        console.log(
          `📁 Creating default file system for room ${this.currentRoomId}`
        );
        // No files exist, create default structure
        const createPromises = defaultFileSystem.map(async (item) => {
          await this.createItemRecursively(item, "root");
        });

        await Promise.all(createPromises);
      }
    } catch (error) {
      console.error("Error initializing default file system:", error);
      throw error;
    }
  }

  // Recursively create items and their children
  private async createItemRecursively(
    item: FileNode,
    parentId: string
  ): Promise<void> {
    const itemData: any = {
      name: item.name,
      type: item.type,
      parentId: parentId,
      roomId: this.currentRoomId,
      isOpen: item.isOpen || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Only add content field if it's defined (for files)
    if (item.content !== undefined) {
      itemData.content = item.content;
    }

    const docRef = await addDoc(this.getRoomFileSystemCollection(), itemData);

    // If this item has children, create them recursively
    if (item.children && item.children.length > 0) {
      const childPromises = item.children.map((child) =>
        this.createItemRecursively(child, docRef.id)
      );
      await Promise.all(childPromises);
    }
  }

  // Clean up all listeners
  cleanup(): void {
    this.listeners.forEach((unsubscribe) => unsubscribe());
    this.listeners = [];

    // Clean up file content listeners
    this.fileContentListeners.forEach((unsubscribe) => unsubscribe());
    this.fileContentListeners.clear();

    console.log("🧹 Cleaned up all Firebase listeners");
  }
}
