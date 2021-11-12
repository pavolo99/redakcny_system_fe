import React from "react";
import './Editor-page.css'
import Header from "../../components/header/Header";
import {EditorView} from "@codemirror/view";
import {EditorState} from "@codemirror/state";
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

const useStyles = makeStyles(() => ({
  root: {
    "& .MuiFilledInput-root": {
      background: "rgb(255,255,255)"
    }
  }
}));

const EditorPage = (props) => {
  const location = useLocation();
  const history = useHistory();

  if (!localStorage.getItem("loggedUser")) {
    history.push('/login');
  }

  let articleWithoutCode = {
    name: '',
    keyWords: '',
    articleAbstract: '',
    publicFileName: '',
    publicationDecision: ''
  };
  if (location && location.state) {
    articleWithoutCode.id = location.state.id
    articleWithoutCode.name = location.state.name ?? ''
    articleWithoutCode.keyWords = location.state.keyWords ?? ''
    articleWithoutCode.articleAbstract = location.state.articleAbstract ?? ''
    articleWithoutCode.publicFileName = location.state.publicFileName ?? ''
    articleWithoutCode.publicationDecision = location.state.publicationDecision ?? ''
    articleWithoutCode.articleStatus = location.state.articleStatus ?? ''
  }

  const editor = React.useRef();
  const [allValues, setAllValues] = React.useState({
    text: '',
    name: articleWithoutCode.name,
    keyWords: articleWithoutCode.keyWords,
    articleAbstract: articleWithoutCode.articleAbstract,
    publicFileName: articleWithoutCode.publicFileName,
    publicationDecision: articleWithoutCode.publicationDecision
  });

  const [muiMessage, setMuiMessage] = React.useState({
    open: false,
    severity: 'success',
    message: 'Článok bol úspešne uložený'
  });

  const [editorView, setEditorView] = React.useState(null);

  const [editorVisible, setEditorVisible] = React.useState(true);

  const changeHandler = e => {
    setAllValues({...allValues, [e.target.name]: e.target.value})
  }

  const onUpdate = EditorView.updateListener.of((v) => {
    setAllValues(prevState => {
      return {...prevState, text: v.state.doc.toString()}
    });
  });

  React.useEffect(() => {
    let textContent = '';
    if (props && props.location && props.location.state) {
      textContent = props.location.state.text;
      setAllValues({...allValues, text: textContent})
    }

    let editorState = EditorState.create({
      doc: textContent,
      extensions: [
        extensions,
        theme,
        onUpdate
      ],
    });
    setEditorView(new EditorView({state: editorState, parent: editor.current}));

    // TODO reconsider this destroy method
    // return () => {
    //   view.viewState.destroy();
    // };
  }, []);

  function onSaveArticle(event) {
    event.preventDefault();
    axios.put(apiUrl + '/article/' + articleWithoutCode.id,
        {...allValues, id: articleWithoutCode.id})
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

  function onImageInsertion(imageSource) {
    let insertImageTransaction = editorView.state.update({
      changes: {
        from: editorView.state.doc.length,
        insert: "\n![Pridajte nejaký popis obrázku](" + imageSource + ")"
      }
    })
    editorView.dispatch(insertImageTransaction);
  }

  function onToggleEditorPreview() {
    setEditorVisible(prevState => !prevState);
  }

  return (
      <div>
        <Header openedArticleId={articleWithoutCode.id}
                openedArticleStatus={articleWithoutCode.articleStatus}/>
        <MuiMessage severity={muiMessage.severity} open={muiMessage.open}
                    onCloseMuiMessage={closeMuiMessage}
                    message={muiMessage.message}/>
        <form>
          <div className="Flex-row">
            <div className="Key-words">
              <div><TextField label="Kľúčové slová"
                              name="keyWords" value={allValues.keyWords}
                              variant="filled" style={{width: "100%"}}
                              required={true} onChange={changeHandler}
                              className={useStyles().root}/></div>
            </div>
            <div className="Article-name">
              <TextField label="Názov článku" variant="filled"
                         value={allValues.name}
                         style={{width: "100%"}} name="name"
                         required={true} onChange={changeHandler}
                         className={useStyles().root}/>
            </div>
            <div className="Article-abstract">
              <TextField label="Abstrakt" variant="filled"
                         value={allValues.articleAbstract}
                         style={{width: "100%"}} name="articleAbstract"
                         required={true} onChange={changeHandler}
                         className={useStyles().root}/>
            </div>
          </div>
          <div className="Flex-row">
            <div className="Left-side">
              <div><TextField name="publicFileName"
                              label="Názov zverejneného súboru"
                              value={allValues.publicFileName}
                              style={{width: "100%"}} variant="filled"
                              required={true} onChange={changeHandler}
                              className={useStyles().root}/></div>
              <div><TextField value={allValues.publicationDecision}
                              name="publicationDecision"
                              label="Rozhodnutie o publikácií článku"
                              style={{width: "100%"}} variant="filled"
                              required={true} onChange={changeHandler}
                              className={useStyles().root}/></div>

              <div>
                <ImageSection
                    insertImage={(imageSource) => onImageInsertion(imageSource)}
                    articleId={articleWithoutCode.id}/>
              </div>

              <Button className="Submit-button" onClick={onSaveArticle}>
                Uložiť článok
              </Button>

            </div>
            <div className="Center-editor Editor">
              <EditorToolbar editorVisible={editorVisible} toggleEditorPreview={() => onToggleEditorPreview()}/>
              <div ref={editor} className={editorVisible ? '' : 'Invisible'}/>
              <ReactMarkdown children={allValues.text} className={editorVisible ? 'Invisible' : 'Visible Preview'}/>
            </div>
            <div className="Right-side">
            </div>
          </div>
        </form>
      </div>
  );
};

export default EditorPage;
