import { FileNode } from "@/types";

const findPackageJson = (nodes: FileNode[]): FileNode | null => {
  for (const node of nodes) {
    if (node.name === "package.json" && node.type === "file") {
      return node;
    }
    if (node.children) {
      const found = findPackageJson(node.children);
      if (found) return found;
    }
  }
  return null;
};

export default findPackageJson;