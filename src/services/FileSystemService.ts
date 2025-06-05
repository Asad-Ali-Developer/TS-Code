import { FileNode } from "@/types";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  getDocs,
  query,
} from "firebase/firestore";
import { firebaseDB } from "./FirebaseService";

class FileSystemService {
  constructor(
    private fileSystem: FileNode[],
    private setFileSystem: React.Dispatch<React.SetStateAction<FileNode[]>>,
    private collectionPath: string = "fileSystem"
  ) {}

  findFileById = (
    id: string,
    nodes: FileNode[] = this.fileSystem
  ): FileNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = this.findFileById(id, node.children);
        if (found) return found;
      }
    }
    return null;
  };

  getFilePath = (id: string): string => {
    const buildPath = (
      nodeId: string,
      nodes: FileNode[] = this.fileSystem,
      currentPath = ""
    ): string => {
      for (const node of nodes) {
        const newPath = currentPath ? `${currentPath}/${node.name}` : node.name;
        if (node.id === nodeId) return newPath;
        if (node.children) {
          const found = buildPath(nodeId, node.children, newPath);
          if (found) return found;
        }
      }
      return "";
    };
    return buildPath(id);
  };

  updateFileContent = async (id: string, content: string) => {
    await updateDoc(doc(firebaseDB, this.collectionPath, id), { content });

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
    this.setFileSystem((prev) => prev.map(updateNodeRecursively));
  };

  toggleFolder = (id: string) => {
    this.setFileSystem((prev) =>
      prev.map((node) => {
        const traverse = (node: FileNode): FileNode => {
          if (node.id === id && node.type === "folder") {
            return { ...node, isOpen: !node.isOpen };
          }
          if (node.children) {
            return { ...node, children: node.children.map(traverse) };
          }
          return node;
        };
        return traverse(node);
      })
    );
  };

  createNewItem = async (
    parentId: string,
    type: "file" | "folder",
    name: string,
    openFile: (node: FileNode) => void
  ) => {
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

    await setDoc(doc(firebaseDB, this.collectionPath, newId), newNode);

    if (parentId === "root") {
      this.setFileSystem((prev) => [...prev, newNode]);
    } else {
      this.setFileSystem((prev) =>
        prev.map((node) => {
          const traverse = (node: FileNode): FileNode => {
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
          };
          return traverse(node);
        })
      );
    }

    if (type === "file") openFile(newNode);
  };

  deleteItem = async (id: string, closeFile: (id: string) => void) => {
    await deleteDoc(doc(firebaseDB, this.collectionPath, id));

    const removeNode = (nodes: FileNode[]): FileNode[] =>
      nodes
        .filter((node) => node.id !== id)
        .map((node) => ({
          ...node,
          children: node.children ? removeNode(node.children) : undefined,
        }));

    this.setFileSystem(removeNode(this.fileSystem));
    closeFile(id);
  };

  renameItem = async (
    id: string,
    newName: string,
    updateOpenFiles: (id: string, newName: string) => void
  ) => {
    await updateDoc(doc(firebaseDB, this.collectionPath, id), { name: newName });

    this.setFileSystem((prev) =>
      prev.map((node) => {
        const traverse = (node: FileNode): FileNode => {
          if (node.id === id) {
            return { ...node, name: newName };
          }
          if (node.children) {
            return { ...node, children: node.children.map(traverse) };
          }
          return node;
        };
        return traverse(node);
      })
    );
    updateOpenFiles(id, newName);
  };

  loadFileSystemFromFirebase = async () => {
    const q = query(collection(firebaseDB, this.collectionPath));
    const snapshot = await getDocs(q);
    const flatList: FileNode[] = snapshot.docs.map((doc) => doc.data() as FileNode);

    const buildTree = (items: FileNode[], parentId: string = "root"): FileNode[] =>
      items
        .filter((item) => item.parentId === parentId)
        .map((item) => ({
          ...item,
          children: buildTree(items, item.id),
        }));

    const tree = buildTree(flatList);
    this.setFileSystem(tree);
  };
}

export default FileSystemService;
