import {EditorView} from "@codemirror/view";

export const theme = EditorView.theme({
  "&": {
    color: "black",
    backgroundColor: "white"
  },
  ".cm-content": {
    minHeight: "80vh",
    overflowY: "auto",
    paddingLeft: "5%",
    paddingTop: "5%"
  },
  ".cm-line": {paddingTop: "3px", marginBottom: "3px", fontSize: "110%"},
  ".cm-activeLine": {backgroundColor: "white"}
}, {dark: false})
