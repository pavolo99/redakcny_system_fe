import React, {useEffect, useRef, useState} from "react";
import './Editor-page.css'
import Header from "../../components/header/Header";
import {EditorView} from "@codemirror/view";
import {EditorSelection, EditorState, SelectionRange} from "@codemirror/state";
import {Button, makeStyles, TextField} from "@material-ui/core";
import {useHistory, useLocation} from "react-router-dom";
import axios from "axios";
import {extensions} from "../../components/codemirror-settings/extensions";
import {theme} from "../../components/codemirror-settings/theme";
import {MuiMessage} from "../../components/mui-message/Mui-message";
import ImageSection from "../../components/image-section/Image-section";
import EditorToolbar from "../../components/editor-toolbar/Editor-toolbar";
import ReactMarkdown from 'react-markdown'
import {apiUrl} from "../../components/environment/environment";
import CommentSection from "../../components/comment-section/Comment-section";

const useStyles = makeStyles(() => ({
  root: {
    "& .MuiFilledInput-root": {
      background: "rgb(255,255,255)"
    }
  }
}));

const EditorPage = () => {
  const location = useLocation();
  const history = useHistory();

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

    useEffect(() => {
    axios.get(apiUrl + '/article/' + location.state.articleId)
    .catch(error => handleError(error))
    .then(response => {
      if (response) {
        const mergedArticleObject = {...article, ...response.data};
        setArticle(mergedArticleObject);

        let editorState = EditorState.create({
          doc: response.data.text,
          extensions: [
            EditorView.contentAttributes.of({ contenteditable: response.data.canLoggedUserEdit }),
            extensions,
            theme,
            onUpdate
          ],
        });
        setEditorView(new EditorView({state: editorState, parent: editorRef.current}));
      }
    });

    return () => {
      setEditorView({})
      setArticle({});
    };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

  const editorRef = useRef();

  const [muiMessage, setMuiMessage] = useState({
    open: false,
    severity: 'success',
    message: 'Článok bol úspešne uložený'
  });

  const [editorView, setEditorView] = useState(null);

  const [editorVisible, setEditorVisible] = useState(true);
  const [isNewCommentIconClicked, setIsNewCommentIconClicked] = useState(false);

  const onInputsValueChange = e => {
    setArticle({...article, [e.target.name]: e.target.value})
  }

  const onUpdate = EditorView.updateListener.of((v) => {
    setArticle(prevState => {
      return {...prevState, text: v.state.doc.toString()}
    });
  });

  function onSaveArticle(event) {
    event.preventDefault();
    axios.put(apiUrl + '/article/' + article.id,
        {...article, id: article.id})
    .catch(error => handleError(error))
    .then(response => {
      if (response) {
        setMuiMessage(prevState => {
          return {...prevState, open: true}
        });
      }
    });
  }

  function handleError(error) {
    if (error.response.status === 401) {
      localStorage.clear();
      history.push('/login');
    }
    else if (error.response.status === 400) {
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

  function insertValueToEditorOnCurrentCursorPosition(insertedValue, cursorPositionIndex) {
    let insertTransaction = editorView.state.update({
      changes: {
        from: selectionRange.to,
        insert: insertedValue
      }
    })
    editorView.dispatch(insertTransaction);
    // just shift cursor
    createTextSelection(selectionRange.to + cursorPositionIndex, selectionRange.to + cursorPositionIndex)
  }

  const selectionRange = editorView && editorView.state.selection ? editorView.state.selection.ranges[0] : null;

  return (
      <div>
        <Header openedArticleId={article.id}
                openedArticleName={article.name}
                openedArticleStatus={article.articleStatus}
                changeArticleStatus={(newArticleStatus) => setArticle(prevState => { return {...prevState, articleStatus: newArticleStatus}})}/>
        <MuiMessage severity={muiMessage.severity} open={muiMessage.open}
                    onCloseMuiMessage={closeMuiMessage}
                    message={muiMessage.message}/>
        <form>
          <div className="Flex-row">
            <div className="Key-words">
              <div><TextField label="Kľúčové slová"
                              name="keyWords" value={article.keyWords}
                              variant="filled" style={{width: "100%"}}
                              onChange={onInputsValueChange}
                              className={useStyles().root}/></div>
            </div>
            <div className="Article-name">
              <TextField label="Názov článku" variant="filled"
                         value={article.name}
                         style={{width: "100%"}} name="name"
                         required={true} onChange={onInputsValueChange}
                         className={useStyles().root}/>
            </div>
            <div className="Article-abstract">
              <TextField label="Abstrakt" variant="filled"
                         value={article.articleAbstract}
                         style={{width: "100%"}} name="articleAbstract"
                         onChange={onInputsValueChange}
                         className={useStyles().root}/>
            </div>
          </div>
          <div className="Flex-row">
            <div className="Left-side">
              <div><TextField name="publicFileName"
                              label="Názov zverejneného súboru"
                              value={article.publicFileName}
                              style={{width: "100%"}} variant="filled"
                              onChange={onInputsValueChange}
                              className={useStyles().root}/></div>
              <div><TextField value={article.publicationDecision}
                              name="publicationDecision"
                              label="Rozhodnutie o publikácií článku"
                              style={{width: "100%"}} variant="filled"
                              onChange={onInputsValueChange}
                              className={useStyles().root}/></div>

              <div>
                <ImageSection articleId={article.id}
                              onInsertTextToEditor={(insertedValue, cursorShiftIndex) => insertValueToEditorOnCurrentCursorPosition(insertedValue, cursorShiftIndex)}/>
              </div>

              <Button className="Submit-button" onClick={onSaveArticle}>
                Uložiť článok
              </Button>

            </div>
            <div className="Center-editor Editor">
              <EditorToolbar setIsNewCommentIconClicked={setIsNewCommentIconClicked} isNewCommentIconClicked={isNewCommentIconClicked}
                  onInsertTextToEditor={(insertedValue, cursorShiftIndex) => insertValueToEditorOnCurrentCursorPosition(insertedValue, cursorShiftIndex)}
                  editorVisible={editorVisible} toggleEditorPreview={() => onToggleEditorPreview()}/>
              <div ref={editorRef} className={editorVisible ? '' : 'Invisible'}/>
              <ReactMarkdown children={article.text} className={editorVisible ? 'Invisible' : 'Visible Preview'}/>
            </div>
            <div className="Right-side">
              <CommentSection articleId={article.id}
                              isNewCommentIconClicked={isNewCommentIconClicked}
                              setIsNewCommentIconClicked={setIsNewCommentIconClicked}
                              commentedText={article.text.substring(selectionRange ? selectionRange.from : 0, selectionRange ? selectionRange.to : 0)}
                              selectionRange={selectionRange}
                              selectCommentedText={(from, to) => createTextSelection(from, to)}/>
            </div>
          </div>
        </form>
      </div>
  );
};

export default EditorPage;
