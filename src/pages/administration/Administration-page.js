import React, {useEffect, useState} from "react";
import './Administration-page.css'
import {useHistory} from "react-router-dom";
import axios from "axios";
import {apiUrl} from "../../components/environment/environment";
import {handle401Error} from "../../shared/Utils";
import {InputLabel, Select, Tab, Tabs} from "@mui/material";
import {Button, makeStyles, TextField} from "@material-ui/core";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import {MuiMessage} from "../../components/mui-message/Mui-message";

const useStyles = makeStyles(() => ({
  root: {}
}));

const AdministrationPage = () => {
  const history = useHistory();
  const [displayedTab, setDisplayedTab] = React.useState('publicationConfig');
  const [privateTokenVisibility, setPrivateTokenVisibility] = React.useState(false);
  const [publicationConfig, setPublicationConfig] = React.useState({
    id: null,
    provider: '',
    branch: '',
    commitMessage: '',
    pathToArticle: '',
    privateToken: '',
    repositoryPath: ''
  });
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

  const handleChange = (event, newValue) => {
    setDisplayedTab(newValue);
  };

  function onRedirectToDashboard() {
    history.push('/dashboard');
  }

  useEffect(() => {
    if (displayedTab === 'publicationConfig') {
      axios.get(apiUrl + '/administration/publication-config')
      .catch(error => handle401Error(error, history))
      .then(response => {
        if (response) {
          setPublicationConfig(response.data);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayedTab])

  const onInputsValueChange = e => {
    setPublicationConfig({...publicationConfig, [e.target.name]: e.target.value})
  }

  function onProviderValueChange(event) {
    setPublicationConfig({...publicationConfig, provider: event.target.value})
  }

  function onSavePublicationConfig() {
    axios.put(apiUrl + '/administration/publication-config/' + publicationConfig.id, createPublicationConfigObject())
    .catch(error => handle401Error(error, history))
    .then(response => {
      if (response) {
        setMuiMessage({severity: 'success', open: true, message: 'Konfigurácia bola úspešne uložená'})
      }
    })
  }

  function onTestPublicationConfigConnection() {
    axios.put(apiUrl + '/administration/publication-config/test', createPublicationConfigObject())
    .catch(error => {
      handle401Error(error, history);
      if (error.response.data.message === 'Gitlab project repo is null') {
        setMuiMessage({severity: 'error', open: true, message: 'Spojenie neprebehlo úspešne. Skontrolujte prosím privátny token a cestu k projektu'})
      } else {
        setMuiMessage({severity: 'error', open: true, message: 'Nastala neočakávaná chyba pri testovaní spojenia'})
      }
    })
    .then(response => {
      if (response) {
        setMuiMessage({severity: 'success', open: true, message: 'Spojenie prebehlo úspešne - predvolená vetva je ' + response.data.default_branch})
      }
    });
  }

  function createPublicationConfigObject() {
    return {
      id: publicationConfig.id,
      branch: publicationConfig.branch,
      commitMessage: publicationConfig.commitMessage,
      repositoryPath: publicationConfig.repositoryPath,
      provider: publicationConfig.provider,
      privateToken: publicationConfig.privateToken,
      pathToArticle: publicationConfig.pathToArticle
    }
  }

  function onTogglePrivateTokenVisibility() {
    setPrivateTokenVisibility((prevState => !prevState));
  }

  const publicationConfigPart = <>
    <div className="Publication-config-row">
      <FormControl variant="filled"
                   style={{width: "32.5%"}}>
        <InputLabel
            id="demo-simple-select-filled-label">Poskytovateľ</InputLabel>
        <Select label="Poskytovateľ" labelId="demo-simple-select-filled-label"
                className={useStyles().root}
                onChange={onProviderValueChange}
                value={publicationConfig.provider}>
          <MenuItem value="GITLAB">GITLAB</MenuItem>
          <MenuItem value="GITHUB" disabled>GITHUB</MenuItem>
        </Select>
      </FormControl>
      <TextField label="Názov vetvy" variant="filled" style={{width: "32.5%"}}
                 value={publicationConfig.branch} name="branch"
                 onChange={onInputsValueChange} inputProps={{ maxLength: 70 }}/>

      <TextField label="Názov commitu" variant="filled" style={{width: "32.5%"}}
                 value={publicationConfig.commitMessage} name="commitMessage"
                 onChange={onInputsValueChange} inputProps={{ maxLength: 70 }}/>
    </div>
    <div className="Publication-config-row">

      <TextField label="Cesta publikovaného článku" variant="filled"
                 value={publicationConfig.pathToArticle} style={{width: "32.5%"}}
                 onChange={onInputsValueChange} name="pathToArticle"
                 inputProps={{ maxLength: 70 }}/>
      <TextField label="Privátny prístupový token" variant="filled"
                 value={publicationConfig.privateToken} style={{width: "32.5%"}}
                 onChange={onInputsValueChange} name="privateToken"
                 inputProps={{ maxLength: 70 }}
                 type={privateTokenVisibility ? 'text' : 'password'}/>
      <TextField label="URL adresa repozitára" variant="filled"
                 inputProps={{ maxLength: 70 }}
                 value={publicationConfig.repositoryPath} style={{width: "32.5%"}}
                 onChange={onInputsValueChange} name="repositoryPath"/>
    </div>

    <div className="Action-buttons">
      <Button className="Show-private-token-button" onClick={onTogglePrivateTokenVisibility}>{privateTokenVisibility ? 'Skryť' : 'Zobraziť'} privátny token</Button>
      <Button className="Test-button" onClick={onTestPublicationConfigConnection}>Otestovať spojenie s repozitárom</Button>
      <Button className="Save-button" onClick={onSavePublicationConfig}>Uložiť konfiguráciu</Button>
    </div>

      <div className="Legend-header">Vysvetlivky:</div>
    <div className="Legend">
    <div><strong>Poskytovateľ:</strong> prostredie, v ktorom sú články publikované (predvolene Gitlab).</div>
      <div><strong>Vetva:</strong> názov vetvy, v ktorej má byť článok publikovaný - pozor na predvolenú zmenu názvu z <i>master</i> na <span className="Legend-label">main</span>.</div>
      <div><strong>Názov commitu:</strong> zaznamenaná správa pri publikovaní článku. Atribút <span className="Legend-label">articleName</span> bude nahradený názvom článku.</div>
      <div><strong>Cesta publikovaného článku:</strong> lokácia, na ktorú sa publikovaný článok v repozitári uloží. Prípona článku musí byť <span className="Legend-label">.md</span>.
        <ul style={{margin: '0'}}>
          <li>Atribút <span className="Legend-label">year</span> bude nahradený súčasným rokom.</li>
          <li>Atribút <span className="Legend-label">month</span> bude nahradený súčasným mesiacom.</li>
          <li>Atribút <span className="Legend-label">slug</span> bude nahradený publikačným názvom článku.</li>
        </ul>
    </div>
      <div><strong>Privátny prístupový token:</strong> hodnota <a href="https://docs.gitlab.com/ee/user/project/settings/project_access_tokens.html">PAT</a>, ktorý je potrebné vytvoriť v rámci nastavení repozitára. Pre správne fungovanie je dôležité zvoliť scope <span className="Legend-label">api</span>.</div>
    </div>

  </>;

  const userRolesAdministrationPart = <div> nic zatial</div>;
  return (
      <>
        <div className="Administration-header">
          <div className="Back-to-dashboard" onClick={onRedirectToDashboard}>
            <span>Späť na zoznam článkov</span>
          </div>
        </div>
        <hr className="Administration-header-divider"/>
        <div className="Administration-content">
          <Tabs variant="fullWidth"
                value={displayedTab}
                onChange={handleChange}
                textColor="primary"
                indicatorColor="primary">
            <Tab value="publicationConfig" label="Publikačná konfigurácia"/>
            <Tab value="userRoles" label="Správa používateľských rolí"/>
          </Tabs>
          {displayedTab === 'publicationConfig'
              ? publicationConfigPart : userRolesAdministrationPart}
        </div>

        <MuiMessage severity={muiMessage.severity} open={muiMessage.open}
                    onCloseMuiMessage={closeMuiMessage}
                    message={muiMessage.message}/>
      </>
  );
};

export default AdministrationPage;
