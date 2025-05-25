import { PackageInfo } from "@/types";

// Fetch package info from npm
const fetchNpmPackageInfo = async (
  packageName: string
): Promise<PackageInfo | null> => {
  try {
    const response = await fetch(
      `https://registry.npmjs.org/${packageName}/latest`
    );
    if (!response.ok) return null;
    const data = await response.json();
    return {
      name: data.name,
      version: data.version,
      description: data.description,
      author: data.author?.name || data.author,
      license: data.license,
      homepage: data.homepage,
    };
  } catch (error) {
    return null;
  }
};

export default fetchNpmPackageInfo;
