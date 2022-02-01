import React, {useEffect, useRef, useState} from "react";
import './Versions-page.css'
import axios from "axios";
import {apiUrl} from "../../components/environment/environment";
import {useHistory} from "react-router-dom";
import {
  convertTimestampToDate,
  getFullName,
  handle401Error
} from "../../shared/Utils";
import SkipEnd from "../../assets/skip-end.svg"
import SkipStart from "../../assets/skip-start.svg"
import NavigateNext from "../../assets/navigate-next.svg"
import NavigatePrevious from "../../assets/navigate-previous.svg"
import {EditorState} from "@codemirror/state";
import {EditorView} from "@codemirror/view";
import {extensions} from "../../components/codemirror-settings/extensions";
import {theme} from "../../components/codemirror-settings/theme";
import {Button} from "@material-ui/core";
import {MuiMessage} from "../../components/mui-message/Mui-message";

const VersionsPage = (props) => {
  const history = useHistory();
  const [editorView, setEditorView] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loadedVersion, setLoadedVersion] = useState({
    id: null,
    createdBy: null,
    createdAt: null,
    text: '',
    order: 0
  });

  const [muiMessage, setMuiMessage] = useState({
    open: false,
    severity: '',
    message: ''
  });

  const closeMuiMessage = () => {
    setMuiMessage(prevState => {
      return {...prevState, open: false}
    })
  }

  useEffect(() => {
    if (props.location.state) {
      axios.get(apiUrl + '/version/' + props.location.state + '/all')
      .catch(error => handle401Error(error, history))
      .then(response => {
        if (response) {
          const versionsDataResponse = setVersionsAndCurrentVersion(response);
          let editorState = EditorState.create({
            doc: versionsDataResponse.currentVersionText,
            extensions: [
              EditorView.contentAttributes.of({contenteditable: false}),
              extensions,
              theme
            ],
          });
          setEditorView(new EditorView({state: editorState, parent: editorRef.current}));
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

  function onNavigateVersion(next, skip) {
    let newVersion;
    if (!next && skip) {
      newVersion = versions.versionSimpleDtoList.find(value => value.order === 1);
    } else if (!next && !skip) {
      newVersion = versions.versionSimpleDtoList.find(value => value.order === loadedVersion.order - 1);
    } else if (next && !skip) {
      newVersion = versions.versionSimpleDtoList.find(value => value.order === loadedVersion.order + 1);
    } else {
      newVersion = versions.versionSimpleDtoList.find(value => value.order === versions.versionSimpleDtoList.length);
    }
    axios.get(apiUrl + '/version/' + newVersion.id + '/detail')
    .catch(error => handle401Error(error, history))
    .then(response => {
      if (response) {
        const responseData = response.data;
        setLoadedVersion({
          id: responseData.id,
          createdBy: responseData.createdBy,
          createdAt: convertTimestampToDate(responseData.createdAt),
          text: responseData.text,
          order: versions.versionSimpleDtoList.find(value => value.id === responseData.id).order
        })
        const transaction = editorView.state.update({changes: {from: 0, to: editorView.state.doc.length, insert: responseData.text}});
        editorView.dispatch(transaction);
      }
    });
  }

  function onSetAsCurrentVersion() {
    axios.post(apiUrl + '/version/' + loadedVersion.id + '/current', {})
    .catch(error => handle401Error(error, history))
    .then(response => {
      const versionsDataResponse = setVersionsAndCurrentVersion(response);
      const transaction = editorView.state.update({changes: {from: 0, to: editorView.state.doc.length, insert: versionsDataResponse.currentVersionText}});
      editorView.dispatch(transaction);
      setMuiMessage({
        open: true,
        severity: 'success',
        message: 'Verzia bola úspešne označená za súčasnú'
      });
    });
  }

  function setVersionsAndCurrentVersion(response) {
    const versionsDataResponse = response.data;
    setVersions(versionsDataResponse);
    const currentLoadedVersion = versionsDataResponse.versionSimpleDtoList[versionsDataResponse.versionSimpleDtoList.length - 1];
    setLoadedVersion({
      id: currentLoadedVersion.id,
      createdBy: currentLoadedVersion.createdBy,
      createdAt: convertTimestampToDate(currentLoadedVersion.createdAt),
      text: versionsDataResponse.currentVersionText,
      order: currentLoadedVersion.order
    });
    return versionsDataResponse;
  }

  const editorRef = useRef();

  function onRedirectToArticle() {
    history.push('/editor', {articleId: props.location.state});
  }

  return (
      <>
        <div className="Version-header">
          <div className="Back-to-article" onClick={onRedirectToArticle}>
            <span>Späť na článok</span>
          </div>
          <div className="Version-info">
            <div className="Bold">
              <span>{loadedVersion.order + '. verzia'}</span>
              <span>{versions && versions.versionSimpleDtoList ? (loadedVersion.order === versions.versionSimpleDtoList.length ? ' (súčasná)' : null) : null}</span>
            </div>
            <div className="Italic">
              {loadedVersion.createdAt} - {getFullName(loadedVersion.createdBy)}
            </div>
          </div>

          <img style={loadedVersion.order === 1 ? {opacity: '0.5', pointerEvents: 'none'} : {}}
               src={SkipStart} alt="Preskočiť na začiatok"
               className="Navigate-img"
               onClick={() => onNavigateVersion(false, true)}/>
          <img style={loadedVersion.order === 1 ? {opacity: '0.5', pointerEvents: 'none'} : {}}
               src={NavigatePrevious} alt="Zobraziť predchádzajúcu"
               className="Navigate-img"
               onClick={() => onNavigateVersion(false, false)}/>
          <img style={versions && versions.versionSimpleDtoList ? loadedVersion.order === versions.versionSimpleDtoList.length ? {opacity: '0.5', pointerEvents: 'none'} : {} : null}
               src={NavigateNext} alt="Zobraziť nasledujúcu"
               className="Navigate-img"
               onClick={() => onNavigateVersion(true, false)}/>
          <img style={versions && versions.versionSimpleDtoList ? loadedVersion.order === versions.versionSimpleDtoList.length ? {opacity: '0.5', pointerEvents: 'none'} : {} : null}
               src={SkipEnd} alt="Preskočiť na koniec"
               className="Navigate-img"
               onClick={() => onNavigateVersion(true, true)}/>
          <div>Celkový počet verzií: <strong>{versions && versions.versionSimpleDtoList ? versions.versionSimpleDtoList.length : 0}</strong></div>
          <Button className="Set-as-current-version-button" onClick={onSetAsCurrentVersion}
                  disabled={versions && versions.versionSimpleDtoList && loadedVersion.order === versions.versionSimpleDtoList.length}>
            Nastaviť ako súčasnú verziu</Button>
        </div>
        <hr className="Version-header-divider"/>
        <div className="Version-editor">
          <div ref={editorRef}/>
        </div>
        <MuiMessage severity={muiMessage.severity} open={muiMessage.open}
                    onCloseMuiMessage={closeMuiMessage}
                    message={muiMessage.message}/>
      </>
  );
};

export default VersionsPage;
