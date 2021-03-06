import React, {useEffect, useState} from "react";
import "./Article-list.css"
import {Button} from "@material-ui/core";
import {useHistory} from "react-router-dom";
import axios from "axios";
import ArticleStatus from "../article-status/Article-status";
import ArticleStatusDropdown from "../article-status-dropdown/Article-status-dropdown";
import {
  convertTimestampToDate,
  getUsernameWithFullName, handle401Error
} from "../../shared/Utils";

export default function ArticleList(props) {
  const history = useHistory();
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
    axios.get(process.env.REACT_APP_BECKEND_API_URL + '/article/list', queryParams)
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
    setArticleStatus('ALL');
    fetchArticlesBasedOnTypeAndStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.selectedArticles]);

  useEffect(() => {
    fetchArticlesBasedOnTypeAndStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleStatus]);


  function onEditArticle(articleId, articleStatus) {
    history.push(articleStatus === 'ARCHIVED' ? '/archive' : '/editor', {articleId});
  }

  function onCreateNewArticle() {
    axios.post(process.env.REACT_APP_BECKEND_API_URL + '/article', {})
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
                <div><ArticleStatus name={article.articleStatus} reviewNumber={article.reviewNumber}/></div>
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
          <Button className="New-article-button" onClick={onCreateNewArticle} title="Vytvori?? nov?? ??l??nok">
            + Nov?? ??l??nok
          </Button>
          <ArticleStatusDropdown articleStatus={articleStatus}
                                 selectedArticles={props.selectedArticles}
                                 filterArticlesByStatus={(event) => onFilterArticlesByStatus(event)}/>
        </div>
        <div className="Article-list">
          <div className="Headers">
            <div>N??zov</div>
            <div>Stav</div>
            <div>Posledn?? edit??cia</div>
            <div>Naposledy upravil</div>
            {loggedUserRole === 'EDITOR' && props.selectedArticles === 'REVIEWED_BY_ME' ? <div>Inform??cia o publik??ci??</div> : null }
          </div>
          <hr className="Article-divider"/>
          {
            articles && articles.length > 0 ? mappedArticleList :
                <div className="Empty-articles">
                  ??iadne ??l??nky nevyhovuj?? krit??ri??m
                </div>
          }
        </div>
      </div>
  );
}
