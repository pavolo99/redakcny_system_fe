import {markdown} from "@codemirror/lang-markdown";
import {history} from "@codemirror/history"
import {indentOnInput} from "@codemirror/language"
import {highlightStyle} from "./highlight-styles";


export const extensions = [
  markdown(),
  history(),
  indentOnInput(),
  highlightStyle
];
