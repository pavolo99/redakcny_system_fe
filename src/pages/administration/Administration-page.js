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
import Back from "../../assets/back.svg"

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
        setMuiMessage({severity: 'success', open: true, message: 'Konfigur??cia bola ??spe??ne ulo??en??'})
      }
    })
  }

  function onTestPublicationConfigConnection() {
    axios.put(process.env.REACT_APP_BECKEND_API_URL + '/administration/publication-config/test', createPublicationConfigObject())
    .catch(error => {
      handle401Error(error, history);
      setMuiMessage({severity: 'error', open: true, message: 'Spojenie neprebehlo ??spe??ne. Skontrolujte pros??m priv??tny token a cestu k projektu'})
    })
    .then(response => {
      if (response) {
        setMuiMessage({severity: 'success', open: true, message: 'Spojenie prebehlo ??spe??ne - predvolen?? vetva je ' + response.data.default_branch})
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
        <InputLabel id="domain-label">Dom??na a poskytovate??</InputLabel>
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

      <TextField label="Cesta alebo identifik??tor projektov??ho repozit??ra"
                 inputProps={{maxLength: 70}} style={{width: "49%"}}
                 value={publicationConfig.repositoryPath} variant="filled"
                 onChange={onInputsValueChange} name="repositoryPath"/>
    </div>
    <div className="Publication-config-legend-row">

      <div style={{width: '49%'}}>
        <strong>Dom??na:</strong> konkr??tna URL adresa poskytovate??a, na ktorej bude s??dli?? repozit??r.
      </div>
      <div style={{width: '49%'}}>
        <strong>Cesta alebo identifik??tor (ID) projektov??ho repozit??ra:</strong> k??????ov?? ??daj pre ??pecifik??ciu repozit??ra, do ktor??ho bud?? ??l??nky publikovan??.
      </div>
    </div>
    <div className="Publication-config-row">

      <TextField label="S??kromn?? pr??stupov?? token" variant="filled"
                 value={publicationConfig.privateToken} style={{width: "49%"}}
                 onChange={onInputsValueChange} name="privateToken"
                 inputProps={{maxLength: 70}}
                 type={privateTokenVisibility ? 'text' : 'password'}/>

      <TextField label="Cesta publikovan??ho ??l??nku" variant="filled"
                 value={publicationConfig.pathToArticle}
                 style={{width: "49%"}} inputProps={{maxLength: 70}}
                 onChange={onInputsValueChange} name="pathToArticle"/>
    </div>
    <div className="Publication-config-legend-row">
      <div style={{width: '49%'}}>
        <strong>S??kromn?? pr??stupov?? token:</strong> hodnota <a href="https://docs.gitlab.com/ee/user/project/settings/project_access_tokens.html">PAT</a>,
        ktor?? je potrebn?? vytvori?? v r??mci nastaven?? repozit??ra. Pre spr??vne fungovanie je d??le??it?? zvoli?? scope <span className="Legend-label">api</span>.      </div>
      <div style={{width: '49%'}}>
          <strong>Cesta publikovan??ho ??l??nku:</strong> lok??cia, na ktor?? sa publikovan?? ??l??nok v repozit??ri ulo????. Pr??pona ??l??nku mus?? by?? <span className="Legend-label">.md</span>.
          <ul style={{margin: '0'}}>
            <li>Atrib??t <span className="Legend-label">year</span> bude nahraden?? s????asn??m rokom.</li>
            <li>Atrib??t <span className="Legend-label">month</span> bude nahraden?? s????asn??m mesiacom.</li>
            <li>Atrib??t <span className="Legend-label">slug</span> (n??zov zverejnen??ho s??boru) bude nahraden?? publika??n??m n??zvom ??l??nku.</li>
          </ul>
      </div>
    </div>
    <div className="Publication-config-legend-row">
      <div style={{width: '49%'}}>
      </div>
    </div>
    <div className="Publication-config-row">
      <TextField label="N??zov vetvy" variant="filled" style={{width: "49%"}}
                 value={publicationConfig.branch} name="branch"
                 onChange={onInputsValueChange} inputProps={{maxLength: 70}}/>
      <TextField label="N??zov commitu" variant="filled" style={{width: "49%"}}
                 value={publicationConfig.commitMessage} name="commitMessage"
                 onChange={onInputsValueChange} inputProps={{maxLength: 70}}/>

    </div>
    <div className="Publication-config-legend-row">
      <div style={{width: '49%'}}>
        <strong>Vetva:</strong> n??zov vetvy, v ktorej m?? by?? ??l??nok publikovan?? - Pozor na predvolen?? zmenu n??zvu z <i>master</i> na <span className="Legend-label">main</span>.
      </div>
      <div style={{width: '49%'}}>
        <strong>N??zov commitu:</strong> zaznamenan?? spr??va pri publikovan?? ??l??nku. Atrib??t <span className="Legend-label">articleName</span> bude nahraden?? n??zvom ??l??nku.
      </div>
    </div>

    <div className="Action-buttons">
      <Button className="Show-private-token-button" onClick={onTogglePrivateTokenVisibility}>{privateTokenVisibility ? 'Skry??' : 'Zobrazi??'} priv??tny token</Button>
      <Button className="Test-button" onClick={onTestPublicationConfigConnection}>Otestova?? spojenie s repozit??rom</Button>
      <Button className="Save-button" onClick={onSavePublicationConfig}>Ulo??i?? konfigur??ciu</Button>
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
        setMuiMessage({severity: 'success', open: true, message: 'Pou????vate??ove pr??va boli ??spe??ne zmenen??'})
        fetchUsersForAdmin();
      }
    })
  }

  const loggedUserId = JSON.parse(localStorage.getItem('loggedUser')).id;

  const userRolesAdministrationPart = <>
    <div className="Users-content">
      <h4>Ak zmen??te pr??va pou????vate??ovi, ktor?? je pr??ve prihl??sen??, tak je
        potrebn??, aby sa odhl??sil a op??tovne prihl??sil.</h4>
      {users.map(user => (
          <div className="User-row" key={user.id}>
              <div className="Avatar-flex-row">
                <Avatar name={getFullName(user)} fgColor="white" style={{cursor: 'default'}}
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
                Administr??tor
              </div>
          </div>
      ))}
    </div>
  </>;

  return (
      <>
        <div className="Administration-header">
          <div className="Back" onClick={onRedirectToDashboard}>
            <img src={Back} alt="Sp???? na zoznam ??l??nkov" title="Sp???? na zoznam ??l??nkov"/>
          </div>
        </div>
        <hr className="Administration-header-divider"/>
        <div className="Administration-content">
          <Tabs variant="standard"
                value={displayedTab}
                onChange={handleChange}
                textColor="primary"
                indicatorColor="primary">
            <Tab value="publicationConfig" label="Publika??n?? konfigur??cia" style={{textTransform: 'none'}}/>
            <Tab value="userRoles" label="Pou????vatelia" style={{textTransform: 'none'}}/>
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
