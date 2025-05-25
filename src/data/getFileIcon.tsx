import { FiFile } from "react-icons/fi";
import {
  SiJavascript,
  SiTypescript,
  SiPython,
  SiHtml5,
  SiCss3,
  SiJson,
  SiMarkdown,
  SiReact,
} from "react-icons/si";

const getFileIcon = (fileName: string) => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  const iconProps = { size: 16, className: "mr-2 flex-shrink-0" };

  switch (ext) {
    case "js":
      return <SiJavascript {...iconProps} className="mr-2 text-yellow-400" />;
    case "ts":
    case "tsx":
      return <SiTypescript {...iconProps} className="mr-2 text-blue-400" />;
    case "py":
      return <SiPython {...iconProps} className="mr-2 text-green-400" />;
    case "html":
      return <SiHtml5 {...iconProps} className="mr-2 text-orange-400" />;
    case "css":
      return <SiCss3 {...iconProps} className="mr-2 text-blue-500" />;
    case "json":
      return <SiJson {...iconProps} className="mr-2 text-yellow-600" />;
    case "md":
      return <SiMarkdown {...iconProps} className="mr-2 text-gray-400" />;
    case "jsx":
      return <SiReact {...iconProps} className="mr-2 text-cyan-400" />;
    default:
      return <FiFile {...iconProps} className="mr-2 text-gray-400" />;
  }
};

export default getFileIcon;
