// Fetch file content from GitHub
const fetchFileContent = async (downloadUrl: string): Promise<string> => {
  try {
    const response = await fetch(downloadUrl);
    if (!response.ok)
      throw new Error(`Failed to fetch file: ${response.status}`);
    return await response.text();
  } catch (error) {
    console.error("Error fetching file content:", error);
    return "";
  }
};

export default fetchFileContent;