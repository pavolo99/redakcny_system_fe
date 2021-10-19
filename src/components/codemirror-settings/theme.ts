import {EditorView} from "@codemirror/view";

export const theme = EditorView.theme({
  "&": {
    color: "black",
    backgroundColor: "white"
  },
  ".cm-content": {
    minHeight: "80vh",
    overflowY: "auto",
    paddingLeft: "3%",
    paddingTop: "3%",
    whiteSpace: "pre-wrap",
    wordWrap: "break-word",
    fontFamily: "Lato, Helvetica Neue, Helvetica, sans-serif",
  },
  ".cm-activeLine": {backgroundColor: "white"},
  "&.cm-focused": {
    outline: "none"
  },
}, {dark: false})
