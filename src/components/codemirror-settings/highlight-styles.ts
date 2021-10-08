import {
  tags as t,
  HighlightStyle,
  TagStyle,
  Tag,
} from "@codemirror/highlight";

const tagMap = new Map<Tag, Omit<TagStyle, "tag">>([
  [t.heading1, { fontSize: "150%" }],
  [t.heading2, { fontSize: "140%" }],
  [t.heading3, { fontSize: "130%" }],
  [t.heading4, { fontSize: "120%" }],
  [t.heading5, { fontSize: "110%" }],
  [t.heading6, { fontSize: "100%" }],
  [t.strong, { fontWeight: "bold" }],
  [t.emphasis, { fontStyle: "italic" }],
  [t.quote, { fontStyle: "italic", color: "grey" }]
]);

const specs = Array.from(tagMap.entries()).map(([tag, style]) => ({
  tag,
  ...style,
}));

export const highlightStyle = HighlightStyle.define(specs);
