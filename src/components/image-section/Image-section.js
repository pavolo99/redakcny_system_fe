import "./Image-section.css"
import React, {useEffect, useState} from "react";
import axios from "axios";
import DeleteIcon from "../../assets/delete-image.png"
import {MuiMessage} from "../mui-message/Mui-message";
import {apiUrl} from "../environment/environment";
import {useHistory} from "react-router-dom";

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
    axios.post(apiUrl + '/image/uploaded/' + props.articleId, fd)
    .catch(error => handleError(error))
    .then(response => {
      if (response) {
        setMuiMessage({
          open: true,
          message: 'Obrázok s názvom ' + selectedFile.name + ' bol úspešne nahraný',
          severity: 'success'
        });
        const uploadedImagePath = apiUrl + '/image/content/' + response.data;
        props.onInsertTextToEditor('\n![Pridajte nejaký popis](' + uploadedImagePath + ')\n', 3);
        fetchImagesInfo();
      }
    })
  }

  function onRemoveImage(imageInfo) {
    axios.delete(apiUrl + '/image/' + imageInfo.id)
    .catch(error => handleError(error))
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
      axios.get(apiUrl + '/image/info/' + props.articleId)
      .catch(error => handleError(error))
      .then(response => {
        if (response) {
          setImages(response.data);
        }
      });
    }
  }

  function handleError(error) {
    if (error.response.status === 401) {
      history.push('/login');
    }
  }

  useEffect(() => {
    fetchImagesInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.articleId])

  const mappedImagesInfo = <div>
    {images.length > 0 ? images.map(imagesInfo => (
        <div key={imagesInfo.id} className="Image-row"
             onClick={(() => onRemoveImage(imagesInfo))}>
          <div>{imagesInfo.name.length < 33 ? imagesInfo.name : (imagesInfo.name.substring(0, 30) + '...')}</div>
          <div className="Delete-icon">
            <img src={DeleteIcon} alt="Vymazať obrázok"/>
          </div>
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
               onChange={(event) => onFileUpload(event)}/>
      </div>
  );
}
