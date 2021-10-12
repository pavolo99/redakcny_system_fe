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

const baseURL = "http://localhost:8080/article";

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

  function onSendReview() {

  }

  function onApproveArticle() {
    const messageData = {
      open: true,
      message: 'Článok bol úspešne schválený',
      severity: 'success'
    }
    axios.put(baseURL + '/approved/' + props.openedArticleId)
    .catch((error) => {
      messageData.severity = 'error';
      if (error.response.data.message === 'Article must be after review to be approved') {
        messageData.message = 'Článok môže byť schválený až po recenzii';
      } else {
        messageData.message = 'Nastala neočakávaná chyba pri schvaľovaní článku'
      }
    })
    .finally(() => setMuiMessage(messageData));
  }

  const editorPart = <>
    <div className="Quick-menu-item">
      <img src={Review} alt="Review" onClick={() => onSendReview()}
           className="Quick-menu-img"/>
      <div className="Quick-menu-text">Odoslať na recenziu</div>
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
                                  className="Dropdown-expansion"/> : null}
  </>

  return (
      <div className="Header">
        <div className="App-link" onClick={onCreateNewArticle}>
          <span>Redakčný systém</span>
        </div>
        <div className="Vertical-divider"/>
        {props.openedArticleId ? editorPart : null}
        <MuiMessage severity={muiMessage.severity} open={muiMessage.open}
                    onCloseMuiMessage={closeMuiMessage}
                    message={muiMessage.message}/>
      </div>
  );
}
