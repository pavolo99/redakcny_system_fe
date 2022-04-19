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
import {TextField} from "@material-ui/core";
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
    userIdWhoCanEdit: null,
  });
  const [allConnectedUsers, setAllConnectedUsers] = useState([])
  const [allCollaborators, setAllCollaborators] = useState([])

  let loggedUserId = JSON.parse(localStorage.getItem('loggedUser')).id;

  useEffect(() => {
      let interval;
      axios.get(process.env.REACT_APP_BECKEND_API_URL + '/collab-session/' + location.state.articleId)
    .catch(error => handle401Error(error, history))
    .then(response => {
      if (response) {
        if (loggedUserId === response.data.userIdWhoCanEdit) {
          setMuiMessage({open: true, message: 'Momentálne môžete editovať článok', severity: 'success'})
        }
        setArticleAndConnectedUsers(response)
        setAllCollaborators(response.data.allCollaborators)
        const contentEditableCompartment = new Compartment()
        setContentEditableCompartment(contentEditableCompartment)
        let editorState = EditorState.create({
          doc: response.data.text,
          extensions: [
            contentEditableCompartment.of(EditorView.contentAttributes.of({ contenteditable: response.data.userIdWhoCanEdit === loggedUserId && articleCanBeEdited(response.data.articleStatus) })),
            extensions,
            theme,
            onUpdate
          ],
        });
        const newEditorView = new EditorView({state: editorState, parent: editorRef.current});
        setEditorView(newEditorView);

        interval = setInterval(() => {
          let userIdWhoCanEdit = null;
          setArticle((state) => {
            userIdWhoCanEdit = state.userIdWhoCanEdit
            return state;
          });
          if (userIdWhoCanEdit === loggedUserId) {
            // if logged user can edit, then push changes every 5 seconds
            axios.post(process.env.REACT_APP_BECKEND_API_URL + '/collab-session/' + response.data.id,
                {text: getChangedTextFromView(newEditorView)})
            .catch(error => handle401Error(error, history))
            .then(response => {
              if (response) {
                setArticle((state) => {
                  state.text = response.data.text
                  state.userIdWhoCanEdit = response.data.userIdWhoCanEdit
                  state.articleStatus = response.data.articleStatus
                  if (response.data.articleStatus === 'ARCHIVED') {
                    history.push('/archive', {articleId: state.id});
                  }
                  return state;
                });
                setAllConnectedUsers(response.data.allConnectedUsers)
                setAllCollaborators(response.data.allCollaborators)
              }
            })
          } else {
            // if logged user cannot edit, then fetch changes every 5 seconds
            axios.get(process.env.REACT_APP_BECKEND_API_URL + '/collab-session/' + location.state.articleId)
            .catch(error => handle401Error(error, history))
            .then(response => {
              if (response) {
                if (userIdWhoCanEdit !== response.data.userIdWhoCanEdit) {
                  if (loggedUserId === response.data.userIdWhoCanEdit) {
                    setMuiMessage({open: true, message: 'Momentálne môžete editovať článok', severity: 'success'})
                  } else if (response.data.userIdWhoCanEdit) {
                    setMuiMessage({open: true, message: 'Momentálne môže článok editovať váš spolupracovník', severity: 'info'});
                  }
                }
                const mergedArticleObject = {...article, ...response.data};
                setArticle(mergedArticleObject);
                setAllConnectedUsers(response.data.allConnectedUsers)
                setAllCollaborators(response.data.allCollaborators)
                newEditorView.dispatch({
                  effects: contentEditableCompartment.reconfigure(
                      EditorView.contentAttributes.of({
                        contenteditable: response.data.userIdWhoCanEdit === loggedUserId
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
        if (node.children) {
          node.children.forEach(children => {
            if (children.textContent) {
              children.text.forEach(text => changedText = changedText + text.replace("", '\n'));
            }
          });
        } else if (node.text) {
          node.text.forEach(text => changedText = changedText + text.replace("", '\n'));
        }
      });
      changedText = changedText.substring(1)
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
      state.userIdWhoCanEdit = null
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

  function saveArticleVersion() {
    axios.put(process.env.REACT_APP_BECKEND_API_URL + '/article/' + article.id,
        {...article, id: article.id, text: getChangedTextFromView(editorView)})
    .catch(error => handleError(error))
    .then(response => {
      if (response) {
        setMuiMessage({message: 'Článok bol úspešne uložený', open: true, severity: 'success'});
      }
    });
  }

  function approveArticle() {
    axios.put(process.env.REACT_APP_BECKEND_API_URL + '/article/approved/' + article.id,
        {...article, id: article.id, text: getChangedTextFromView(editorView)})
    .catch((error => handleError(error)))
    .then(response => {
      if (response) {
        setArticle({...article, articleStatus: response.data.articleStatus})
        setMuiMessage({open: true, message: 'Článok bol úspešne uložený a schválený', severity: 'success'});
      }
    })
  }

  function sendReview() {
    axios.put(process.env.REACT_APP_BECKEND_API_URL + '/article/sent-review/' + article.id,
        {...article, id: article.id, text: getChangedTextFromView(editorView)})
    .catch((error => handleError(error)))
    .then(response => {
      if (response) {
        setArticle({...article, articleStatus: response.data.articleStatus})
        setMuiMessage({open: true, message: 'Recenzia článku bola úspešne odoslaná autorovi', severity: 'success'});
      }
    })
  }

  function sendToReview() {
    axios.put(process.env.REACT_APP_BECKEND_API_URL + '/article/sent-to-review/' + article.id,
        {...article, id: article.id, text: getChangedTextFromView(editorView)})
    .catch((error => handleError(error)))
    .then(response => {
      if (response) {
        setArticle({...article, articleStatus: response.data.articleStatus})
        setMuiMessage({open: true, message: 'Článok bol úspešne odoslaný na recenziu', severity: 'success'});
      }
    })
  }

    function handlePublicationError(error, history) {
      handle401Error(error, history);
      let message;
      if (error.response.data.message === 'A file with this name already exists') {
        message = 'Článok alebo obrázok s rovnakým názvom už v repozitári existuje. Kontaktujte administrátora prosím.';
      } else if (error.response.data.message === 'Publication configuration is not complete') {
        message = 'Konfigurácia publikácie je nedokončená. Kontaktujte administrátora prosím.';
      } else if (error.response.data.message === 'Article publication file name cannot be empty') {
        message = 'Najprv sa uistite, či sú všetky metaúdaje vyplnené a verzia článku je uložená. Inak je cesta k zverejnenému článku nesprávna. Kontaktujte administrátora prosím.';
      } else if (error.response.data.message === 'Invalid path to article') {
        message = 'Cesta k článku v repozitári je nesprávna. Kontaktujte administrátora prosím.';
      } else if (error.response.data.message === 'Branch does not exist') {
        message = 'Vetva v repozitári neexistuje. Kontaktujte administrátora prosím.';
      } else if (error.response.data.message === 'Unauthorized, make sure that private token is correct') {
        message = 'Prístup k repozitáru bol zamietnutý. Uistite sa, či privátny token je správny. Kontaktujte administrátora prosím.';
      } else {
        message = 'Nastala neočakávaná chyba pri publikácií článku. Kontaktujte administrátora prosím.';
      }
      setMuiMessage({open: true, severity: 'error', message: message})
  }

  function publishArticle() {
    axios.put(process.env.REACT_APP_BECKEND_API_URL + '/article/published/' + article.id,
        {...article, id: article.id, text: getChangedTextFromView(editorView)})
    .catch((error => handlePublicationError(error)))
    .then(response => {
      if (response) {
        history.push('/archive', {articleId: article.id, published: true});
      }
    })
  }

  function handleError(error) {
    handle401Error(error, history);
    let message;
     if (error.response.message === 'Article must be first reviewed') {
      message = 'Článok môže byť schválený až po recenzii';
    } else if (error.response.message === 'Article must be in the review') {
      message = 'Recenzia môže byť odoslaná iba vtedy, ak je článok v recenzii';
    } else if (error.response.message === 'Article must be in the writing process') {
      message = 'Článok môže byť odoslaný na recenziu iba vtedy, ak je v stave písania';
    } else if (error.response.status === 400) {
      message = 'Názov a text (max. 100 000 znakov) článku musia byť vyplnené.'
    } else {
      message = 'Nastala neočakávaná chyba pri ukladaní článku';
    }
    setMuiMessage({open: true, severity: 'error', message: message})
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

  function onEditorClick() {
    editorView.focus();
  }

  const selectionRange = editorView && editorView.state && editorView.state.selection ? editorView.state.selection.ranges[0] : null;

  let loggedUserRole = JSON.parse(localStorage.getItem('loggedUser')).role;
  return (
      <div>
        <Header openedArticleId={article.id}
                openedArticleName={article.name}
                userIdWhoCanEditOpenedArticle={article.userIdWhoCanEdit}
                allConnectedUsers={allConnectedUsers}
                allCollaborators={allCollaborators}
                openedArticleStatus={article.articleStatus}
                leaveArticleEdit={() => leaveArticleEdit()}
                approveArticle={() => approveArticle()}
                sendReview={() => sendReview()}
                sendToReview={() => sendToReview()}
                publishArticle={() => publishArticle()}
                saveArticleVersion={() => saveArticleVersion()}/>
        <MuiMessage severity={muiMessage.severity} open={muiMessage.open}
                    onCloseMuiMessage={closeMuiMessage}
                    message={muiMessage.message}/>
        <form>
          <div className="Flex-row">
            <div className="Left-side">
              <div><TextField label="Názov článku" variant="filled"
                              value={article.name} inputProps={{maxLength: 50}}
                              style={{width: "100%"}} name="name" required={true}
                              disabled={article.userIdWhoCanEdit !== loggedUserId}
                              onChange={onInputsValueChange}/></div>
              <TextField label="Abstrakt" variant="filled" maxRows={5}
                         inputProps={{ maxLength: 1000 }} minRows={5}
                         disabled={article.userIdWhoCanEdit !== loggedUserId}
                         value={article.articleAbstract} multiline
                         style={{width: "100%"}} name="articleAbstract"
                         onChange={onInputsValueChange}/>
              <div><TextField label="Kľúčové slová (oddelené čiarkou)"
                              inputProps={{maxLength: 50}}
                              disabled={article.userIdWhoCanEdit !== loggedUserId}
                              name="keyWords" value={article.keyWords}
                              variant="filled" style={{width: "100%"}}
                              onChange={onInputsValueChange}/></div>
              <div><TextField name="publicFileName" inputProps={{maxLength: 50}}
                              label="Názov zverejneného súboru (slug)"
                              value={article.publicFileName}
                              disabled={article.userIdWhoCanEdit !== loggedUserId}
                              style={{width: "100%"}} variant="filled"
                              onChange={onInputsValueChange}/></div>
              {loggedUserRole === 'EDITOR' ? <div>
                <TextField value={article.publicationDecision}
                               name="publicationDecision" inputProps={{ maxLength: 50 }}
                               label="Rozhodnutie o publikácií článku"
                               style={{width: "100%"}} variant="filled"
                           disabled={article.userIdWhoCanEdit !== loggedUserId}
                           onChange={onInputsValueChange}/></div> : null}

              <div>
                <ImageSection articleId={article.id}
                              userIdWhoCanEdit={article.userIdWhoCanEdit}
                              articleStatus={article.articleStatus}
                              onInsertLinkOrImageValueToEditor={(insertedValueFrom, insertedValueTo) => insertLinkOrImageValueToEditor(insertedValueFrom, insertedValueTo)}/>
              </div>

            </div>
            <div className="Center-editor">
              <EditorToolbar setIsNewCommentIconClicked={setIsNewCommentIconClicked} isNewCommentIconClicked={isNewCommentIconClicked}
                             userIdWhoCanEdit={article.userIdWhoCanEdit}
                  onInsertBoldOrItalicValueToEditor={(insertedValue) => insertBoldOrItalicValueToEditor(insertedValue)}
                  onInsertLinkOrImageValueToEditor={(insertedValueFrom, insertedValueTo) => insertLinkOrImageValueToEditor(insertedValueFrom, insertedValueTo)}
                  editorVisible={editorVisible} toggleEditorPreview={() => onToggleEditorPreview()}/>
              <div style={{overflowY: 'auto', height: '76vh', cursor: 'text'}} onClick={() => onEditorClick()}>
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
      </div>
  );
};

export default EditorPage;
