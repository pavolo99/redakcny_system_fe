import React from "react";
import "./Article-list.css"
import {Button} from "@material-ui/core";
import {useHistory} from "react-router-dom";
import axios from "axios";
import ArticleStatus from "../article-status/Article-status";
import {apiUrl} from "../environment/environment";
import ArticleStatusDropdown from "../article-status-dropdown/Article-status-dropdown";

export default function ArticleList(props) {
  const [articles, setArticles] = React.useState([]);
  const [articleStatus, setArticleStatus] = React.useState('ALL');

  function fetchArticlesBasedOnTypeAndStatus() {
    let queryParams = {
      params: {
        queryArticleType: props.selectedArticles,
        queryArticleStatus: articleStatus
      }
    };
    axios.get(apiUrl + '/article/list', queryParams)
    .then((response) => {
      setArticles(response.data);
    });
  }

  const onFilterArticlesByStatus = (event) => {
    setArticleStatus(event.target.value);
  };

  React.useEffect(() => {
    if (props.selectedArticles === 'ARCHIVED' || props.selectedArticles === 'APPROVER') {
      setArticleStatus('ALL');
    }
    fetchArticlesBasedOnTypeAndStatus();
  }, [props.selectedArticles, articleStatus]);

  const history = useHistory();

  function onEditArticle(articleId) {
    axios.get(apiUrl + '/article/' + articleId).then(
        (response) => history.push('/editor', response.data))
  }

  function onCreateNewArticle() {
    axios.post(apiUrl + '/article', {}).then(
        (response) => history.push('/editor', response.data));
  }

  const mappedArticleList =
      <div>
        {articles.map(article => (
            <div key={article.id} onClick={(() => onEditArticle(article.id))}>
              <div className="Article-item">
                <div>{article.name}</div>
                {/*<div>{article.authors}</div>*/}
                <div>Autori</div>
                <div><ArticleStatus name={article.articleStatus}
                                    reviewNumber={article.reviewNumber}/></div>
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
        <div className="Flex-row-space-between">
          <Button className="New-article-button" onClick={onCreateNewArticle}>
            + Nový článok
          </Button>
          <ArticleStatusDropdown articleStatus={articleStatus}
                                 selectedArticles={props.selectedArticles}
                                 filterArticlesByStatus={(event) => onFilterArticlesByStatus(event)}/>
        </div>
        <div className="Article-list">
          <div className="Headers">
            <div>Názov</div>
            <div>Autori</div>
            <div>Stav</div>
            <div>Posledná editácia</div>
            <div>Naposledy upravil</div>
          </div>
          <hr className="Article-divider"/>
          {
            articles && articles.length > 0 ? mappedArticleList :
                <div className="Empty-articles">
                  Žiadne články nevyhovujú kritériám
                </div>
          }
        </div>
      </div>
  );
}
