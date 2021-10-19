import './Editor-toolbar.css'
import {Button} from "@material-ui/core";
import React, {useState} from "react";

export default function EditorToolbar(props) {
  const [editorPreview, setEditorPreview] = useState(true)

  function onToggleEditorAndPreview() {
    return setEditorPreview(prevState => !prevState);
  }

  return (
      <div className="Editor-toolbar">

        <Button className="Editor-preview-button"
                onClick={() => onToggleEditorAndPreview()}>
          {editorPreview ? 'Náhľad' : 'Editor'}
        </Button>

        <hr className="Editor-toolbar-divider"/>
      </div>
  );
}
