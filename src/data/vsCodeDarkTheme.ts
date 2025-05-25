import { EditorView } from "codemirror";

const vsCodeDarkTheme = EditorView.theme(
  {
    "&": {
      color: "#D4D4D4",
      backgroundColor: "#091814",
      height: "100%",
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
    },
    ".cm-content": {
      caretColor: "#065f46",
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
      fontSize: "14px",
      lineHeight: "1.6",
      padding: "16px",
    },
    ".cm-cursor, .cm-dropCursor": {
      borderLeftColor: "#065f46",
      borderLeftWidth: "2px",
    },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
      {
        backgroundColor: "#264F78",
      },
    ".cm-gutters": {
      backgroundColor: "#1E1E1E",
      color: "#858585",
      border: "none",
      minWidth: "60px",
      paddingRight: "8px",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "#2A2A2A",
      color: "#C6C6C6",
    },
    ".cm-activeLine": {
      backgroundColor: "#2A2A2A",
    },
    ".cm-line": {
      padding: "0 8px",
    },
    ".cm-scroller": {
      overflow: "auto",
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
    },
    ".cm-focused": {
      outline: "none",
    },
    ".cm-editor": {
      borderRadius: "0",
    },
  },
  { dark: true }
);

export default vsCodeDarkTheme;
