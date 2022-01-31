import React, {useEffect, useRef, useState} from "react";
import './Archive-page.css'
import axios from "axios";
import {apiUrl} from "../../components/environment/environment";
import {useHistory} from "react-router-dom";
import {EditorState} from "@codemirror/state";
import {EditorView} from "@codemirror/view";
import {extensions} from "../../components/codemirror-settings/extensions";
import {theme} from "../../components/codemirror-settings/theme";
import {Button} from "@material-ui/core";

const ArchivePage = (props) => {
  const history = useHistory();
  const [archivedArticle, setArchivedArticle] = useState({
    id: null,
    name: '',
    text: ''
  });

  useEffect(() => {
    if (props.location.state) {
      axios.get(apiUrl + '/article/archived/' + props.location.state.articleId)
      .catch(error => handleError(error))
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

  function handleError(error) {
    if (error.response.status === 401) {
      history.push('/login');
    }
  }

  function onRedirectToDashboard() {
    history.push('/dashboard');
  }

  function onRestoreArticle() {
    axios.put(apiUrl + '/article/restore/' + props.location.state.articleId)
    .catch(error => handleError(error))
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
          <Button className="Restore-button" onClick={onRestoreArticle}>Obnoviť
            článok</Button>
        </div>
        <hr className="Archive-header-divider"/>
        <div className="Archive-editor">
          <div ref={editorRef}/>
        </div>
      </>
  );
};

export default ArchivePage;
