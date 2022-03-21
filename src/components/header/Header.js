import React, {useState} from "react";
import "./Header.css"
import {useHistory} from "react-router-dom";
import ThreeDotsMenu from "../../assets/three-dots-menu.svg"
import ThreeDotsMenuExpanded from "../../assets/three-dots-menu-expanded.svg"
import Review from "../../assets/review.svg"
import Approve from "../../assets/approve.svg"
import Logout from "../../assets/logout.png"
import Admin from "../../assets/admin.svg"
import ActionsMenu from "../actions-menu/Actions-menu";
import {MuiMessage} from "../mui-message/Mui-message";
import axios from "axios";
import Avatar from 'react-avatar';
import ShareArticleItem from "../share-article-dialog/Share-article-item";
import {
  generateHSLColorBasedOnUserInfo,
  getFullName, getUserValue,
  handle401Error
} from "../../shared/Utils";

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
    axios.delete(process.env.REACT_APP_BECKEND_API_URL + '/article/deleted/' + props.openedArticleId)
    .catch((error) => {
      handleError(messageData, error, 'Article cannot be deleted', 'Článok nemôže byť vymazaný.');
    })
    .finally(() => setMuiMessage(messageData));
  }

  function onShowArticleVersions() {
    history.push('/versions', props.openedArticleId)
  }

  function onPublishArticle() {
    const messageData = createMessageData('Článok bol úspešne publikovaný a archivovaný');
    axios.put(process.env.REACT_APP_BECKEND_API_URL + '/article/published/' + props.openedArticleId)
    .catch((error) => {
      handlePublicationError(error, history, messageData);
    })
    .then((response) => {
      if (response) {
        history.push('/archive', {articleId: props.openedArticleId, published: true});
      }
    })
    .finally(() => setMuiMessage(messageData));
  }

  function handlePublicationError(error, history, messageData) {
    handle401Error(error, history);
    messageData.severity = 'error';
    if (error.response.data.message === 'A file with this name already exists') {
      messageData.message = 'Článok alebo obrázok s rovnakým názvom už v repozitári existuje. Kontaktujte administrátora prosím.';
    } else if (error.response.data.message === 'Publication configuration is not complete') {
      messageData.message = 'Konfigurácia publikácie je nedokončená. Kontaktujte administrátora prosím.';
    } else if (error.response.data.message === 'Article publication file name cannot be empty') {
      messageData.message = 'Najprv sa uistite, či sú všetky metaúdaje vyplnené a verzia článku je uložená. Inak je cesta k zverejnenému článku nesprávna. Kontaktujte administrátora prosím.';
    } else if (error.response.data.message === 'Invalid path to article') {
      messageData.message = 'Cesta k článku v repozitári je nesprávna. Kontaktujte administrátora prosím.';
    } else if (error.response.data.message === 'Branch does not exist') {
      messageData.message = 'Vetva v repozitári neexistuje. Kontaktujte administrátora prosím.';
    } else if (error.response.data.message === 'Unauthorized, make sure that private token is correct') {
      messageData.message = 'Prístup k repozitáru bol zamietnutý. Uistite sa, či privátny token je správny. Kontaktujte administrátora prosím.';
    } else {
      messageData.message = 'Nastala neočakávaná chyba pri publikácií článku. Kontaktujte administrátora prosím.';
    }
  }

  function onDenyArticle() {
    const messageData = createMessageData(
        'Článok bol úspešne zamietnutý a archivovaný');
    axios.put(process.env.REACT_APP_BECKEND_API_URL + '/article/denied/' + props.openedArticleId)
    .catch((error) => {
      handleError(messageData, error, 'Article must be after review',
          'Článok musí byť po recenzii');
    })
    .then(response => {
      if (response) {
        handleArticleStatusChangeEventFromResponse(response);
      }
    })
    .finally(() => setMuiMessage(messageData));
  }

  function onArchiveArticle() {
    const messageData = createMessageData('Článok bol úspešne archivovaný');
    axios.put(process.env.REACT_APP_BECKEND_API_URL + '/article/archived/' + props.openedArticleId)
    .catch((error) => {
      handleError(messageData, error,
          'Article must be first reviewed or approved',
          'Článok musí byť po recenzii alebo musí byť schválený');
    })
    .then(response => {
      if (response) {
        history.push('/archive', {articleId: props.openedArticleId});
      }
    })
    .finally(() => setMuiMessage(messageData));
  }

  function onSendToReview() {
    const messageData = createMessageData(
        'Článok bol úspešne odoslaný na recenziu');
    axios.put(process.env.REACT_APP_BECKEND_API_URL + '/article/sent-to-review/' + props.openedArticleId)
    .catch((error) => {
      handleError(messageData, error, 'Article must be in the writing process',
          'Článok môže byť odoslaný na recenziu iba, ak je v stave písania');
    })
    .then(response => {
      if (response) {
        handleArticleStatusChangeEventFromResponse(response);
      }
    })
    .finally(() => setMuiMessage(messageData));
  }

  function onSendReview() {
    const messageData = createMessageData(
        'Recenzia článku bola úspešne odoslaná autorovi');
    axios.put(process.env.REACT_APP_BECKEND_API_URL + '/article/sent-review/' + props.openedArticleId)
    .catch((error) => {
      handleError(messageData, error, 'Article must be in the review',
          'Recenzia môže byť odoslaná iba, ak je článok v recenzii');
    })
    .then(response => {
      if (response) {
        handleArticleStatusChangeEventFromResponse(response);
      }
    })
    .finally(() => setMuiMessage(messageData));
  }

  function onApproveArticle() {
    const messageData = createMessageData('Článok bol úspešne schválený');
    axios.put(process.env.REACT_APP_BECKEND_API_URL + '/article/approved/' + props.openedArticleId)
    .catch((error) => {
      handleError(messageData, error, 'Article must be first reviewed',
          'Článok môže byť schválený až po recenzii');
    })
    .then(response => {
      if (response) {
        handleArticleStatusChangeEventFromResponse(response)
      }
    })
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
      messageData.message = 'Nastala neočakávaná chyba pri ukladaní článku'
    }
  }

  function onNavigateToAdministration() {
    history.push('/administration');
  }

  let loggedUser = JSON.parse(localStorage.getItem('loggedUser'));
  const isLoggedUserAuthor = loggedUser.role === 'AUTHOR';

  const editorActionsMenu = <>
    <img
        src={isMenuClicked ? ThreeDotsMenuExpanded : ThreeDotsMenu}
        alt="Menu" className="Three-dots-menu"
        onClick={() => onMenuClick()}/>
    {isMenuClicked ? <ActionsMenu openedArticleId={props.openedArticleId}
                                  articleStatus={props.openedArticleStatus}
                                  onShowArticleVersions={onShowArticleVersions}
                                  onRemoveArticle={onRemoveArticle}
                                  onDenyArticle={onDenyArticle}
                                  onPublishArticle={onPublishArticle}
                                  onArchiveArticle={onArchiveArticle}/>
        : <div style={{width: '252px'}}/>}
    <div className="Quick-action-items">
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
  </>;

  const administration = <div>
    <div className="Quick-menu-item" onClick={() => onNavigateToAdministration()}>
      <img src={Admin} alt="Schváliť" className="Quick-menu-img"/>
      <div className="Quick-menu-text">Administrácia</div>
    </div>
  </div>

  const allConnectedUsersToArticle =
      <div className="Connected-users">
        {props.allConnectedUsers ? props.allConnectedUsers.map(user => (
            <div key={user.id}>
              <Avatar name={getFullName(user)} fgColor="white" round={true} size="35"
                  color={generateHSLColorBasedOnUserInfo(getUserValue(user))}/>
            </div>
        )) : null}
      </div>

  function onLogout() {
    history.push('/login');
    setTimeout(() => {
      localStorage.clear();
    }, 100)
  }

  const loggedUserAdministrator = loggedUser.administrator === 'true';

  return (
      <div className="Header">
        <div className="App-link" onClick={onRedirectToDashboard}>
          <span>Redakčný systém</span>
        </div>
        <div className="Vertical-divider"/>
        {props.openedArticleId ? editorActionsMenu : null}
        {!props.openedArticleId && loggedUserAdministrator ? administration : null}
        <div className="Share-avatar-row">{props.openedArticleId ? <div className="Share-item">
          <ShareArticleItem
              openedArticleName={props.openedArticleName}
              openedArticleId={props.openedArticleId}/>
        </div> : null}
          <div>{props.openedArticleId ? allConnectedUsersToArticle : null}</div>
          <img src={Logout} className="Logout-button" alt="Odhlásiť sa" title="Odhlásiť sa" onClick={onLogout}/>
          {!props.openedArticleId ? <div className="Avatar">
            <Avatar name={getFullName(loggedUser)} round={true} size="40"
                    fgColor="black" color="white"/>
          </div> : null}
        </div>
        <MuiMessage severity={muiMessage.severity} open={muiMessage.open}
                    onCloseMuiMessage={closeMuiMessage}
                    message={muiMessage.message}/>
      </div>
  );
}
