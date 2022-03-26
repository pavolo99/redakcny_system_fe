import React, {useState} from "react";
import "./Header.css"
import {useHistory} from "react-router-dom";
import Review from "../../assets/review.svg"
import Approve from "../../assets/approve.svg"
import Versions from "../../assets/versions.svg"
import Logout from "../../assets/logout.png"
import Admin from "../../assets/admin.svg"
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Fade from '@mui/material/Fade';
import MenuIcon from '@mui/icons-material/Menu';
import {MuiMessage} from "../mui-message/Mui-message";
import axios from "axios";
import Avatar from 'react-avatar';
import ShareArticleItem from "../share-article-dialog/Share-article-item";
import {getFullName, handle401Error} from "../../shared/Utils";
import Logo from "../../assets/redaction-system-logo.svg";
import {Tooltip} from "@mui/material";
import CollabInfoDialog from "../collab-info-dialog/Collab-info-dialog";

export default function Header(props) {
  const history = useHistory();

  const onRedirectToDashboard = () => {
    history.push('/dashboard')
  }

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

  function onRemoveArticle() {
    const messageData = createMessageData('Článok bol úspešne vymazaný');
    axios.delete(process.env.REACT_APP_BECKEND_API_URL + '/article/deleted/' + props.openedArticleId)
    .catch((error) => {
      handleError(messageData, error, 'Article cannot be deleted', 'Článok po odoslaní na recenziu už nemôže byť vymazaný.');
    })
    .finally(() => history.push('/dashboard'));
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
    const messageData = createMessageData('Článok bol úspešne odoslaný na recenziu');
    axios.put(process.env.REACT_APP_BECKEND_API_URL + '/article/sent-to-review/' + props.openedArticleId)
    .catch((error) => {
      handleError(messageData, error, 'Article must be in the writing process',
          'Článok môže byť odoslaný na recenziu iba, ak je v stave písania');
    })
    .then(response => {
      if (response) {
        handleArticleStatusChangeEventFromResponse(response);
        onMenuClose()
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

  function leaveArticleEdit() {
    props.leaveArticleEdit()
  }

  let loggedUser = JSON.parse(localStorage.getItem('loggedUser'));
  const isLoggedUserAuthor = loggedUser.role === 'AUTHOR';

  const [anchorEl, setAnchorEl] = React.useState(null);
  const isMenuOpen = Boolean(anchorEl);
  const onMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const onMenuClose = () => {
    setAnchorEl(null);
  };

  const editorActionsMenu = <>
    <Button startIcon={<MenuIcon style={{marginBottom: '1px', fontSize: '160%'}} /> }
            style={{color: 'white', textTransform: 'none', fontSize: '160%', marginLeft: '0.5rem', marginTop: '2px'}}
        id="menu-button" aria-controls={isMenuOpen ? 'fade-menu' : undefined}
        aria-haspopup="true" title="Menu" onClick={onMenuOpen}
        aria-expanded={isMenuOpen ? 'true' : undefined}/>
    <Menu id="fade-menu" MenuListProps={{'aria-labelledby': 'menu-button'}}
        anchorEl={anchorEl} open={isMenuOpen} onClose={onMenuClose} TransitionComponent={Fade}>
      <MenuItem onClick={() => onSendToReview()} disabled={props.openedArticleStatus !== 'WRITING'}>Odoslať na recenziu</MenuItem>
      <MenuItem onClick={() => onSendReview()} disabled={isLoggedUserAuthor || props.openedArticleStatus !== 'IN_REVIEW'}>Odoslať recenziu</MenuItem>
      <MenuItem onClick={() => onApproveArticle()} disabled={isLoggedUserAuthor || props.openedArticleStatus !== 'IN_REVIEW'}>Schváliť</MenuItem>
      <MenuItem onClick={() => onDenyArticle()} disabled={isLoggedUserAuthor || props.openedArticleStatus !== 'IN_REVIEW'}>Zamietnuť</MenuItem>
      <MenuItem onClick={() => onPublishArticle()} disabled={isLoggedUserAuthor || props.openedArticleStatus !== 'APPROVED'}>Publikovať</MenuItem>
      <MenuItem onClick={() => onArchiveArticle()} disabled={props.openedArticleStatus !== 'ARCHIVED'}>Archivovať</MenuItem>
      <MenuItem onClick={() => onRemoveArticle()} disabled={props.openedArticleStatus !== 'WRITING'}>Zmazať</MenuItem>
    </Menu>
    <div className="Quick-action-items">
      {props.openedArticleStatus === 'WRITING' ?
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
      <img src={Admin} alt="Administrácia" className="Quick-menu-img"/>
      <div className="Quick-menu-text">Administrácia</div>
    </div>
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
        <div className="App-link" onClick={onRedirectToDashboard} title="Zoznam článkov">
          <img src={Logo} alt="Redakčný systém"/>
          <span>Redakčný systém</span>
        </div>
        <div className="Vertical-divider"/>
        {props.openedArticleId ? editorActionsMenu : null}
        {!props.openedArticleId && loggedUserAdministrator ? administration : null}
        <div className="Header-row">{props.openedArticleId ?
            <div className="Share-item">
              <ShareArticleItem
                  openedArticleName={props.openedArticleName}
                  openedArticleId={props.openedArticleId}/>
            </div> : null}
          <div>{props.openedArticleId ? <CollabInfoDialog
                  articleId={props.openedArticleId}
                  leaveArticleEdit={() => leaveArticleEdit()}
                  allConnectedUsers={props.allConnectedUsers}
                  allCollaborators={props.allCollaborators}
                  canLoggedUserEdit={props.canLoggedUserEditOpenedArticle}/>
              : null}
          </div>
          {props.openedArticleId ?
              <Tooltip title="Prehľad verzií" onClick={() => onShowArticleVersions()}>
                <div className="Quick-menu-item">
                  <img src={Versions} alt="Verzie" className="Quick-menu-img"/>
                  <div className="Quick-menu-text">Verzie</div>
                </div>
              </Tooltip> : null}
          {!props.openedArticleId ? <div className="Avatar">
            <Avatar name={getFullName(loggedUser)} round={true} size="40"
                    fgColor="black" color="white" style={{cursor: 'default'}}/>
          </div> : null}
          <div className="Vertical-divider"/>
          <img src={Logout} className="Logout-button" alt="Odhlásiť sa" title="Odhlásiť sa" onClick={onLogout}
               style={{marginRight: props.openedArticleId ? '1rem' : '-1rem'}}/>
        </div>
        <MuiMessage severity={muiMessage.severity} open={muiMessage.open}
                    onCloseMuiMessage={closeMuiMessage}
                    message={muiMessage.message}/>
      </div>
  );
}
