import React, {useEffect, useRef, useState} from "react";
import './Archive-page.css'
import axios from "axios";
import {useHistory} from "react-router-dom";
import {EditorState} from "@codemirror/state";
import {EditorView} from "@codemirror/view";
import {extensions} from "../../components/codemirror-settings/extensions";
import {theme} from "../../components/codemirror-settings/theme";
import {Button} from "@material-ui/core";
import {handle401Error} from "../../shared/Utils";
import {MuiMessage} from "../../components/mui-message/Mui-message";

const ArchivePage = (props) => {
  const history = useHistory();
  const [archivedArticle, setArchivedArticle] = useState({
    id: null,
    name: '',
    text: ''
  });

  function getMuiMessage() {
    if (props.location.state.published) {
      return 'Článok bol úspešne publikovaný a archivovaný';
    } else if (props.location.state.denied) {
      return 'Článok bol úspešne zamietnutý a archivovaný'
    } else if (props.location.state.archived) {
      return 'Článok bol úspešne archivovaný'
    } else {
      return '';
    }
  }

  function getMuiOpen() {
    return props.location.state.published || props.location.state.denied || props.location.state.archived;
  }

  const [muiMessage, setMuiMessage] = useState({
    open: getMuiOpen(),
    severity: 'success',
    message: getMuiMessage()
  });

  const closeMuiMessage = () => {
    props.location.state.published = false;
    props.location.state.denied = false;
    props.location.state.archived = false;

    setMuiMessage(prevState => {
      return {...prevState, open: false}
    })
  }

  useEffect(() => {
    if (props.location.state) {
      axios.get(process.env.REACT_APP_BECKEND_API_URL + '/article/archived/' + props.location.state.articleId)
      .catch(error => handle401Error(error, history))
      .then(response => {
        if (response) {
          setArchivedArticle(response.data);
          let editorState = EditorState.create({
            doc: response.data.text,
            extensions: [
              EditorView.contentAttributes.of({contenteditable: false}),
              extensions,
              theme
            ],
          });
          new EditorView({state: editorState, parent: editorRef.current});
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

  const editorRef = useRef();

  function onRedirectToDashboard() {
    history.push('/dashboard');
  }

  function onRestoreArticle() {
    axios.put(process.env.REACT_APP_BECKEND_API_URL + '/article/restore/' + props.location.state.articleId)
    .catch(error => handle401Error(error, history))
    .then(response => {
      if (response) {
        onRedirectToDashboard();
      }
    })
  }

  return (
      <>
        <div className="Archive-header">
          <div className="Back-to-dashboard" onClick={onRedirectToDashboard}>
            <span>Späť na zoznam článkov</span>
          </div>
          <div className="Name">
            {archivedArticle.name}
          </div>
          <Button className="Restore-button" onClick={onRestoreArticle}>Obnoviť archivovaný článok</Button>
        </div>
        <hr className="Archive-header-divider"/>
        <div className="Archive-editor">
          <div ref={editorRef}/>
        </div>
        <MuiMessage severity={muiMessage.severity} open={muiMessage.open}
                    message={muiMessage.message}
                    onCloseMuiMessage={closeMuiMessage} />
        <MuiMessage severity='success' open={props.location.state.published}
                    onCloseMuiMessage={closeMuiMessage}
                    message='Článok bol úspešne publikovaný a archivovaný'/>
        <MuiMessage severity='success' open={props.location.state.denied}
                    onCloseMuiMessage={closeMuiMessage}
                    message='Článok bol úspešne zamietnutý a archivovaný'/>
        <MuiMessage severity='success' open={props.location.state.archived}
                    onCloseMuiMessage={closeMuiMessage}
                    message='Článok bol úspešne archivovaný'/>
      </>
  );
};

export default ArchivePage;
