import React, {useEffect, useState} from "react";
import "./Article-list.css"
import {Button} from "@material-ui/core";
import {useHistory} from "react-router-dom";
import axios from "axios";
import ArticleStatus from "../article-status/Article-status";
import {apiUrl} from "../environment/environment";
import ArticleStatusDropdown from "../article-status-dropdown/Article-status-dropdown";
import {
  convertTimestampToDate,
  getUsernameWithFullName, handle401Error
} from "../../shared/Utils";

export default function ArticleList(props) {
  const [articles, setArticles] = useState([]);
  const [articleStatus, setArticleStatus] = useState('ALL');
  let loggedUserId = JSON.parse(localStorage.getItem('loggedUser')).id;

  function fetchArticlesBasedOnTypeAndStatus() {
    let queryParams = {
      params: {
        queryArticleType: props.selectedArticles,
        queryArticleStatus: articleStatus
      }
    };
    axios.get(apiUrl + '/article/list', queryParams)
    .catch(error => handle401Error(error, history))
    .then(response => {
      if (response) {
        for (let article of response.data) {
          article.updatedAt = convertTimestampToDate(article.updatedAt);
          article.updatedBy = loggedUserId === article.updatedBy.id ? 'Vy' : getUsernameWithFullName(article.updatedBy);
        }
        setArticles(response.data);
      }
    });
  }

  const onFilterArticlesByStatus = (event) => {
    setArticleStatus(event.target.value);
  };

  useEffect(() => {
    if (props.selectedArticles === 'ARCHIVED' || props.selectedArticles === 'APPROVER') {
      setArticleStatus('ALL');
    }
    fetchArticlesBasedOnTypeAndStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.selectedArticles, articleStatus]);

  const history = useHistory();

  function onEditArticle(articleId, articleStatus) {
    history.push(articleStatus === 'ARCHIVED' ? '/archive' : '/editor', {articleId});
  }

  function onCreateNewArticle() {
    axios.post(apiUrl + '/article', {})
    .catch(error => handle401Error(error, history))
    .then(response => {
      if (response) {
        history.push('/editor', {articleId: response.data});
      }
    })
  }

  let loggedUserRole = JSON.parse(localStorage.getItem('loggedUser')).role;

  const mappedArticleList =
      <div>
        {articles.map(article => (
            <div key={article.id} onClick={(() => onEditArticle(article.id, article.articleStatus))}>
              <div className="Article-item">
                <div>{article.name}</div>
                <div><ArticleStatus name={article.articleStatus}
                                    reviewNumber={article.reviewNumber}/></div>
                <div>{article.updatedAt}</div>
                <div>{article.updatedBy}</div>
                {loggedUserRole === 'EDITOR' && props.selectedArticles === 'REVIEWED_BY_ME' ? <div>{article.publicationDecision}</div> : null }
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
            <div>Stav</div>
            <div>Posledná editácia</div>
            <div>Naposledy upravil</div>
            {loggedUserRole === 'EDITOR' && props.selectedArticles === 'REVIEWED_BY_ME' ? <div>Informácia o publikácií</div> : null }
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
