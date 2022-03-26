import './Editor-toolbar.css'
import {Button} from "@material-ui/core";
import InsertBold from "../../assets/insert-bold.svg"
import InsertItalic from "../../assets/insert-italic.svg"
import InsertImage from "../../assets/insert-image.svg"
import InsertLink from "../../assets/insert-link.svg"
import AddComment from "../../assets/add-comment.svg"
import React from "react";

export default function EditorToolbar(props) {

  return (
      <div className="Editor-toolbar">
        <div className="Toolbar-row">
          <Button className="Editor-preview-button"
                  onClick={() => props.toggleEditorPreview()}>
            {props.editorVisible ? 'Náhľad' : 'Editor'}
          </Button>

          <img src={InsertBold} alt="Vložiť hrubé písmo"
               className="Toolbar-insert-icon" title="Vložiť hrubé písmo"
               onClick={() => props.onInsertBoldOrItalicValueToEditor('**')}
               style={{display: props.editorVisible && props.canLoggedUserEdit ? 'flex' : 'none'}}/>
          <img src={InsertItalic} alt="Vložiť kurzívu"
               className="Toolbar-insert-icon"
               onClick={() => props.onInsertBoldOrItalicValueToEditor('*')}
               title="Vložiť kurzívu"
               style={{display: props.editorVisible && props.canLoggedUserEdit ? 'flex' : 'none'}}/>
          <img src={InsertImage} alt="Vložiť obrázok"
               className="Toolbar-insert-icon"
               onClick={() => props.onInsertLinkOrImageValueToEditor('![', ']()')}
               title="Vložiť obrázok"
               style={{display: props.editorVisible && props.canLoggedUserEdit ? 'flex' : 'none'}}/>
          <img src={InsertLink} alt="Vložiť odkaz"
               className="Toolbar-insert-icon"
               onClick={() => props.onInsertLinkOrImageValueToEditor('[', ']()')}
               title="Vložiť![](../../../../../Downloads/edit_note_black_24dp 1.png) odkaz"
               style={{display: props.editorVisible && props.canLoggedUserEdit ? 'flex' : 'none'}}/>
          <img src={AddComment} alt="Pridať komentár"
               title="Pridať komentár k označenému textu"
               onClick={() => props.setIsNewCommentIconClicked(props.isNewCommentIconClicked ? props.isNewCommentIconClicked : !props.isNewCommentIconClicked)}
               className="Toolbar-insert-icon"
               style={{marginLeft: '10rem', marginTop: '3px', display: props.editorVisible ? 'flex' : 'none'}}/>
        </div>

        <hr className="Editor-toolbar-divider"/>
      </div>
  );
}
