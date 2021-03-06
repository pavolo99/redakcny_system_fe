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
    axios.get(process.env.REACT_APP_BECKEND_API_URL + '/collab-session/' + props.articleId + '/connected')
    .catch(error => handle401Error(error, history))
    .then(response => {
      if (response) {
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
    axios.put(process.env.REACT_APP_BECKEND_API_URL + '/collab-session/' + props.articleId + '/leave/' + userIdToLeaveEdit)
    .catch(error => handle401Error(error, history))
    .then(response => {
      if (response) {
        props.leaveArticleEdit()
        handleClose();
      }
    });
  }

  const mappedConnectedUsers =
      <div>
        {allConnectedUsers.map(user => (
            <div key={user.id} className="Connected-user-row">
              <div>
                <Avatar name={getFullName(user.userDto)} fgColor="white"
                        round={true} size="40" style={{cursor: 'default'}}
                        color={generateHSLColorBasedOnUserInfo(getUserValue(user.userDto))}/>
              </div>
              <div className="Connected-user-info-column">
                <div>{getUsernameWithFullName(user.userDto, loggedUserId)}</div>
                <div>{user.userDto.email}</div>
              </div>
              {props.userIdWhoCanEdit === loggedUserId && loggedUserId !== user.userDto.id && user.canUserEdit ?
                  <div>
                    <Button className="Leave-article-edit-button"
                            onClick={() => onLeaveArticleEdit(user.userDto.id)}
                            title="Prenecha?? editovanie ??l??nku pou????vate??ovi">Prenecha?? editovanie ??l??nku</Button>
              </div> : null}
              {props.userIdWhoCanEdit !== loggedUserId && props.userIdWhoCanEdit === user.userDto.id ?
                  <div>
                    <strong>
                      Pr??ve m????e editova?? ??l??nok
                    </strong>
              </div> : null}
              {props.userIdWhoCanEdit === loggedUserId && props.userIdWhoCanEdit === user.userDto.id ?
                  <div>
                    <strong>
                      Moment??lne m????ete editova?? ??l??nok
                    </strong>
              </div> : null}
            </div>
        ))}
      </div>

  return (<div>
    <div className="Connected-users" onClick={handleClickOpen}>
      {props.allCollaborators ? props.allCollaborators.map(collaborator => {
        const activeUserForThisArticle = props.allConnectedUsers.find(user => user.id === collaborator.id);
        return (
            <div key={collaborator.id}>
              <Avatar name={getFullName(collaborator)} fgColor="white"
                      round={true} size="35" style={{cursor: 'pointer'}}
                      title={(collaborator.fullName ? collaborator.fullName : collaborator.username) + ' - ' + (activeUserForThisArticle ? 'Akt??vny' : 'Neakt??vny')}
                      color={activeUserForThisArticle ? generateHSLColorBasedOnUserInfo(getUserValue(collaborator)) : 'lightgrey'}/>
            </div>
        );
      }) : null}
      </div>
    <Dialog open={isCollabInfoDialogOpen} onClose={handleClose} fullWidth={true} maxWidth="md">
      <DialogTitle>Akt??vni pou????vatelia</DialogTitle>
      <DialogContent>
        {mappedConnectedUsers}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Zavrie??</Button>
      </DialogActions>
    </Dialog>
  </div>);
}
