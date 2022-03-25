import "./Image-section.css"
import React, {useEffect, useState} from "react";
import axios from "axios";
import DeleteIcon from "../../assets/delete-image.png"
import {MuiMessage} from "../mui-message/Mui-message";
import {useHistory} from "react-router-dom";
import {articleCanBeEdited, handle401Error} from "../../shared/Utils";
import {Tooltip} from "@mui/material";

export default function ImageSection(props) {
  const history = useHistory();
  const [images, setImages] = useState([]);

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

  function onFileUpload(event) {
    if (!event || !event.target || !event.target.files || event.target.files.length < 1) {
      return;
    }
    const selectedFile = event.target.files[0];
    const fd = new FormData();
    fd.append('file', selectedFile, selectedFile.name)
    axios.post(process.env.REACT_APP_BECKEND_API_URL + '/image/uploaded/' + props.articleId, fd)
    .catch(error => {
      handle401Error(error, history);
      if (error.response.status === 400) {
        setMuiMessage({
          open: true,
          message: 'Obrázok ' + selectedFile.name + ' už existuje',
          severity: 'error'
        });
      }
    })
    .then(response => {
      if (response) {
        setMuiMessage({
          open: true,
          message: 'Obrázok ' + selectedFile.name + ' bol úspešne nahraný',
          severity: 'success'
        });
        const uploadedImagePath = process.env.REACT_APP_BECKEND_API_URL + '/image/content/' + response.data;
        props.onInsertLinkOrImageValueToEditor('![', '](' + uploadedImagePath + ')')
        fetchImagesInfo();
      }
    })
  }

  function onRemoveImage(imageInfo) {
    axios.delete(process.env.REACT_APP_BECKEND_API_URL + '/image/' + imageInfo.id)
    .catch(error => handle401Error(error, history))
    .then(response => {
      if (response) {
        setMuiMessage({
          open: true,
          message: 'Obrázok s názvom ' + imageInfo.name + ' bol úspešne zmazaný',
          severity: 'success'
        })
        fetchImagesInfo();
      }
    });
  }

  function fetchImagesInfo() {
    if (props.articleId) {
      axios.get(process.env.REACT_APP_BECKEND_API_URL + '/image/info/' + props.articleId)
      .catch(error => handle401Error(error, history))
      .then(response => {
        if (response) {
          setImages(response.data);
        }
      });
    }
  }

  useEffect(() => {
    fetchImagesInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.articleId])

  const mappedImagesInfo = <div>
    {images.length > 0 ? images.map(imagesInfo => (
        <div key={imagesInfo.id} className="Image-row">
          <Tooltip title={imagesInfo.name} placement="top" style={{cursor: 'default'}}>
            <div>{imagesInfo.name.length < 33 ? imagesInfo.name : (imagesInfo.name.substring(0, 30) + '...')}</div>
          </Tooltip>
          {props.canLoggedUserEdit && articleCanBeEdited(props.articleStatus) ?
              <div className="Delete-icon" onClick={(() => onRemoveImage(imagesInfo))}>
                <img src={DeleteIcon} alt="Odstrániť obrázok" title="Odstrániť obrázok"/>
              </div> : null}
        </div>
    )) : <div className="Empty-images">Žiadne vlastné obrázky</div>}
  </div>;

  return (
      <div className="Images">
        <MuiMessage severity={muiMessage.severity} open={muiMessage.open}
                    onCloseMuiMessage={closeMuiMessage}
                    message={muiMessage.message}/>
        <h4 className="Images-header">Obrázky</h4>
        {mappedImagesInfo}
        <input type="file" className="Upload-image" accept="image/*"
               disabled={!props.canLoggedUserEdit || !articleCanBeEdited(props.articleStatus)}
               onChange={(event) => onFileUpload(event)}/>
      </div>
  );
}
