import React, {useState} from "react";
import "./Header.css"
import {useHistory} from "react-router-dom";
import ThreeDotsMenu from "../../assets/three-dots-menu.svg"
import ThreeDotsMenuExpanded from "../../assets/three-dots-menu-expanded.svg"
import Review from "../../assets/review.svg"
import Approve from "../../assets/approve.svg"
import Logout from "../../assets/logout.png"
import ActionsMenu from "../actions-menu/Actions-menu";
import {MuiMessage} from "../mui-message/Mui-message";
import axios from "axios";
import {apiUrl} from "../environment/environment";
import Avatar from 'react-avatar';
import ShareArticleItem from "../share-article-dialog/Share-article-item";
import {getFullName, handle401Error} from "../../shared/Utils";

export default function Header(props) {
  const history = useHistory();

  const onRedirectToDashboard = () => {
    history.push('/dashboard')
  }

  const [isMenuClicked, setIsMenuClicked] = useState(false);

  const [muiMessage, setMuiMessage] = useState({
    open: false,
    severity: '',
    message: ''
  });

  const closeMuiMessage = () => {
    setMuiMessage(prevState => {
      return {...prevState, open: false}
    })
  }

  function onMenuClick() {
    setIsMenuClicked((prevState) => !prevState);
  }

  function onRemoveArticle() {
    const messageData = createMessageData('Článok bol úspešne vymazaný');
    axios.delete(apiUrl + '/article/deleted/' + props.openedArticleId)
    .catch((error) => {
      handleError(messageData, error,
          'Article must be in writing state and cannot be after any review',
          'Článok môže byť vymazaný iba, ak článok nie je a ani nebol v žiadnej recenzii');
    })
    .finally(() => setMuiMessage(messageData));
  }

  function onShowArticleVersions() {
    history.push('/versions', props.openedArticleId)
  }

  function onDownloadArticle() {
    console.log('download');
  }

  function onPublishArticle() {
    const messageData = createMessageData(
        'Článok bol úspešne publikovaný a archivovaný');
    axios.put(apiUrl + '/article/published/' + props.openedArticleId)
    .catch((error) => {
      handleError(messageData, error, 'Article must be approved',
          'Článok musí byť schválený');
    })
    .then(response => handleArticleStatusChangeEventFromResponse(response))
    .finally(() => setMuiMessage(messageData));
  }

  function onDenyArticle() {
    const messageData = createMessageData(
        'Článok bol úspešne zamietnutý a archivovaný');
    axios.put(apiUrl + '/article/denied/' + props.openedArticleId)
    .catch((error) => {
      handleError(messageData, error, 'Article must be after review',
          'Článok musí byť po recenzii');
    })
    .then(response => handleArticleStatusChangeEventFromResponse(response))
    .finally(() => setMuiMessage(messageData));
  }

  function onArchiveArticle() {
    const messageData = createMessageData('Článok bol úspešne archivovaný');
    axios.put(apiUrl + '/article/archived/' + props.openedArticleId)
    .catch((error) => {
      handleError(messageData, error,
          'Article must be first reviewed or approved',
          'Článok musí byť po recenzii alebo musí byť schválený');
    })
    .then(response => handleArticleStatusChangeEventFromResponse(response))
    .finally(() => setMuiMessage(messageData));
  }

  function onSendToReview() {
    const messageData = createMessageData(
        'Článok bol úspešne odoslaný na recenziu');
    axios.put(apiUrl + '/article/sent-to-review/' + props.openedArticleId)
    .catch((error) => {
      handleError(messageData, error, 'Article must be in the writing process',
          'Článok môže byť odoslaný na recenziu iba, ak je v stave písania');
    })
    .then(response => handleArticleStatusChangeEventFromResponse(response))
    .finally(() => setMuiMessage(messageData));
  }

  function onSendReview() {
    const messageData = createMessageData(
        'Recenzia článku bola úspešne odoslaná autorovi');
    axios.put(apiUrl + '/article/sent-review/' + props.openedArticleId)
    .catch((error) => {
      handleError(messageData, error, 'Article must be in the review',
          'Recenzia môže byť odoslaná iba, ak je článok v recenzii');
    })
    .then(response => handleArticleStatusChangeEventFromResponse(response))
    .finally(() => setMuiMessage(messageData));
  }

  function onApproveArticle() {
    const messageData = createMessageData('Článok bol úspešne schválený');
    axios.put(apiUrl + '/article/approved/' + props.openedArticleId)
    .catch((error) => {
      handleError(messageData, error, 'Article must be first reviewed',
          'Článok môže byť schválený až po recenzii');
    })
    .then(response => handleArticleStatusChangeEventFromResponse(response))
    .finally(() => setMuiMessage(messageData));
  }

  function handleArticleStatusChangeEventFromResponse(response) {
    if (response) {
      props.changeArticleStatus(response.data.articleStatus);
    }
  }

  function createMessageData(message) {
    return {
      open: true,
      message: message,
      severity: 'success'
    };
  }

  function handleError(messageData, error, responseMessage, errorMessage) {
    handle401Error(error, history);
    messageData.severity = 'error';
    if (error.response.data.message === responseMessage) {
      messageData.message = errorMessage;
    } else {
      messageData.message = 'Nastala neočakávaná chyba pri schvaľovaní článku'
    }
  }

  let loggedUser = JSON.parse(localStorage.getItem('loggedUser'));
  const isLoggedUserAuthor = loggedUser.role === 'AUTHOR';

  const editorActionsMenu = <>
    <div style={{minWidth: '25%', display: 'flex', flexDirection: 'row'}}>
      {isLoggedUserAuthor && props.openedArticleStatus === 'WRITING' ?
        <div className="Quick-menu-item" onClick={() => onSendToReview()}>
          <img src={Review} alt="Odoslať na recenziu"
               className="Quick-menu-img"/>
          <div className="Quick-menu-text">Odoslať na recenziu</div>
        </div> : null}
      {!isLoggedUserAuthor && props.openedArticleStatus === 'IN_REVIEW' ?
          <div className="Quick-menu-item" onClick={() => onSendReview()}>
            <img src={Review} alt="Odoslať recenziu"
                 className="Quick-menu-img"/>
            <div className="Quick-menu-text">Odoslať recenziu</div>
          </div> : null}
      {!isLoggedUserAuthor && props.openedArticleStatus === 'IN_REVIEW' ?
          <div className="Quick-menu-item" onClick={() => onApproveArticle()}>
            <img src={Approve} alt="Schváliť" className="Quick-menu-img"/>
            <div className="Quick-menu-text">Schváliť</div>
          </div> : null}
    </div>
    <img
        src={isMenuClicked ? ThreeDotsMenuExpanded : ThreeDotsMenu}
        alt="Menu" className="Three-dots-menu"
        onClick={() => onMenuClick()}/>
    {isMenuClicked ? <ActionsMenu openedArticleId={props.openedArticleId}
                                  articleStatus={props.openedArticleStatus}
                                  onShowArticleVersions={onShowArticleVersions}
                                  onRemoveArticle={onRemoveArticle}
                                  onDownloadArticle={onDownloadArticle}
                                  onDenyArticle={onDenyArticle}
                                  onPublishArticle={onPublishArticle}
                                  onArchiveArticle={onArchiveArticle}/> : null}
  </>;

  function onLogout() {
    localStorage.clear();
    history.push('/login');
  }

  return (
      <div className="Header">
        <div className="App-link" onClick={onRedirectToDashboard}>
          <span>Redakčný systém</span>
        </div>
        <div className="Vertical-divider"/>
        {props.openedArticleId ? editorActionsMenu : null}
        <div className="Share-avatar-row">{props.openedArticleId ? <div className="Share-item">
          <ShareArticleItem
              openedArticleName={props.openedArticleName}
              openedArticleId={props.openedArticleId}/>
        </div> : null}
            <img src={Logout} className="Logout-button" alt="Odhlásiť sa" onClick={onLogout}/>
          <div className="Avatar">
            <Avatar name={getFullName(loggedUser)} round={true} size="40"
                    fgColor="black" color="white"/>
          </div>
        </div>
        <MuiMessage severity={muiMessage.severity} open={muiMessage.open}
                    onCloseMuiMessage={closeMuiMessage}
                    message={muiMessage.message}/>
      </div>
  );
}
