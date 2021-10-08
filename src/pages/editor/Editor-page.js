import React from "react";
import classes from './Editor-page.css'
import Header from "../../components/header/Header";
import {EditorView} from "@codemirror/view";
import {EditorState} from "@codemirror/state";
import {Button, makeStyles, TextField} from "@material-ui/core";
import {useLocation} from "react-router-dom";
import axios from "axios";
import {extensions} from "../../components/codemirror-settings/extensions";
import {theme} from "../../components/codemirror-settings/theme";

const baseURL = "http://localhost:8080/article";

const useStyles = makeStyles(() => ({
  root: {
    "& .MuiFilledInput-root": {
      background: "rgb(255,255,255)"
    }
  }
}));

const EditorPage = (props) => {
  const location = useLocation();
  let articleWithoutCode = {
    name: '',
    keyWords: '',
    articleAbstract: '',
    publicFileName: '',
    publicationDecision: ''
  };
  if (location && location.state) {
    articleWithoutCode.id = location.state.id
    articleWithoutCode.name = location.state.name
    articleWithoutCode.keyWords = location.state.keyWords
    articleWithoutCode.articleAbstract = location.state.articleAbstract
    articleWithoutCode.publicFileName = location.state.publicFileName
    articleWithoutCode.publicationDecision = location.state.publicationDecision
  }

  const editor = React.useRef();
  const [allValues, setAllValues] = React.useState({
    code: '',
    articleName: articleWithoutCode.name,
    keyWords: articleWithoutCode.keyWords,
    articleAbstract: articleWithoutCode.articleAbstract,
    publicFileName: articleWithoutCode.publicFileName,
    publicationDecision: articleWithoutCode.publicationDecision
  });

  const changeHandler = e => {
    setAllValues({...allValues, [e.target.name]: e.target.value})
  }

  const materialClasses = useStyles();

  const onUpdate = EditorView.updateListener.of((v) => {
    setAllValues(prevState => {
      return {...prevState, code: v.state.doc.toString()}
    });
  });

  React.useEffect(() => {

    let textContent = '';
    if (props && props.location && props.location.state) {
      textContent = props.location.state.text;
      setAllValues({...allValues, 'code': textContent})
    }

    let state = EditorState.create({
      doc: textContent,
      extensions: [
        extensions,
        theme,
        onUpdate
      ],
    });
    let view = new EditorView({state, parent: editor.current});

    return () => {
      view.destroy();
    };
  }, []);

  function onSaveArticle(event) {
    event.preventDefault();
    let saveDto = {
      name: allValues.articleName,
      text: allValues.code,
      keyWords: allValues.keyWords,
      articleAbstract: allValues.articleAbstract,
      publicFileName: allValues.publicFileName,
      publicationDecision: allValues.publicationDecision
    }

    if (articleWithoutCode.id) {
      axios.put(baseURL + '/' + articleWithoutCode.id,
          {...saveDto, id: articleWithoutCode.id})
      .then(value => console.log('created: ' + value));
    } else {
      axios.post(baseURL, saveDto).then(
          value => console.log('created: ' + value));
    }
  }

  return (
      <div>
        <Header/>
        <form>
          <div className="Editor-content">
            <div className="Left-side">
              <div><TextField label="Kľúčové slová"
                              name="keyWords" value={allValues.keyWords}
                              variant="filled" style={{width: "100%"}}
                              required={true} onChange={changeHandler}
                              className={materialClasses.root}/></div>
              <div><TextField name="publicFileName"
                              label="Názov zverejneného súboru"
                              value={allValues.publicFileName}
                              style={{width: "100%"}} variant="filled"
                              required={true} onChange={changeHandler}
                              className={materialClasses.root}/></div>
              <div><TextField value={allValues.publicationDecision}
                              name="publicationDecision"
                              label="Rozhodnutie o publikácií článku"
                              style={{width: "100%"}} variant="filled"
                              required={true} onChange={changeHandler}
                              className={materialClasses.root}/></div>

              <Button className="Submit-button" onClick={onSaveArticle}>
                Uložiť článok
              </Button>

            </div>
            <div className="Center-editor">
              <div className="Name-abstract-inputs">
                <div><TextField label="Názov článku" variant="filled"
                                value={allValues.articleName}
                                style={{width: "100%"}} name="articleName"
                                required={true} onChange={changeHandler}
                                className={materialClasses.root}/></div>
                <div><TextField label="Abstrakt" variant="filled"
                                value={allValues.articleAbstract}
                                style={{width: "100%"}} name="articleAbstract"
                                required={true} onChange={changeHandler}
                                className={materialClasses.root}/></div>
              </div>
              <div ref={editor}></div>
            </div>
            <div className="Right-side">
              Komentare budu coskoro
            </div>
          </div>
        </form>
      </div>
  );
};

export default EditorPage;
