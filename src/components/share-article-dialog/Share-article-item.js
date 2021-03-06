import React, {useEffect, useState} from "react";
import "./Share-article-item.css"
import "../header/Header.css"
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import PeopleGroup from "../../assets/people-group.svg";
import axios from "axios";
import {useHistory} from "react-router-dom";
import {Autocomplete, Select} from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Avatar from 'react-avatar';
import {MuiMessage} from "../mui-message/Mui-message";
import {
  generateHSLColorBasedOnUserInfo,
  getFullName, getUser,
  getUsernameWithFullName, getUserValue, handle401Error
} from "../../shared/Utils";

export default function ShareArticleItem(props) {

  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [potentialCollaborators, setPotentialCollaborators] = useState([]);
  const [articleCollaborators, setArticleCollaborators] = useState([]);
  const [selectedCollaborator, setSelectedCollaborator] = useState(null);

  const [muiMessage, setMuiMessage] = useState({
    open: false, severity: '', message: ''
  });

  const closeMuiMessage = () => {
    setMuiMessage(prevState => {
      return {...prevState, open: false}
    })
  }

  function fetchArticleCollaborators() {
    axios.get(process.env.REACT_APP_BECKEND_API_URL + '/collaborator/' + props.openedArticleId)
    .catch(error => handle401Error(error, history))
    .then(response => {
      if (response) {
        setArticleCollaborators(response.data);
      }
    });
  }

  useEffect(() => {
    if (isShareDialogOpen) {
      fetchArticleCollaborators();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isShareDialogOpen]);

  const handleClickOpen = () => {
    setIsShareDialogOpen(true);
  };

  const handleClose = () => {
    setIsShareDialogOpen(false);
  };

  function onKeyChange(searchValue) {
    if (searchValue) {
      axios.get(process.env.REACT_APP_BECKEND_API_URL + '/user/collaborator/' + searchValue)
      .catch(error => handle401Error(error, history))
      .then(response => {
        if (response) {
          setPotentialCollaborators(response.data);
        }
      });
    }
  }

  const history = useHistory();

  function onCollaboratorPropertyChange(index, property) {
    let articleCollaboratorsCopy = articleCollaborators.slice();
    let articleCollaborator = articleCollaboratorsCopy[index];
    articleCollaborator[property] = !articleCollaborator[property];
    setArticleCollaborators(articleCollaboratorsCopy);
    axios.put(process.env.REACT_APP_BECKEND_API_URL + '/collaborator/updated/' + articleCollaborator.id, {
      id: articleCollaborator.id,
      canEdit: articleCollaborator.canEdit,
      author: articleCollaborator.author
    })
    .catch(error => handle401Error(error, history))
    .then(response => {
      if (response) {
        setMuiMessage({
          open: true,
          severity: 'success',
          message: 'Spolupracovn??k bol ??spe??ne aktualizovan??'
        })
      }
    });
  }

  function onDeleteCollaborator(collaboratorId) {
    axios.delete(process.env.REACT_APP_BECKEND_API_URL + '/collaborator/deleted/' + collaboratorId)
    .catch((error) => handle401Error(error, history))
    .then(response => {
      if (response) {
        setMuiMessage({
          open: true,
          severity: 'info',
          message: 'Spolupracovn??k bol ??spe??ne vymazan??'
        });
        fetchArticleCollaborators();
      }
    });
  }

  function onSelectCollaborator(value) {
    setSelectedCollaborator(value);
    if (value) {
      axios.post(process.env.REACT_APP_BECKEND_API_URL + '/collaborator/added/' + props.openedArticleId + '/'
          + value.id, {})
      .catch(error => {
        handle401Error(error, history);
        if (error.response.data.message === 'User is already collaborator for the article') {
          setMuiMessage({
            open: true,
            severity: 'error',
            message: 'Tento spolupracovn??k u?? existuje'
          })
        }
      })
      .then(response => {
        if (response) {
          setMuiMessage({
            open: true,
            severity: 'success',
            message: 'Spolupracovn??k bol ??spe??ne pridan??'
          })
          fetchArticleCollaborators();
        }
      })
      .finally(() => setSelectedCollaborator(null));
    }
  }

  const loggedUserEditor = JSON.parse(localStorage.getItem('loggedUser')).role === 'EDITOR';
  const loggedUserId = JSON.parse(localStorage.getItem('loggedUser')).id;
  const loggedUserOwner = articleCollaborators && articleCollaborators.length ? articleCollaborators.find(collaborator => collaborator.userDto.id === JSON.parse(localStorage.getItem('loggedUser')).id).owner : false;

  const mappedArticleCollaborators = <div>
    {articleCollaborators.map((collaborator, index) => (
        <div key={collaborator.userDto.id} className="Collaborator-row">
          <div className="Collaborator-column-avatar">
            <Avatar name={getFullName(collaborator.userDto)} fgColor="white"
                    round={true} size="40" style={{cursor: 'default'}}
                    color={generateHSLColorBasedOnUserInfo(getUserValue(collaborator.userDto))}/>
          </div>
          <div className="Collaborator-column-name">
            <div>{getUsernameWithFullName(collaborator.userDto, loggedUserId)}</div>
            <div>{collaborator.userDto.email}</div>
          </div>
          {collaborator.owner ? <div
                  className="Collaborator-column Collaborator-owner">
                Vlastn??k</div> :
              <FormControl
                  variant="standard"
                  className="Collaborator-column"><Select
                  style={{width: '200px'}} value={collaborator.canEdit}
                  onChange={() => onCollaboratorPropertyChange(index,
                      'canEdit')}>
                <MenuItem value={true} disabled={!loggedUserOwner && !loggedUserEditor}>
                  M????e editova??
                </MenuItem>
                <MenuItem value={false} disabled={!loggedUserOwner && !loggedUserEditor}>
                  Nem????e editova??
                </MenuItem>
              </Select>
              </FormControl>}
          <FormControl variant="standard" className="Collaborator-column">
            <Select style={{width: '200px'}}
                    value={collaborator.author}
                    onChange={() => onCollaboratorPropertyChange(index,
                        'author')}>
              <MenuItem value={true} disabled={!loggedUserOwner && !loggedUserEditor}>
                Je autor
              </MenuItem>
              <MenuItem value={false} disabled={!loggedUserOwner && !loggedUserEditor}>
                Nie je autor
              </MenuItem>
            </Select>
          </FormControl>
          {collaborator.owner || (!loggedUserOwner && !loggedUserEditor) ? <div className="Delete-collaborator"></div> :
              <div className="Delete-collaborator"
                   onClick={() => onDeleteCollaborator(collaborator.id)}>
                ??
              </div>
          }
        </div>))}
  </div>

  return (<div>
    <div title="Administr??cia spolupracovn??kov">
      <div onClick={handleClickOpen} className="Quick-menu-item">
        <img src={PeopleGroup} alt="Zdie??anie" className="Quick-menu-img"/>
        <div className="Quick-menu-text">Zdie??anie</div>
      </div>
    </div>
    <Dialog open={isShareDialogOpen} onClose={handleClose} fullWidth={true}
            maxWidth={'md'}>
      <DialogTitle>{props.openedArticleName}</DialogTitle>
      <DialogContent>
        <div className="Collaborators-number">Po??et ??ud??, ktor?? maj?? pr??stup: <b>{articleCollaborators.length}</b> (z toho autorov
          <b> {articleCollaborators.filter(value => value.author).length}</b>).
        </div>
        <div>{mappedArticleCollaborators}</div>
        <Autocomplete
            options={potentialCollaborators} noOptionsText="??iadni pou????vatelia"
            value={selectedCollaborator} sx={{width: 600}}
            onChange={(event, value) => onSelectCollaborator(value)}
            getOptionLabel={user => getUser(user)}
            onKeyUp={(event) => onKeyChange(event.target.value)}
            renderInput={(params) => <TextField {...params}
                                                label="Prida?? spolupracovn??ka"
                                                variant="standard"
                                                placeholder="Vyh??ad??vajte pod??a mena, priezviska alebo e-mailu"/>}/>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Zavrie??</Button>
      </DialogActions>
    </Dialog>
    <MuiMessage severity={muiMessage.severity} open={muiMessage.open}
                onCloseMuiMessage={closeMuiMessage}
                message={muiMessage.message}/>
  </div>);
}
