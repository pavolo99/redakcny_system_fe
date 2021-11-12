import React from "react";
import './Login-page.css'
import GitlabLoginButton from "../../assets/gitlab-login-button.png"
import GithubLoginButton from "../../assets/github-login-button.png"
import {apiUrl} from "../../components/environment/environment";

export default function LoginPage() {

  return (
      <div>
        <div className="Login-box">
          <h1 className="Login-header">Prihlásenie</h1>
          <div className="Login-providers">
            <a href={apiUrl + '/oauth/login/github'}>
              <img src={GithubLoginButton} alt="Github login button"
                   className="Github-provider"/>
            </a>
            <a href={apiUrl + '/oauth/login/gitlab'}>
              <img src={GitlabLoginButton} alt="Gitlab login button"
                   className="Gitlab-provider"/>
            </a>
          </div>
        </div>
      </div>
  );
}
