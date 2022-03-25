import React, {useEffect, useRef, useState} from "react";
import './Editor-page.css'
import Header from "../../components/header/Header";
import {EditorView} from "@codemirror/view";
import {
  Compartment,
  EditorSelection,
  EditorState,
  SelectionRange
} from "@codemirror/state";
import {Button, TextField} from "@material-ui/core";
import {useHistory, useLocation} from "react-router-dom";
import axios from "axios";
import {extensions} from "../../components/codemirror-settings/extensions";
import {theme} from "../../components/codemirror-settings/theme";
import {MuiMessage} from "../../components/mui-message/Mui-message";
import ImageSection from "../../components/image-section/Image-section";
import EditorToolbar from "../../components/editor-toolbar/Editor-toolbar";
import ReactMarkdown from 'react-markdown'
import CommentSection from "../../components/comment-section/Comment-section";
import {articleCanBeEdited, handle401Error} from "../../shared/Utils";
import CollabInfoDialog
  from "../../components/collab-info-dialog/Collab-info-dialog";

const EditorPage = () => {
  const location = useLocation();
  const history = useHistory();
  const [contentEditableCompartment, setContentEditableCompartment] = useState(null)

  const [article, setArticle] = useState({
    id: null,
    name: '',
    text: '',
    keyWords: '',
    articleAbstract: '',
    publicFileName: '',
    publicationDecision: '',
    reviewNumber: 0,
    articleStatus: null,
    canLoggedUserEdit: false,
  });
  const [allConnectedUsers, setAllConnectedUsers] = useState([])

    useEffect(() => {
      let interval;
      axios.get(process.env.REACT_APP_BECKEND_API_URL + '/collab-session/' + location.state.articleId)
    .catch(error => handleError(error))
    .then(response => {
      if (response) {
        setArticleAndConnectedUsers(response)
        const contentEditableCompartment = new Compartment()
        setContentEditableCompartment(contentEditableCompartment)
        let editorState = EditorState.create({
          doc: response.data.text,
          extensions: [
            contentEditableCompartment.of(EditorView.contentAttributes.of({ contenteditable: response.data.canLoggedUserEdit && articleCanBeEdited(response.data.articleStatus) })),
            extensions,
            theme,
            onUpdate
          ],
        });
        const newEditorView = new EditorView({state: editorState, parent: editorRef.current});
        setEditorView(newEditorView);

        interval = setInterval(() => {
          let canLoggedUserEdit = false;
          setArticle((state) => {
            canLoggedUserEdit = state.canLoggedUserEdit
            return state;
          });
          if (canLoggedUserEdit) {
            // if logged user can edit, then push changes every 5 seconds
            axios.post(process.env.REACT_APP_BECKEND_API_URL + '/collab-session/' + response.data.id,
                {text: getChangedTextFromView(newEditorView)})
            .catch(error => handle401Error(error, history))
            .then(response => {
              if (response) {
                setArticle((state) => {
                  state.text = response.data.text
                  state.canLoggedUserEdit = response.data.canLoggedUserEdit
                  state.articleStatus = response.data.articleStatus
                  return state;
                });
                setAllConnectedUsers(response.data.allConnectedUsers)
              }
            })
          } else {
            // if logged user cannot edit, then fetch changes every 5 seconds
            axios.get(process.env.REACT_APP_BECKEND_API_URL + '/collab-session/' + location.state.articleId)
            .catch(error => handleError(error))
            .then(response => {
              if (response) {
                const mergedArticleObject = {...article, ...response.data};
                setArticle(mergedArticleObject);
                setAllConnectedUsers(response.data.allConnectedUsers)
                newEditorView.dispatch({
                  effects: contentEditableCompartment.reconfigure(
                      EditorView.contentAttributes.of({
                        contenteditable: response.data.canLoggedUserEdit
                            && articleCanBeEdited(response.data.articleStatus)
                      }))
                })
                const insertTransaction = newEditorView.state.update({
                  changes: {
                    from: 0,
                    to: newEditorView.state.doc.length,
                    insert: response.data.text
                  }
                })
                newEditorView.dispatch(insertTransaction);
              }
            });
          }
        }, 5000);
      }
    });

    // disconnect logged users session after close browser
    window.addEventListener("beforeunload", () => {
      disconnectLoggedUserFromSession(interval)
    });
    return () => {
      // disconnect logged users session after route change
      disconnectLoggedUserFromSession(interval);
    };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

  function getChangedTextFromView(editorView) {
    if (!editorView || !editorView.state || !editorView.state.doc) {
      return article.text;
    }
    let changedText = '';
    if (editorView.state.doc.text) {
      changedText = editorView.state.doc.text.join('\n')
    } else {
      editorView.state.doc.children.forEach(node => {
        node.text.forEach(text => changedText = changedText + text.replace("", '\n'))
      });
    }
    return changedText;
  }

  function setArticleAndConnectedUsers(response) {
    const mergedArticleObject = {...article, ...response.data};
    setArticle(mergedArticleObject);
    setAllConnectedUsers(response.data.allConnectedUsers)
  }

  function disconnectLoggedUserFromSession(interval) {
    clearInterval(interval);
    axios.delete(process.env.REACT_APP_BECKEND_API_URL + '/collab-session/' + location.state.articleId)
  }

  const editorRef = useRef();

  const [muiMessage, setMuiMessage] = useState({
    open: false,
    severity: 'success',
    message: 'Článok bol úspešne uložený'
  });

  const [editorView, setEditorView] = useState(null);

  const [editorVisible, setEditorVisible] = useState(true);
  const [isNewCommentIconClicked, setIsNewCommentIconClicked] = useState(false);

  function leaveArticleEdit() {
    setArticle((state) => {
      state.canLoggedUserEdit = false
      return state;
    });
    editorView.dispatch({
      effects: contentEditableCompartment.reconfigure(EditorView.contentAttributes.of({contenteditable: false}))
    })
  }

  const onInputsValueChange = e => {
    const targetName = e.target.name;
    const targetValue = e.target.value;
    if (targetName === 'publicFileName' && (targetValue.includes('.') || targetValue.includes('/') || targetValue.includes(' '))) {
      e.preventDefault();
      return;
    }
    setArticle({...article, [targetName]: targetValue})
  }

  const onUpdate = EditorView.updateListener.of((viewUpdate) => {
    if (viewUpdate.docChanged) {
      setArticle(prevState => {
        return {...prevState, text: viewUpdate.state.doc.toString()}
      });
    }
  });

  function onSaveArticle(event) {
    event.preventDefault();
    axios.put(process.env.REACT_APP_BECKEND_API_URL + '/article/' + article.id,
        {...article, id: article.id, text: getChangedTextFromView(editorView)})
    .catch(error => handleError(error))
    .then(response => {
      if (response) {
        setMuiMessage(prevState => {
          return {...prevState, open: true, severity: 'success'}
        });
      }
    });
  }

  function handleError(error) {
    handle401Error(error, history);
    if (error.response.status === 400) {
      setMuiMessage({open: true, message: 'Musíte vyplniť všetky povinné polia', severity: 'error'});
    } else {
      setMuiMessage({open: true, message: 'Nastala neočakávaná chyba pri ukladaní článku', severity: 'error'});
    }
  }

  const closeMuiMessage = () => {
    setMuiMessage(prevState => {
      return {...prevState, open: false}
    })
  }

  function onToggleEditorPreview() {
    setEditorVisible(prevState => !prevState);
  }

  function createTextSelection(commentRangeFrom, commentRangeTo) {
    editorView.focus();
    const cursorPosFrom = commentRangeFrom > editorView.state.doc.length ? 0 : commentRangeFrom;
    const cursorPosTo = commentRangeTo > editorView.state.doc.length ? 0 : commentRangeTo;
    let newSelectionRange = new SelectionRange(cursorPosFrom, cursorPosTo);
    editorView.dispatch(editorView.state.update({
      selection: EditorSelection.create([newSelectionRange])
    }))
  }

  function insertBoldOrItalicValueToEditor(insertedValue) {
    const selection = editorView.state.selection.ranges[0]
    const insertFromTransaction = editorView.state.update({
      changes: {
        from: selection.from,
        insert: insertedValue
      }
    })
    editorView.dispatch(insertFromTransaction);
    const insertToTransaction = editorView.state.update({
      changes: {
        from: selection.to + insertedValue.length,
        insert: insertedValue
      }
    })
    editorView.dispatch(insertToTransaction);
    createTextSelection(selection.from + insertedValue.length, selection.to + insertedValue.length)
  }

  function insertLinkOrImageValueToEditor(insertedValueFrom, insertedValueTo) {
    const selection = editorView.state.selection.ranges[0]
    const insertFromTransaction = editorView.state.update({
      changes: {
        from: selection.from,
        insert: insertedValueFrom
      }
    });
    editorView.dispatch(insertFromTransaction);
    const insertToTransaction = editorView.state.update({
      changes: {
        from: selection.to + insertedValueFrom.length,
        insert: insertedValueTo
      }
    })
    editorView.dispatch(insertToTransaction);
    createTextSelection(selection.from + insertedValueFrom.length, selection.to + insertedValueFrom.length)
  }

  const selectionRange = editorView && editorView.state && editorView.state.selection ? editorView.state.selection.ranges[0] : null;

  let loggedUserRole = JSON.parse(localStorage.getItem('loggedUser')).role;
  return (
      <div>
        <Header openedArticleId={article.id}
                openedArticleName={article.name}
                allConnectedUsers={allConnectedUsers}
                openedArticleStatus={article.articleStatus}
                changeArticleStatus={(newArticleStatus) => setArticle(prevState => { return {...prevState, articleStatus: newArticleStatus}})}/>
        <MuiMessage severity={muiMessage.severity} open={muiMessage.open}
                    onCloseMuiMessage={closeMuiMessage}
                    message={muiMessage.message}/>
        <form>
          <div className="Flex-row">
            <div className="Left-side">
              <div><TextField label="Názov článku" variant="filled"
                              value={article.name} inputProps={{maxLength: 50}}
                              style={{width: "100%"}} name="name"
                              required={true} disabled={!article.canLoggedUserEdit}
                              onChange={onInputsValueChange}/></div>
              <TextField label="Abstrakt" variant="filled"
                         inputProps={{ maxLength: 1000 }} minRows={5}
                         maxRows={5} disabled={!article.canLoggedUserEdit}
                         value={article.articleAbstract} multiline
                         style={{width: "100%"}} name="articleAbstract"
                         onChange={onInputsValueChange}/>
              <div><TextField label="Kľúčové slová (oddelené čiarkou)"
                              inputProps={{maxLength: 50}}
                              disabled={!article.canLoggedUserEdit}
                              name="keyWords" value={article.keyWords}
                              variant="filled" style={{width: "100%"}}
                              onChange={onInputsValueChange}/></div>
              <div><TextField name="publicFileName" inputProps={{maxLength: 50}}
                              label="Názov zverejneného súboru (slug)"
                              value={article.publicFileName}
                              disabled={!article.canLoggedUserEdit}
                              style={{width: "100%"}} variant="filled"
                              onChange={onInputsValueChange}/></div>
              {loggedUserRole === 'EDITOR' ? <div>
                <TextField value={article.publicationDecision}
                               name="publicationDecision" inputProps={{ maxLength: 50 }}
                               label="Rozhodnutie o publikácií článku"
                               style={{width: "100%"}} variant="filled"
                           disabled={!article.canLoggedUserEdit}
                           onChange={onInputsValueChange}/></div> : null}

              <div>
                <ImageSection articleId={article.id}
                              canLoggedUserEdit={article.canLoggedUserEdit}
                              articleStatus={article.articleStatus}
                              onInsertLinkOrImageValueToEditor={(insertedValueFrom, insertedValueTo) => insertLinkOrImageValueToEditor(insertedValueFrom, insertedValueTo)}/>
              </div>

              <Button className="Submit-button" onClick={onSaveArticle}
                      disabled={!article.canLoggedUserEdit}>Uložiť článok
              </Button>

            </div>
            <div className="Center-editor">
              <EditorToolbar setIsNewCommentIconClicked={setIsNewCommentIconClicked} isNewCommentIconClicked={isNewCommentIconClicked}
                             canLoggedUserEdit={article.canLoggedUserEdit}
                  onInsertBoldOrItalicValueToEditor={(insertedValue) => insertBoldOrItalicValueToEditor(insertedValue)}
                  onInsertLinkOrImageValueToEditor={(insertedValueFrom, insertedValueTo) => insertLinkOrImageValueToEditor(insertedValueFrom, insertedValueTo)}
                  editorVisible={editorVisible} toggleEditorPreview={() => onToggleEditorPreview()}/>
              <div style={{overflowY: 'auto', height: '76vh'}}>
                <div ref={editorRef} className={editorVisible ? '' : 'Invisible'}/>
                <ReactMarkdown children={getChangedTextFromView(editorView)}
                               className={editorVisible ? 'Invisible' : 'Visible Preview'}/>
              </div>
            </div>
            <div className="Right-side">
              <CommentSection articleId={article.id}
                              isNewCommentIconClicked={isNewCommentIconClicked}
                              setIsNewCommentIconClicked={setIsNewCommentIconClicked}
                              commentedText={getChangedTextFromView(editorView).substring(selectionRange ? selectionRange.from : 0, selectionRange ? selectionRange.to : 0)}
                              selectionRange={selectionRange}
                              selectCommentedText={(from, to) => createTextSelection(from, to)}/>
            </div>
          </div>
        </form>
        <CollabInfoDialog articleId={article.id}
                          leaveArticleEdit={() => leaveArticleEdit()}
                          canLoggedUserEdit={article.canLoggedUserEdit}/>
      </div>
  );
};

export default EditorPage;
