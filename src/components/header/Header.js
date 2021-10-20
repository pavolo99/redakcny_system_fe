import React, {useState} from "react";
import "./Header.css"
import {useHistory} from "react-router-dom";
import ThreeDotsMenu from "../../assets/three-dots-menu.svg"
import ThreeDotsMenuExpanded from "../../assets/three-dots-menu-expanded.svg"
import Review from "../../assets/review.svg"
import Approve from "../../assets/approve.svg"
import ActionsMenu from "../actions-menu/Actions-menu";
import {MuiMessage} from "../mui-message/Mui-message";
import axios from "axios";
import {apiUrl} from "../environment/environment";

export default function Header(props) {
  const history = useHistory();

  const onCreateNewArticle = () => {
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
    .finally(() => setMuiMessage(messageData));
  }

  function onApproveArticle() {
    const messageData = createMessageData('Článok bol úspešne schválený');
    axios.put(apiUrl + '/article/approved/' + props.openedArticleId)
    .catch((error) => {
      handleError(messageData, error, 'Article must be first reviewed',
          'Článok môže byť schválený až po recenzii');
    })
    .finally(() => setMuiMessage(messageData));
  }

  function createMessageData(message) {
    return {
      open: true,
      message: message,
      severity: 'success'
    };
  }

  function handleError(messageData, error, responseMessage, errorMessage) {
    messageData.severity = 'error';
    if (error.response.data.message === responseMessage) {
      messageData.message = errorMessage;
    } else {
      messageData.message = 'Nastala neočakávaná chyba pri schvaľovaní článku'
    }
  }

  const editorActionsMenu = <>
    <div className="Quick-menu-item" onClick={() => onSendToReview()}>
      <img src={Review} alt="Review"
           className="Quick-menu-img"/>
      <div className="Quick-menu-text">Odoslať na recenziu</div>
    </div>
    <div className="Quick-menu-item" onClick={() => onSendReview()}>
      <img src={Review} alt="Review"
           className="Quick-menu-img"/>
      <div className="Quick-menu-text">Odoslať recenziu</div>
    </div>
    <div className="Quick-menu-item" onClick={() => onApproveArticle()}>
      <img src={Approve} alt="Approve" className="Quick-menu-img"/>
      <div className="Quick-menu-text">Schváliť</div>
    </div>
    <img
        src={isMenuClicked ? ThreeDotsMenuExpanded : ThreeDotsMenu}
        alt="Three dots" className="Three-dots-menu"
        onClick={() => onMenuClick()}/>
    {isMenuClicked ? <ActionsMenu openedArticleId={props.openedArticleId}
                                  articleStatus={props.openedArticleStatus}
                                  className="Dropdown-expansion"
                                  onRemoveArticle={onRemoveArticle}
                                  onDownloadArticle={onDownloadArticle}
                                  onDenyArticle={onDenyArticle}
                                  onPublishArticle={onPublishArticle}
                                  onArchiveArticle={onArchiveArticle}/> : null}
  </>

  return (
      <div className="Header">
        <div className="App-link" onClick={onCreateNewArticle}>
          <span>Redakčný systém</span>
        </div>
        <div className="Vertical-divider"/>
        {props.openedArticleId ? editorActionsMenu : null}
        <MuiMessage severity={muiMessage.severity} open={muiMessage.open}
                    onCloseMuiMessage={closeMuiMessage}
                    message={muiMessage.message}/>
      </div>
  );
}
