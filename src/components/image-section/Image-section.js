import "./Image-section.css"
import React from "react";
import axios from "axios";
import DeleteIcon from "../../assets/delete-image.png"
import {MuiMessage} from "../mui-message/Mui-message";


export default function ImageSection(props) {

  let baseUrl = 'http://localhost:8080/image';
  const [images, setImages] = React.useState([]);

  const [muiMessage, setMuiMessage] = React.useState({
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
    axios.post(baseUrl + '/uploaded/' + props.articleId, fd)
    .then((response) => {
      setMuiMessage({
        open: true,
        message: 'Obrázok s názvom ' + selectedFile.name
            + ' bol úspešne nahraný',
        severity: 'success'
      })
      // response data as an id of the created image
      props.insertImage(baseUrl + '/content/' + response.data);
      fetchImagesInfo();
    })
  }

  function onRemoveImage(imageInfo) {
    axios.delete(baseUrl + '/' + imageInfo.id).then(() => {
      setMuiMessage({
        open: true,
        message: 'Obrázok s názvom ' + imageInfo.name + ' bol úspešne zmazaný',
        severity: 'success'
      })
      fetchImagesInfo();
    });
  }

  function fetchImagesInfo() {
    if (props.articleId) {
      axios.get(baseUrl + '/info/' + props.articleId)
      .then(response => {
        setImages(response.data);
      });
    }
  }

  React.useEffect(() => {
    fetchImagesInfo();
  }, [])

  const mappedImagesInfo = <div>
    {images.length > 0 ? images.map(imagesInfo => (
        <div key={imagesInfo.id} className="Image-row"
             onClick={(() => onRemoveImage(imagesInfo))}>
          <div>{imagesInfo.name}</div>
          <div className="Delete-icon">
            <img src={DeleteIcon} alt="Delete icon"/>
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
        <input type="file" className="Upload-image"
               onChange={(event) => onFileUpload(event)}/>
      </div>
  );

}