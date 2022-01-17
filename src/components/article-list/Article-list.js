import React, {useEffect, useState} from "react";
import "./Article-list.css"
import {Button} from "@material-ui/core";
import {useHistory} from "react-router-dom";
import axios from "axios";
import ArticleStatus from "../article-status/Article-status";
import {apiUrl} from "../environment/environment";
import ArticleStatusDropdown from "../article-status-dropdown/Article-status-dropdown";
import {getUsernameWithFullName} from "../../shared/Utils";

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
    .catch(error => handle401(error))
    .then(response => {
      if (response) {
        for (let article of response.data) {
          const updatedAtDate = new Date(article.updatedAt);
          article.updatedAt = updatedAtDate.getDate() + '.' + (updatedAtDate.getMonth() + 1) + '.' + updatedAtDate.getFullYear() + ' ' + updatedAtDate.getHours() + ':' + updatedAtDate.getMinutes();
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

  function onEditArticle(articleId) {
    history.push('/editor', {articleId});
  }

  function onCreateNewArticle() {
    axios.post(apiUrl + '/article', {})
    .catch(error => handle401(error))
    .then(response => {
      if (response) {
        history.push('/editor', {articleId: response.data});
      }
    })
  }

  function handle401(error) {
    if (error.response.status === 401) {
      localStorage.clear();
      history.push('/login');
    }
  }

  const mappedArticleList =
      <div>
        {articles.map(article => (
            <div key={article.id} onClick={(() => onEditArticle(article.id))}>
              <div className="Article-item">
                <div>{article.name}</div>
                <div><ArticleStatus name={article.articleStatus}
                                    reviewNumber={article.reviewNumber}/></div>
                <div>{article.updatedAt}</div>
                <div>{article.updatedBy}</div>
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
