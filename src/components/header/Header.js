import React, {useState} from "react";
import "./Header.css"
import {useHistory} from "react-router-dom";
import ThreeDotsMenu from "../../assets/three-dots-menu.svg"
import ThreeDotsMenuExpanded from "../../assets/three-dots-menu-expanded.svg"
import Review from "../../assets/review.svg"
import Approve from "../../assets/approve.svg"
import ActionsMenu from "../actions-menu/Actions-menu";

export default function Header(props) {
  const history = useHistory();

  const onCreateNewArticle = () => {
    history.push('/dashboard')
  }

  const [isMenuClicked, setIsMenuClicked] = useState(false);

  function onMenuClick() {
    setIsMenuClicked((prevState) => !prevState);
  }

  function onSendReview() {

  }

  const editorPart = <>
    <div className="Quick-menu-item">
      <img src={Review} alt="Review" onClick={() => onSendReview()}
              className="Quick-menu-img"/>
      <div className="Quick-menu-text">Odoslať na recenziu</div>
    </div>
    <div className="Quick-menu-item">
      <img src={Approve} alt="Approve" onClick={() => onSendReview()}
              className="Quick-menu-img"/>
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
      </div>
  );
}
