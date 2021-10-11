import React from "react";
import "./ArticleList.css"
import {Button} from "@material-ui/core";
import {useHistory} from "react-router-dom";
import axios from "axios";
import ArticleStatus from "../article-status/Article-status";

const baseURL = "http://localhost:8080/article";

export default function ArticleList(props) {
  const [articles, setArticles] = React.useState([]);

  React.useEffect(() => {
    axios.get(baseURL).then((response) => {
      console.log(response)
      setArticles(response.data);
    });
  }, [props.selectedArticles]);

  const history = useHistory();

  function onEditArticle(article) {
    history.push('/editor', article);
    return article;
  }

  const onCreateNewArticle = () => {
    history.push('/editor')
  }

  const mappedArticleList =
      <div>
        {articles.map(article => (
            <div key={article.id} onClick={(() => onEditArticle(article))}>
              <div className="Article-item">
                <div>{article.name}</div>
                {/*<div>{article.authors}</div>*/}
                <div>Autori</div>
                <div><ArticleStatus name={article.articleStatus} reviewNumber={article.reviewNumber} /></div>
                {/*<div>{article.lastEditedOn}</div>*/}
                <div>Dnes</div>
                {/*<div>{article.lastEditedBy}</div>*/}
                <div>Dlugos</div>
              </div>
              <hr className="Article-divider"/>
            </div>
        ))}
      </div>

  return (
      <div className="Content">
        <Button className="New-article-button" onClick={onCreateNewArticle}>
          + Nový článok
        </Button>
        <div className="Article-list">
          <div className="Headers">
            <div>Názov</div>
            <div>Autori</div>
            <div>Stav</div>
            <div>Posledná editácia</div>
            <div>Naposledy upravil</div>
          </div>
          <hr className="Article-divider"/>
          {articles && articles.length > 0 ? mappedArticleList
              : 'Žiadne články nevyhovujú kritériám'}
        </div>
      </div>
  );
}
