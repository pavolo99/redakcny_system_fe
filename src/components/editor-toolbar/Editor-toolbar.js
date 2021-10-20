import './Editor-toolbar.css'
import {Button} from "@material-ui/core";

export default function EditorToolbar(props) {

  return (
      <div className="Editor-toolbar">

        <Button className="Editor-preview-button"
                onClick={() => props.toggleEditorPreview()}>
          {props.editorVisible ? 'Náhľad' : 'Editor'}
        </Button>

        <hr className="Editor-toolbar-divider"/>
      </div>
  );
}
