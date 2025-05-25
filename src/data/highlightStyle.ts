import { HighlightStyle } from "@codemirror/language";
import { tags } from "@lezer/highlight";

const highlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: "#569CD6", fontWeight: "bold" },
  { tag: tags.typeName, color: "#4EC9B0" },
  { tag: tags.propertyName, color: "#9CDCFE" },
  { tag: tags.variableName, color: "#9CDCFE" },
  { tag: tags.definition(tags.variableName), color: "#DCDCAA" },
  { tag: tags.number, color: "#B5CEA8" },
  { tag: tags.string, color: "#CE9178" },
  { tag: tags.comment, color: "#6A9955", fontStyle: "italic" },
  { tag: tags.meta, color: "#D4D4D4" },
  { tag: tags.tagName, color: "#569CD6" },
  { tag: tags.attributeName, color: "#9CDCFE" },
  { tag: tags.bracket, color: "#FFD700" },
  { tag: tags.operator, color: "#D4D4D4" },
  { tag: tags.className, color: "#4EC9B0" },
  { tag: tags.angleBracket, color: "#808080" },
  { tag: tags.function(tags.variableName), color: "#DCDCAA" },
  { tag: tags.regexp, color: "#D16969" },
  { tag: tags.escape, color: "#D7BA7D" },
]);

export default highlightStyle;