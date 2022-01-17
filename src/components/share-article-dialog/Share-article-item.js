import React, {useEffect, useState} from "react";
import "./Share-article-item.css"
import "../header/Header.css"
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Share from "../../assets/share.svg";
import axios from "axios";
import {apiUrl} from "../environment/environment";
import {useHistory} from "react-router-dom";
import {Autocomplete, Select} from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Avatar from 'react-avatar';
import {MuiMessage} from "../mui-message/Mui-message";
import {
  generateHSLColorBasedOnUserInfo,
  getFullName, getUser,
  getUsernameWithFullName, getUserValue
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
    axios.get(apiUrl + '/collaborator/' + props.openedArticleId)
    .catch(error => handle401(error))
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
      axios.get(apiUrl + '/user/collaborator/' + searchValue)
      .catch(error => handle401(error))
      .then(response => {
        if (response) {
          setPotentialCollaborators(response.data);
        }
      });
    }
  }

  const history = useHistory();

  function handle401(error) {
    if (error.response.status === 401) {
      localStorage.clear();
      history.push('/login');
    }
  }

  function onCollaboratorPropertyChange(index, property) {
    let articleCollaboratorsCopy = articleCollaborators.slice();
    let articleCollaborator = articleCollaboratorsCopy[index];
    articleCollaborator[property] = !articleCollaborator[property];
    setArticleCollaborators(articleCollaboratorsCopy);
    axios.put(apiUrl + '/collaborator/updated/' + articleCollaborator.id, {
      id: articleCollaborator.id,
      canEdit: articleCollaborator.canEdit,
      author: articleCollaborator.author
    })
    .catch(error => handle401(error))
    .then(response => {
      if (response) {
        setMuiMessage({
          open: true,
          severity: 'success',
          message: 'Spolupracovník bol úspešne aktualizovaný'
        })
      }
    });
  }

  function onDeleteCollaborator(collaboratorId) {
    axios.delete(apiUrl + '/collaborator/deleted/' + collaboratorId)
    .catch((error) => {
      handle401(error)
    })
    .then(response => {
      if (response) {
        setMuiMessage({
          open: true,
          severity: 'info',
          message: 'Spolupracovník bol úspešne vymazaný'
        });
        fetchArticleCollaborators();
      }
    });
  }

  function onSelectCollaborator(value) {
    setSelectedCollaborator(value);
    if (value) {
      axios.post(apiUrl + '/collaborator/added/' + props.openedArticleId + '/'
          + value.id, {})
      .catch(error => {
        handle401(error);
        if (error.response.data.message
            === 'User is already collaborator for the article') {
          setMuiMessage({
            open: true,
            severity: 'error',
            message: 'Tento spolupracovník už existuje'
          })
        }
      })
      .then(response => {
        if (response) {
          setMuiMessage({
            open: true,
            severity: 'success',
            message: 'Spolupracovník bol úspešne pridaný'
          })
          fetchArticleCollaborators();
        }
      })
      .finally(() => setSelectedCollaborator(null));
    }
  }

  const mappedArticleCollaborators = <div>
    {articleCollaborators.map((collaborator, index) => (
        <div key={collaborator.userDto.id} className="Collaborator-row">
          <div className="Collaborator-column-avatar">
            <Avatar name={getFullName(collaborator.userDto)} fgColor="white"
                    className="Column-avatar" round={true} size="40"
                    color={generateHSLColorBasedOnUserInfo(getUserValue(collaborator.userDto))}/>
          </div>
          <div className="Collaborator-column-name">
            <div>{getUsernameWithFullName(collaborator.userDto)}</div>
            <div>{collaborator.userDto.email}</div>
          </div>
          {collaborator.owner ? <div
                  className="Collaborator-column Collaborator-owner">
                Vlastník</div> :
              <FormControl
                  variant="standard"
                  className="Collaborator-column"><Select
                  style={{width: '200px'}} value={collaborator.canEdit}
                  onChange={() => onCollaboratorPropertyChange(index,
                      'canEdit')}>
                <MenuItem value={true}>Môže editovať</MenuItem>
                <MenuItem value={false}>Nemôže editovať</MenuItem>
              </Select>
              </FormControl>}
          <FormControl variant="standard" className="Collaborator-column">
            <Select style={{width: '200px'}}
                    value={collaborator.author}
                    onChange={() => onCollaboratorPropertyChange(index,
                        'author')}>
              <MenuItem value={true}>Je autor</MenuItem>
              <MenuItem value={false}>Nie je autor</MenuItem>
            </Select>
          </FormControl>
          {collaborator.owner ? <div className="Delete-collaborator"></div> :
              <div className="Delete-collaborator"
                   onClick={() => onDeleteCollaborator(collaborator.id)}>
                ×
              </div>
          }
        </div>))}
  </div>;

  return (<div>
    <div onClick={handleClickOpen} className="Display-flex">
      <img src={Share} alt="Share" className="Quick-menu-img"/>
      <div className="Quick-menu-text">Zdielať</div>
    </div>
    <Dialog open={isShareDialogOpen} onClose={handleClose} fullWidth={true}
            maxWidth={'md'}>
      <DialogTitle>{props.openedArticleName}</DialogTitle>
      <DialogContent>
        <div className="Collaborators-number">Počet ľudí, ktorí majú prístup: <b>{articleCollaborators.length}</b>.
          Počet autorov: <b>{articleCollaborators.filter(value => value.author).length}</b>.
        </div>
        <div>{mappedArticleCollaborators}</div>
        <Autocomplete
            options={potentialCollaborators} noOptionsText="Žiadni používatelia"
            value={selectedCollaborator} sx={{width: 600}}
            onChange={(event, value) => onSelectCollaborator(value)}
            getOptionLabel={user => getUser(user)}
            onKeyUp={(event) => onKeyChange(event.target.value)}
            renderInput={(params) => <TextField {...params}
                                                label="Pridať spolupracovníka"
                                                variant="standard"
                                                placeholder="Vyhľadávajte podľa mena, priezviska, používateľského mena alebo e-mailu"/>}/>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Zavrieť</Button>
      </DialogActions>
    </Dialog>
    <MuiMessage severity={muiMessage.severity} open={muiMessage.open}
                onCloseMuiMessage={closeMuiMessage}
                message={muiMessage.message}/>
  </div>);
}
