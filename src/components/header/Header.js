import React from "react";
import classes from "./Header.css"
import {useHistory} from "react-router-dom";

export default function Header() {
  const history = useHistory();

  const onCreateNewArticle = () => {
    history.push('/dashboard')
  }

  return (
      <div className="Header">
        <div className="App-link" onClick={onCreateNewArticle}><span>Redakčný systém </span></div>
      </div>
  );
}
