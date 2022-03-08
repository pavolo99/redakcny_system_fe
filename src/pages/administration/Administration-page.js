import React, {useEffect, useState} from "react";
import './Administration-page.css'
import {useHistory} from "react-router-dom";
import axios from "axios";
import {generateHSLColorBasedOnUserInfo, getFullName, getUserValue, handle401Error} from "../../shared/Utils";
import {Checkbox, InputLabel, Select, Tab, Tabs} from "@mui/material";
import {Button, makeStyles, TextField} from "@material-ui/core";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import {MuiMessage} from "../../components/mui-message/Mui-message";
import Avatar from "react-avatar";

const useStyles = makeStyles(() => ({
  root: {}
}));

const AdministrationPage = () => {
  const history = useHistory();
  const [displayedTab, setDisplayedTab] = React.useState('publicationConfig');
  const [privateTokenVisibility, setPrivateTokenVisibility] = React.useState(false);
  const [users, setUsers] = React.useState([]);
  const [publicationConfig, setPublicationConfig] = React.useState({
    id: null,
    domain: '',
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

  function fetchUsersForAdmin() {
    axios.get(process.env.REACT_APP_BECKEND_API_URL + '/administration/users')
    .catch(error => handle401Error(error, history))
    .then(response => {
      if (response) {
        setUsers(response.data);
      }
    });
  }

  useEffect(() => {
    if (displayedTab === 'publicationConfig') {
      axios.get(process.env.REACT_APP_BECKEND_API_URL + '/administration/publication-config')
      .catch(error => handle401Error(error, history))
      .then(response => {
        if (response) {
          const resData = response.data;
          setPublicationConfig({
            id: resData.id == null ? '' : resData.id,
            domain: resData.domain == null ? '' : resData.domain,
            branch: resData.branch == null ? '' : resData.branch,
            commitMessage: resData.commitMessage == null ? '' : resData.commitMessage,
            pathToArticle: resData.pathToArticle == null ? '' : resData.pathToArticle,
            privateToken: resData.privateToken == null ? '' : resData.privateToken,
            repositoryPath: resData.repositoryPath == null ? '' : resData.repositoryPath
          });
        }
      });
    } else {
      fetchUsersForAdmin();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayedTab])

  const onInputsValueChange = e => {
    setPublicationConfig({...publicationConfig, [e.target.name]: e.target.value})
  }

  function onDomainValueChange(event) {
    setPublicationConfig({...publicationConfig, domain: event.target.value})
  }

  function onSavePublicationConfig() {
    axios.put(process.env.REACT_APP_BECKEND_API_URL + '/administration/publication-config/' + publicationConfig.id, createPublicationConfigObject())
    .catch(error => handle401Error(error, history))
    .then(response => {
      if (response) {
        setMuiMessage({severity: 'success', open: true, message: 'Konfigurácia bola úspešne uložená'})
      }
    })
  }

  function onTestPublicationConfigConnection() {
    axios.put(process.env.REACT_APP_BECKEND_API_URL + '/administration/publication-config/test', createPublicationConfigObject())
    .catch(error => {
      handle401Error(error, history);
      setMuiMessage({severity: 'error', open: true, message: 'Spojenie neprebehlo úspešne. Skontrolujte prosím privátny token a cestu k projektu'})
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
      domain: publicationConfig.domain,
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
                   style={{width: "49%"}}>
        <InputLabel id="domain-label">Doména a poskytovateľ</InputLabel>
        <Select labelId="domain-label"
                className={useStyles().root}
                onChange={onDomainValueChange}
                value={publicationConfig.domain}>
          {/*TODO extend publication config to other domains as well*/}
          <MenuItem value="GIT_KPI_FEI_TUKE_SK">https://git.kpi.fei.tuke.sk (GITLAB)</MenuItem>
          <MenuItem value="GITLAB" disabled>https://gitlab.com (GITLAB)</MenuItem>
          <MenuItem value="GITHUB" disabled>https://github.com (GITHUB)</MenuItem>
        </Select>
      </FormControl>

      <TextField label="Cesta alebo identifikátor projektového repozitára"
                 inputProps={{maxLength: 70}} style={{width: "49%"}}
                 value={publicationConfig.repositoryPath} variant="filled"
                 onChange={onInputsValueChange} name="repositoryPath"/>
    </div>
    <div className="Publication-config-legend-row">

      <div style={{width: '49%'}}>
        <strong>Doména:</strong> konkrétna URL adresa poskytovateľa, na ktorej bude sídliť repozitár.
      </div>
      <div style={{width: '49%'}}>
        <strong>Cesta alebo identifikátor (ID) projektového repozitára:</strong> kľúčový údaj pre špecifikáciu repozitára, do ktorého budú články publikované.
      </div>
    </div>
    <div className="Publication-config-row">

      <TextField label="Súkromný prístupový token" variant="filled"
                 value={publicationConfig.privateToken} style={{width: "49%"}}
                 onChange={onInputsValueChange} name="privateToken"
                 inputProps={{maxLength: 70}}
                 type={privateTokenVisibility ? 'text' : 'password'}/>

      <TextField label="Cesta publikovaného článku" variant="filled"
                 value={publicationConfig.pathToArticle}
                 style={{width: "49%"}} inputProps={{maxLength: 70}}
                 onChange={onInputsValueChange} name="pathToArticle"/>
    </div>
    <div className="Publication-config-legend-row">
      <div style={{width: '49%'}}>
        <strong>Súkromný prístupový token:</strong> hodnota <a href="https://docs.gitlab.com/ee/user/project/settings/project_access_tokens.html">PAT</a>,
        ktorý je potrebné vytvoriť v rámci nastavení repozitára. Pre správne fungovanie je dôležité zvoliť scope <span className="Legend-label">api</span>.      </div>
      <div style={{width: '49%'}}>
          <strong>Cesta publikovaného článku:</strong> lokácia, na ktorú sa publikovaný článok v repozitári uloží. Prípona článku musí byť <span className="Legend-label">.md</span>.
          <ul style={{margin: '0'}}>
            <li>Atribút <span className="Legend-label">year</span> bude nahradený súčasným rokom.</li>
            <li>Atribút <span className="Legend-label">month</span> bude nahradený súčasným mesiacom.</li>
            <li>Atribút <span className="Legend-label">slug</span> (názov zverejneného súboru) bude nahradený publikačným názvom článku.</li>
          </ul>
      </div>
    </div>
    <div className="Publication-config-legend-row">
      <div style={{width: '49%'}}>
      </div>
    </div>
    <div className="Publication-config-row">
      <TextField label="Názov vetvy" variant="filled" style={{width: "49%"}}
                 value={publicationConfig.branch} name="branch"
                 onChange={onInputsValueChange} inputProps={{maxLength: 70}}/>
      <TextField label="Názov commitu" variant="filled" style={{width: "49%"}}
                 value={publicationConfig.commitMessage} name="commitMessage"
                 onChange={onInputsValueChange} inputProps={{maxLength: 70}}/>

    </div>
    <div className="Publication-config-legend-row">
      <div style={{width: '49%'}}>
        <strong>Vetva:</strong> názov vetvy, v ktorej má byť článok publikovaný - Pozor na predvolenú zmenu názvu z <i>master</i> na <span className="Legend-label">main</span>.
      </div>
      <div style={{width: '49%'}}>
        <strong>Názov commitu:</strong> zaznamenaná správa pri publikovaní článku. Atribút <span className="Legend-label">articleName</span> bude nahradený názvom článku.
      </div>
    </div>

    <div className="Action-buttons">
      <Button className="Show-private-token-button" onClick={onTogglePrivateTokenVisibility}>{privateTokenVisibility ? 'Skryť' : 'Zobraziť'} privátny token</Button>
      <Button className="Test-button" onClick={onTestPublicationConfigConnection}>Otestovať spojenie s repozitárom</Button>
      <Button className="Save-button" onClick={onSavePublicationConfig}>Uložiť konfiguráciu</Button>
    </div>

  </>;

  function onRoleValueChange(checkedValue, user, checkedRoleType) {
    axios.put(process.env.REACT_APP_BECKEND_API_URL + '/administration/users/' + user.id, {
      id: user.id,
      editor: checkedRoleType === 'editor' ? checkedValue : user.editor,
      administrator: checkedRoleType === 'administrator' ? checkedValue : user.administrator
    })
    .catch(error => handle401Error(error, history))
    .then(response => {
      if (response) {
        setMuiMessage({severity: 'success', open: true, message: 'Používateľove práva boli úspešne zmenené'})
        fetchUsersForAdmin();
      }
    })
  }

  const loggedUserId = JSON.parse(localStorage.getItem('loggedUser')).id;

  const userRolesAdministrationPart = <>
    <div className="Users-content">
      {users.map(user => (
          <div className="User-row" key={user.id}>
              <div className="Avatar-flex-row">
                <Avatar name={getFullName(user)} fgColor="white"
                        round={true} size="40" className="Avatar"
                        color={generateHSLColorBasedOnUserInfo(getUserValue(user))}/>
                <div>
                  <div>{getFullName(user)}</div>
                  <div>{user.email}</div>
                </div>
              </div>
              <div className="User-column-additional-info">
                {user.username} ({user.authProvider})
              </div>
              <div className="User-column-role">
                <Checkbox checked={user.editor}
                          onChange={(event) => onRoleValueChange(event.target.checked, user, "editor")}/>
                Redaktor
              </div>
              <div className="User-column-role">
                <Checkbox checked={user.administrator} disabled={loggedUserId === user.id}
                          onChange={(event) => onRoleValueChange(event.target.checked, user, "administrator")}/>
                Administrátor
              </div>
          </div>
      ))}
    </div>
  </>;

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
