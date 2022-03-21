import './Editor-toolbar.css'
import {Button} from "@material-ui/core";
import InsertBold from "../../assets/insert-bold.svg"
import InsertItalic from "../../assets/insert-italic.svg"
import InsertImage from "../../assets/insert-image.svg"
import InsertLink from "../../assets/insert-link.svg"
import InsertQuote from "../../assets/insert-quote.svg"
import AddComment from "../../assets/add-comment.svg"
import Tooltip from "@mui/material/Tooltip";
import React from "react";

export default function EditorToolbar(props) {

  return (
      <div className="Editor-toolbar">
        <div className="Toolbar-row">
          <Button className="Editor-preview-button"
                  onClick={() => props.toggleEditorPreview()}>
            {props.editorVisible ? 'Náhľad' : 'Editor'}
          </Button>

          <img src={InsertBold} alt="Vložiť hrubé písmo" className="Toolbar-insert-icon" onClick={() => props.onInsertTextToEditor('****', 2)} style={{pointerEvents: props.editorVisible ? 'all' : 'none'}}/>
          <img src={InsertItalic} alt="Vložiť kurzívu" className="Toolbar-insert-icon" onClick={() => props.onInsertTextToEditor('__', 1)} style={{pointerEvents: props.editorVisible ? 'all' : 'none'}}/>
          <img src={InsertQuote} alt="Vložiť citáciu" className="Toolbar-insert-icon" onClick={() => props.onInsertTextToEditor('>', 1)} style={{pointerEvents: props.editorVisible ? 'all' : 'none'}}/>
          <img src={InsertImage} alt="Vložiť obrázok" className="Toolbar-insert-icon" onClick={() => props.onInsertTextToEditor('\n![Pridajte nejaký popis]()\n', 3)} style={{pointerEvents: props.editorVisible ? 'all' : 'none'}}/>
          <img src={InsertLink} alt="Vložiť odkaz" className="Toolbar-insert-icon" onClick={() => props.onInsertTextToEditor('[Pridajte nejaký popis]()', 1)} style={{pointerEvents: props.editorVisible ? 'all' : 'none'}}/>
          <Tooltip title="Pridať komentár k označenému textu"
                   onClick={() => props.setIsNewCommentIconClicked(props.isNewCommentIconClicked ? props.isNewCommentIconClicked : !props.isNewCommentIconClicked)}
                   className="Toolbar-insert-icon" style={{marginLeft: '10rem', pointerEvents: props.editorVisible ? 'all' : 'none'}}>
            <img src={AddComment} alt="Pridať komentár"/>
          </Tooltip>
        </div>

        <hr className="Editor-toolbar-divider"/>
      </div>
  );
}
