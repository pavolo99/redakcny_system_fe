import React from "react";
import './Login-page.css'
import GitlabLoginButton from "../../assets/gitlab-login-button.png"
import GithubLoginButton from "../../assets/github-login-button.png"

export default function LoginPage() {

  return (
      <div>
        <div className="Login-box">
          <h1 className="Login-header">Prihlásenie</h1>
          <div className="Login-providers">
            <a href={process.env.REACT_APP_BECKEND_API_URL + '/oauth/login/github'}>
              <img src={GithubLoginButton} alt="Prihlásenie cez Github"
                   className="Github-provider"/>
            </a>
            <a href={process.env.REACT_APP_BECKEND_API_URL + '/oauth/login/gitlab'}>
              <img src={GitlabLoginButton} alt="Prihlásenie cez GitLab"
                   className="Gitlab-provider"/>
            </a>
          </div>
        </div>
      </div>
  );
}
