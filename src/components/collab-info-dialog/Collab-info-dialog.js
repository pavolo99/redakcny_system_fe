import React, {useEffect, useState} from "react";
import "./Collab-info-dialog.css"
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import axios from "axios";

import {useHistory} from "react-router-dom";
import Avatar from "react-avatar";
import {apiUrl} from "../environment/environment";
import {
  generateHSLColorBasedOnUserInfo,
  getFullName, getUsernameWithFullName, getUserValue,
  handle401Error
} from "../../shared/Utils";
export default function CollabInfoDialog(props) {

  const [isCollabInfoDialogOpen, setIsCollabInfoDialogOpen] = useState(false);
  const [allConnectedUsers, setAllConnectedUsers] = useState([]);
  const history = useHistory();

  function fetchConnectedUsers() {
    axios.get(apiUrl + '/collab-session/' + props.articleId + '/connected')
    .catch(error => handle401Error(error, history))
    .then(response => {
      if (response) {
        console.log(response.data)
        setAllConnectedUsers(response.data);
      }
    });
  }

  useEffect(() => {
    if (props.collabChange) {
      setIsCollabInfoDialogOpen(true);
      fetchConnectedUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.collabChange]);

  const handleClickOpen = () => {
    setIsCollabInfoDialogOpen(true);
    fetchConnectedUsers();
  };

  const handleClose = () => {
    setIsCollabInfoDialogOpen(false);
  };
  let loggedUserId = JSON.parse(localStorage.getItem('loggedUser')).id;

  function onLeaveArticleEdit(userIdToLeaveEdit) {
    axios.put(apiUrl + '/collab-session/' + props.articleId + '/leave/' + userIdToLeaveEdit)
    .catch(error => handle401Error(error, history))
    .then(response => {
      if (response) {
        props.leaveArticleEdit(userIdToLeaveEdit)
        handleClose();
      }
    });
  }

  const mappedConnectedUsers =
      <div>
        <h3>Aktívni používatelia</h3>
        {allConnectedUsers.map(user => (
            <div key={user.id} className="Connected-users-row">
              <div>
                <Avatar name={getFullName(user.userDto)} fgColor="white"
                        round={true} size="40"
                        color={generateHSLColorBasedOnUserInfo(getUserValue(user.userDto))}/>
              </div>
              <div className="Connected-user-info-column">
                <div>{getUsernameWithFullName(user.userDto)}</div>
                <div>{user.userDto.email}</div>
              </div>
              {props.canLoggedUserEdit && loggedUserId !== user.userDto.id && user.canUserEdit ?
                  <div className="Connected-user-info-column">
                <Button className="Leave-article-edit-button" onClick={() => onLeaveArticleEdit(user.userDto.id)}>
                  Prenechať editovanie článku
                </Button>
              </div> : null}
            </div>
        ))}
      </div>

  return (<div>
    <div onClick={handleClickOpen} className="Info-button">
      INFO
    </div>
    <Dialog open={isCollabInfoDialogOpen} onClose={handleClose} fullWidth={true}
            maxWidth={'md'}>
      <DialogTitle>          {props.canLoggedUserEdit
          ? ' Editovanie článku je uzamknuté vami.'
          : ' Editovanie článku je uzamknuté iným používateľom. Ak chcete článok editovať, musíte počkať, pokiaľ vám neprenechá právo na editovanie.'}
      </DialogTitle>
      <DialogContent>
        {mappedConnectedUsers}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Zavrieť</Button>
      </DialogActions>
    </Dialog>
  </div>);
}
